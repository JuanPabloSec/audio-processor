"""Upload endpoint for audio files"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path

from app.api.schemas.audio import AudioResponse
from app.core.security import validate_audio_file, sanitize_filename
from app.services.storage_service import storage_service
from app.core.exceptions import FileNotFoundError as AppFileNotFoundError


router = APIRouter()


@router.post("/upload", response_model=AudioResponse)
async def upload_audio(file: UploadFile = File(...)):
    """
    Upload an MP3 file

    Args:
        file: The uploaded audio file

    Returns:
        AudioResponse with file_id and metadata
    """
    # Validate file
    await validate_audio_file(file)

    # Sanitize filename
    safe_filename = sanitize_filename(file.filename or "unnamed.mp3")

    # Read file content
    file_content = await file.read()

    # Save file
    file_id, file_path = await storage_service.save_upload(file_content, safe_filename)

    # Extract audio metadata
    metadata = await storage_service.get_audio_metadata(file_path)

    return AudioResponse(
        file_id=file_id,
        filename=safe_filename,
        duration=metadata.get("duration"),
        sample_rate=metadata.get("sample_rate"),
        channels=metadata.get("channels"),
        file_size=metadata.get("file_size", len(file_content)),
    )


@router.get("/files/{file_id}", response_model=AudioResponse)
async def get_file_info(file_id: str):
    """
    Get information about an uploaded file

    Args:
        file_id: The file ID

    Returns:
        AudioResponse with file metadata
    """
    file_path = storage_service.get_file_path(file_id, directory="upload")

    if not file_path:
        raise HTTPException(status_code=404, detail="File not found")

    metadata = await storage_service.get_audio_metadata(file_path)

    return AudioResponse(
        file_id=file_id,
        filename=file_path.name,
        duration=metadata.get("duration"),
        sample_rate=metadata.get("sample_rate"),
        channels=metadata.get("channels"),
        file_size=metadata.get("file_size", 0),
    )


@router.get("/files/{file_id}/download")
async def download_file(file_id: str, directory: str = "upload"):
    """
    Download a file (uploaded or processed)

    Args:
        file_id: The file ID
        directory: "upload" or "processed"

    Returns:
        File download response
    """
    file_path = storage_service.get_file_path(file_id, directory=directory)

    if not file_path:
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_path,
        media_type="audio/mpeg",
        filename=file_path.name,
    )


@router.delete("/files/{file_id}")
async def delete_file(file_id: str):
    """
    Delete an uploaded file

    Args:
        file_id: The file ID

    Returns:
        Success message
    """
    deleted = await storage_service.delete_file(file_id, directory="upload")

    if not deleted:
        raise HTTPException(status_code=404, detail="File not found")

    return {"message": "File deleted successfully"}
