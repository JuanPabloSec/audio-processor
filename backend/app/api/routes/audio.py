"""Audio processing endpoints"""

from fastapi import APIRouter, HTTPException

from app.api.schemas.audio import SeparationRequest, TransposeRequest, TempoRequest
from app.services.demucs_service import demucs_service
from app.services.task_manager import task_manager
from app.services.storage_service import storage_service


router = APIRouter()


@router.post("/separate")
async def separate_audio(request: SeparationRequest):
    """
    Start audio source separation task

    Args:
        request: Separation parameters

    Returns:
        Task ID for tracking progress
    """
    # Validate file exists
    if not storage_service.file_exists(request.file_id, directory="upload"):
        raise HTTPException(status_code=404, detail="File not found")

    # Create task
    task_id = task_manager.create_task()

    # Start separation in background
    task_manager.start_background_task(
        task_id,
        demucs_service.separate_audio,
        file_id=request.file_id,
        model_name=request.model,
    )

    return {"task_id": task_id, "message": "Separation task started"}


@router.post("/transpose")
async def transpose_audio(request: TransposeRequest):
    """
    Transpose audio pitch

    Args:
        request: Transpose parameters

    Returns:
        Task ID for tracking progress
    """
    # Validate file exists
    if not storage_service.file_exists(request.file_id, directory="upload"):
        raise HTTPException(status_code=404, detail="File not found")

    # TODO: Implement pitch transposition service
    # For now, return placeholder
    raise HTTPException(
        status_code=501,
        detail="Pitch transposition coming in Phase 3"
    )


@router.post("/tempo")
async def change_tempo(request: TempoRequest):
    """
    Change audio tempo

    Args:
        request: Tempo parameters

    Returns:
        Task ID for tracking progress
    """
    # Validate file exists
    if not storage_service.file_exists(request.file_id, directory="upload"):
        raise HTTPException(status_code=404, detail="File not found")

    # TODO: Implement tempo change service
    # For now, return placeholder
    raise HTTPException(
        status_code=501,
        detail="Tempo modification coming in Phase 3"
    )


@router.get("/download/{file_id}")
async def download_processed(file_id: str):
    """
    Download a processed audio file

    Args:
        file_id: The file ID (can include stem name like "original_vocals")

    Returns:
        File download
    """
    from fastapi.responses import FileResponse

    # Check in processed directory
    file_path = storage_service.get_file_path(file_id, directory="processed")

    if not file_path:
        raise HTTPException(status_code=404, detail="Processed file not found")

    return FileResponse(
        path=file_path,
        media_type="audio/mpeg",
        filename=file_path.name,
    )
