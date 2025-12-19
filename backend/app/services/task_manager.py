"""Task manager for handling background audio processing tasks"""

import asyncio
import uuid
from datetime import datetime
from typing import Dict, Optional, Callable, Any
from enum import Enum

from app.api.schemas.task import TaskStatus, TaskResponse


class Task:
    """Internal task representation"""

    def __init__(self, task_id: str):
        self.task_id = task_id
        self.status = TaskStatus.PENDING
        self.progress = 0.0
        self.message: Optional[str] = None
        self.result: Optional[Dict[str, Any]] = None
        self.error: Optional[str] = None
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def to_response(self) -> TaskResponse:
        """Convert to API response model"""
        return TaskResponse(
            task_id=self.task_id,
            status=self.status,
            progress=self.progress,
            message=self.message,
            result=self.result,
            error=self.error,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )


class TaskManager:
    """
    Manages background tasks using asyncio

    For MVP, uses in-memory storage. For production,
    should use Redis or a database.
    """

    def __init__(self):
        self.tasks: Dict[str, Task] = {}
        self.running_tasks: Dict[str, asyncio.Task] = {}

    def create_task(self, task_id: Optional[str] = None) -> str:
        """
        Create a new task

        Args:
            task_id: Optional task ID, will generate if not provided

        Returns:
            Task ID
        """
        if task_id is None:
            task_id = str(uuid.uuid4())

        task = Task(task_id)
        self.tasks[task_id] = task
        return task_id

    async def run_task(
        self,
        task_id: str,
        func: Callable,
        *args,
        **kwargs
    ):
        """
        Run a task in the background

        Args:
            task_id: The task ID
            func: The function to run (must be async or sync)
            args: Positional arguments for func
            kwargs: Keyword arguments for func
        """
        task = self.tasks.get(task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")

        try:
            # Update status to processing
            await self.update_task(
                task_id,
                status=TaskStatus.PROCESSING,
                message="Starting processing...",
            )

            # Run the function
            if asyncio.iscoroutinefunction(func):
                result = await func(*args, task_id=task_id, **kwargs)
            else:
                result = func(*args, task_id=task_id, **kwargs)

            # Mark as completed
            await self.update_task(
                task_id,
                status=TaskStatus.COMPLETED,
                progress=1.0,
                result=result,
                message="Processing completed successfully",
            )

        except Exception as e:
            # Mark as failed
            await self.update_task(
                task_id,
                status=TaskStatus.FAILED,
                error=str(e),
                message=f"Processing failed: {str(e)}",
            )
            raise

    def start_background_task(
        self,
        task_id: str,
        func: Callable,
        *args,
        **kwargs
    ) -> asyncio.Task:
        """
        Start a task in the background without waiting

        Args:
            task_id: The task ID
            func: The function to run
            args: Positional arguments
            kwargs: Keyword arguments

        Returns:
            The asyncio Task object
        """
        async_task = asyncio.create_task(
            self.run_task(task_id, func, *args, **kwargs)
        )
        self.running_tasks[task_id] = async_task
        return async_task

    async def update_task(
        self,
        task_id: str,
        status: Optional[TaskStatus] = None,
        progress: Optional[float] = None,
        message: Optional[str] = None,
        result: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None,
    ):
        """
        Update task status

        Args:
            task_id: The task ID
            status: New status
            progress: Progress (0.0 to 1.0)
            message: Status message
            result: Result dictionary
            error: Error message
        """
        task = self.tasks.get(task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")

        if status is not None:
            task.status = status
        if progress is not None:
            task.progress = min(1.0, max(0.0, progress))
        if message is not None:
            task.message = message
        if result is not None:
            task.result = result
        if error is not None:
            task.error = error

        task.updated_at = datetime.now()

    def get_task(self, task_id: str) -> Optional[TaskResponse]:
        """
        Get task status

        Args:
            task_id: The task ID

        Returns:
            TaskResponse or None if not found
        """
        task = self.tasks.get(task_id)
        if task:
            return task.to_response()
        return None

    async def cancel_task(self, task_id: str) -> bool:
        """
        Cancel a running task

        Args:
            task_id: The task ID

        Returns:
            True if cancelled, False if not found or not running
        """
        async_task = self.running_tasks.get(task_id)
        if async_task and not async_task.done():
            async_task.cancel()
            await self.update_task(
                task_id,
                status=TaskStatus.CANCELLED,
                message="Task was cancelled",
            )
            return True
        return False

    def cleanup_old_tasks(self, max_age_seconds: int = 3600):
        """
        Remove tasks older than max_age_seconds

        Args:
            max_age_seconds: Maximum age in seconds
        """
        now = datetime.now()
        tasks_to_remove = []

        for task_id, task in self.tasks.items():
            age = (now - task.created_at).total_seconds()
            if age > max_age_seconds and task.status in [
                TaskStatus.COMPLETED,
                TaskStatus.FAILED,
                TaskStatus.CANCELLED,
            ]:
                tasks_to_remove.append(task_id)

        for task_id in tasks_to_remove:
            del self.tasks[task_id]
            if task_id in self.running_tasks:
                del self.running_tasks[task_id]


# Global instance
task_manager = TaskManager()
