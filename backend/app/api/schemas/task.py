"""Pydantic schemas for task management"""

from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime


class TaskStatus(str, Enum):
    """Task status enum"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskResponse(BaseModel):
    """Response model for task status"""
    task_id: str
    status: TaskStatus
    progress: float = Field(ge=0.0, le=1.0, description="Progress from 0.0 to 1.0")
    message: Optional[str] = None
    result: Optional[dict[str, Any]] = None
    error: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class TaskCreate(BaseModel):
    """Model for creating a new task"""
    task_id: str
    status: TaskStatus = TaskStatus.PENDING
    progress: float = 0.0
    message: Optional[str] = None
