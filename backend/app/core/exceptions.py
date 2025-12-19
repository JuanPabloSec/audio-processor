"""Custom exceptions for the application"""


class AudioProcessingError(Exception):
    """Base exception for audio processing errors"""
    pass


class InvalidAudioFileError(AudioProcessingError):
    """Raised when audio file is corrupted or invalid"""
    pass


class FileNotFoundError(AudioProcessingError):
    """Raised when a file is not found"""
    pass


class TaskNotFoundError(AudioProcessingError):
    """Raised when a task is not found"""
    pass


class ProcessingTimeoutError(AudioProcessingError):
    """Raised when processing takes too long"""
    pass
