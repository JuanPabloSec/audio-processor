"""Security and validation utilities"""

from fastapi import UploadFile, HTTPException
import magic
from app.config import settings


ALLOWED_MIME_TYPES = {
    "audio/mpeg",
    "audio/mp3",
}


async def validate_audio_file(file: UploadFile) -> bool:
    """
    Validate uploaded audio file

    Args:
        file: The uploaded file

    Returns:
        True if valid

    Raises:
        HTTPException: If file is invalid
    """
    # Read first 2KB to check MIME type
    content = await file.read(2048)
    await file.seek(0)  # Reset file pointer

    # Check MIME type using python-magic (not just extension)
    mime = magic.from_buffer(content, mime=True)

    if mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file format. Only MP3 files are allowed. Detected: {mime}"
        )

    # Check file size
    await file.seek(0, 2)  # Seek to end
    size = await file.tell()
    await file.seek(0)  # Reset to beginning

    if size > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {settings.max_file_size_mb}MB"
        )

    if size == 0:
        raise HTTPException(
            status_code=400,
            detail="File is empty"
        )

    return True


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal

    Args:
        filename: Original filename

    Returns:
        Sanitized filename
    """
    # Remove path components
    filename = filename.split("/")[-1].split("\\")[-1]

    # Remove potentially dangerous characters
    allowed_chars = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._- ")
    filename = "".join(c for c in filename if c in allowed_chars)

    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit(".", 1) if "." in filename else (filename, "")
        filename = name[:250] + (f".{ext}" if ext else "")

    return filename or "unnamed"
