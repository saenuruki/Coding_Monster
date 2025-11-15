"""
LLM module for event generation and parameter calculation.
"""

from .gemini_client import generate_response
from .event_generator import generate_event

__all__ = ["generate_response", "generate_event"]
