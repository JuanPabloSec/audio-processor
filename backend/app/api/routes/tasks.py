"""Task status endpoints"""

from fastapi import APIRouter, HTTPException

from app.api.schemas.task import TaskResponse
from app.services.task_manager import task_manager


router = APIRouter()


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task_status(task_id: str):
    """
    Get task status and progress

    Args:
        task_id: The task ID

    Returns:
        TaskResponse with current status
    """
    task = task_manager.get_task(task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.delete("/{task_id}")
async def cancel_task(task_id: str):
    """
    Cancel a running task

    Args:
        task_id: The task ID

    Returns:
        Success message
    """
    cancelled = await task_manager.cancel_task(task_id)

    if not cancelled:
        raise HTTPException(
            status_code=400,
            detail="Task not found or already completed"
        )

    return {"message": "Task cancelled successfully"}
