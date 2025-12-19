"""Storage service for managing uploaded and processed files"""

import aiofiles
import uuid
import librosa
import soundfile as sf
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Tuple
import asyncio
import os

from app.config import settings
from app.core.security import sanitize_filename


class StorageService:
    """Handles file storage and cleanup operations"""

    def __init__(self):
        self.upload_dir = settings.upload_dir
        self.processed_dir = settings.processed_dir

        # Create directories if they don't exist
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.processed_dir.mkdir(parents=True, exist_ok=True)

    async def save_upload(self, file_data: bytes, original_filename: str) -> Tuple[str, Path]:
        """
        Save uploaded file

        Args:
            file_data: File content as bytes
            original_filename: Original filename from upload

        Returns:
            Tuple of (file_id, file_path)
        """
        # Generate unique file ID
        file_id = str(uuid.uuid4())

        # Get file extension from original filename
        ext = Path(original_filename).suffix or ".mp3"

        # Create file path
        filename = f"{file_id}{ext}"
        file_path = self.upload_dir / filename

        # Save file
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(file_data)

        return file_id, file_path

    def get_file_path(self, file_id: str, directory: Optional[str] = "upload") -> Optional[Path]:
        """
        Get path to file by ID

        Args:
            file_id: File ID
            directory: "upload" or "processed"

        Returns:
            Path to file or None if not found
        """
        base_dir = self.upload_dir if directory == "upload" else self.processed_dir

        # Try different extensions
        for ext in [".mp3", ".wav"]:
            file_path = base_dir / f"{file_id}{ext}"
            if file_path.exists():
                return file_path

        return None

    def file_exists(self, file_id: str, directory: str = "upload") -> bool:
        """Check if file exists"""
        return self.get_file_path(file_id, directory) is not None

    async def get_audio_metadata(self, file_path: Path) -> dict:
        """
        Extract metadata from audio file

        Args:
            file_path: Path to audio file

        Returns:
            Dictionary with duration, sample_rate, channels
        """
        try:
            # Use soundfile for basic info (faster than librosa)
            info = sf.info(str(file_path))

            return {
                "duration": info.duration,
                "sample_rate": info.samplerate,
                "channels": info.channels,
                "file_size": file_path.stat().st_size,
            }
        except Exception as e:
            # Fallback to librosa
            try:
                y, sr = librosa.load(str(file_path), sr=None, mono=False)
                duration = librosa.get_duration(y=y, sr=sr)

                return {
                    "duration": duration,
                    "sample_rate": sr,
                    "channels": 1 if y.ndim == 1 else y.shape[0],
                    "file_size": file_path.stat().st_size,
                }
            except Exception as e:
                return {
                    "duration": None,
                    "sample_rate": None,
                    "channels": None,
                    "file_size": file_path.stat().st_size,
                }

    async def delete_file(self, file_id: str, directory: str = "upload") -> bool:
        """
        Delete a file

        Args:
            file_id: File ID
            directory: "upload" or "processed"

        Returns:
            True if deleted, False if not found
        """
        file_path = self.get_file_path(file_id, directory)
        if file_path and file_path.exists():
            file_path.unlink()
            return True
        return False

    async def cleanup_old_files(self, max_age_hours: int = 24):
        """
        Delete files older than specified hours

        Args:
            max_age_hours: Maximum age in hours before deletion
        """
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)

        for directory in [self.upload_dir, self.processed_dir]:
            for file_path in directory.glob("*"):
                if file_path.is_file():
                    # Get file modification time
                    mtime = datetime.fromtimestamp(file_path.stat().st_mtime)

                    if mtime < cutoff_time:
                        try:
                            file_path.unlink()
                            print(f"Deleted old file: {file_path.name}")
                        except Exception as e:
                            print(f"Error deleting {file_path.name}: {e}")

    async def get_processed_path(
        self,
        file_id: str,
        suffix: str,
        extension: str = ".mp3"
    ) -> Path:
        """
        Generate path for processed file

        Args:
            file_id: Original file ID
            suffix: Suffix to add (e.g., "vocals", "transpose_5")
            extension: File extension

        Returns:
            Path for processed file
        """
        filename = f"{file_id}_{suffix}{extension}"
        return self.processed_dir / filename


# Global instance
storage_service = StorageService()
