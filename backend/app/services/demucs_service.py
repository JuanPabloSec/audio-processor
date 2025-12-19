"""Demucs service for audio source separation"""

import torch
import torchaudio
from pathlib import Path
from typing import Dict, Optional
import asyncio
from concurrent.futures import ThreadPoolExecutor

from demucs.pretrained import get_model
from demucs.apply import apply_model
from demucs.audio import save_audio

from app.services.storage_service import storage_service
from app.services.task_manager import task_manager


class DemucsService:
    """Service for separating audio into stems using Demucs"""

    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.model_name = None
        self.executor = ThreadPoolExecutor(max_workers=2)

        print(f"DemucsService initialized with device: {self.device}")

    def load_model(self, model_name: str = "htdemucs"):
        """
        Lazy load Demucs model

        Args:
            model_name: Model name (htdemucs, htdemucs_ft, etc.)
        """
        if self.model is None or self.model_name != model_name:
            print(f"Loading Demucs model: {model_name}")
            self.model = get_model(model_name)
            self.model.to(self.device)
            self.model_name = model_name
            print(f"Model loaded: {model_name}")

    def _separate_sync(
        self,
        input_path: Path,
        output_dir: Path,
        model_name: str,
        task_id: str,
    ) -> Dict[str, str]:
        """
        Synchronous separation (runs in thread pool)

        Args:
            input_path: Path to input audio file
            output_dir: Directory to save separated stems
            model_name: Demucs model name
            task_id: Task ID for progress updates

        Returns:
            Dictionary mapping stem names to file IDs
        """
        # Load model
        self.load_model(model_name)

        # Update progress
        asyncio.run(
            task_manager.update_task(
                task_id,
                progress=0.1,
                message="Loading audio file...",
            )
        )

        # Load audio
        wav, sr = torchaudio.load(str(input_path))

        # Ensure audio is stereo
        if wav.shape[0] == 1:
            wav = wav.repeat(2, 1)

        # Convert to the model's sample rate if needed
        if sr != self.model.samplerate:
            resampler = torchaudio.transforms.Resample(sr, self.model.samplerate)
            wav = resampler(wav)
            sr = self.model.samplerate

        asyncio.run(
            task_manager.update_task(
                task_id,
                progress=0.2,
                message="Processing audio with Demucs...",
            )
        )

        # Move audio to device
        wav = wav.to(self.device)

        # Add batch dimension and process
        ref = wav.mean(0)
        wav = (wav - ref.mean()) / ref.std()

        asyncio.run(
            task_manager.update_task(
                task_id,
                progress=0.3,
                message="Separating sources (this may take a few minutes)...",
            )
        )

        # Apply model
        with torch.no_grad():
            sources = apply_model(
                self.model,
                wav.unsqueeze(0),
                device=self.device,
                shifts=1,
                split=True,
                overlap=0.25,
                progress=False,
            )[0]

        # Restore original scale
        sources = sources * ref.std() + ref.mean()

        asyncio.run(
            task_manager.update_task(
                task_id,
                progress=0.8,
                message="Saving separated tracks...",
            )
        )

        # Get stem names from model
        # htdemucs has: drums, bass, other, vocals
        stem_names = self.model.sources

        # Save each stem
        result = {}
        output_dir.mkdir(parents=True, exist_ok=True)

        for i, stem_name in enumerate(stem_names):
            # Generate file ID for this stem
            stem_file_id = f"{input_path.stem}_{stem_name}"
            stem_path = output_dir / f"{stem_file_id}.mp3"

            # Get the separated source
            source = sources[i].cpu()

            # Save as MP3 using torchaudio
            torchaudio.save(
                str(stem_path),
                source,
                sr,
                format="mp3",
                bits_per_sample=320,
            )

            result[stem_name] = stem_file_id

        asyncio.run(
            task_manager.update_task(
                task_id,
                progress=0.95,
                message="Finalizing...",
            )
        )

        return result

    async def separate_audio(
        self,
        file_id: str,
        model_name: str = "htdemucs",
        task_id: Optional[str] = None,
    ) -> Dict[str, str]:
        """
        Separate audio into stems (async wrapper)

        Args:
            file_id: ID of the uploaded audio file
            model_name: Demucs model to use
            task_id: Task ID for progress tracking

        Returns:
            Dictionary mapping stem names to file IDs
        """
        # Get input file path
        input_path = storage_service.get_file_path(file_id, directory="upload")
        if not input_path:
            raise FileNotFoundError(f"File {file_id} not found")

        # Output directory
        output_dir = storage_service.processed_dir

        # Run separation in thread pool (blocking operation)
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            self.executor,
            self._separate_sync,
            input_path,
            output_dir,
            model_name,
            task_id,
        )

        return result


# Global instance
demucs_service = DemucsService()
