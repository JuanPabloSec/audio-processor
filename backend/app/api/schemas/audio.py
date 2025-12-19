"""Pydantic schemas for audio operations"""

from pydantic import BaseModel, Field
from typing import Literal, Optional


class AudioResponse(BaseModel):
    """Response model for audio file info"""
    file_id: str
    filename: str
    duration: Optional[float] = None
    sample_rate: Optional[int] = None
    channels: Optional[int] = None
    file_size: int


class SeparationRequest(BaseModel):
    """Request to separate audio into stems"""
    file_id: str
    model: Literal["htdemucs", "htdemucs_ft"] = "htdemucs"
    stems: Literal[2, 4] = 4  # 2: vocals/accompaniment, 4: vocals/drums/bass/other


class TransposeRequest(BaseModel):
    """Request to transpose audio pitch"""
    file_id: str
    semitones: int = Field(ge=-12, le=12, description="Number of semitones to transpose (-12 to +12)")


class TempoRequest(BaseModel):
    """Request to change audio tempo"""
    file_id: str
    tempo_factor: float = Field(gt=0.5, lt=2.0, description="Tempo factor (0.5x to 2.0x)")
