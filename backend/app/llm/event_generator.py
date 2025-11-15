"""
Event generator module for life simulation game.
Generates day-based events with choices and parameter impacts.
"""

from ..models import Game
from .gemini_client import generate_response
from .prompts import build_event_prompt


def generate_event(game_state: Game) -> dict:
    """
    Generate an event based on the current game state using LLM.

    Args:
        game_state: Current Game object with all stats and properties

    Returns:
        dict: Event with description and options, each with impacts
    """
    prompt = build_event_prompt(game_state)
    return generate_response(prompt)
