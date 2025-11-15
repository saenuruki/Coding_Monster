"""
Event generator module for life simulation game.
Generates day-based events with choices and parameter impacts.
"""

from .gemini_client import generate_response


def generate_event(day: int) -> dict:
    """
    Generate an event based on the current day.

    Args:
        day: Current day number in the game

    Returns:
        dict: Event with description and 3 choices, each with impacts
    """
    # Mock events for different days
    mock_events = {
        1: {
            "description": "It's your first day in the city! You feel excited and nervous about your new life.",
            "choices": [
                {
                    "id": 1,
                    "text": "Explore the neighborhood and meet new people",
                    "impact": {
                        "health": 2,
                        "happiness": 5,
                        "money": -5,
                        "energy": -3,
                        "social": 8,
                        "career": 0
                    }
                },
                {
                    "id": 2,
                    "text": "Focus on organizing your apartment",
                    "impact": {
                        "health": 1,
                        "happiness": 3,
                        "money": 0,
                        "energy": -2,
                        "social": 0,
                        "career": 0
                    }
                },
                {
                    "id": 3,
                    "text": "Start preparing for your new job tomorrow",
                    "impact": {
                        "health": 0,
                        "happiness": 2,
                        "money": 0,
                        "energy": -1,
                        "social": 0,
                        "career": 5
                    }
                }
            ]
        },
        2: {
            "description": "Your colleague invites you to lunch. They seem friendly and chatty.",
            "choices": [
                {
                    "id": 1,
                    "text": "Accept and have lunch together",
                    "impact": {
                        "health": 0,
                        "happiness": 4,
                        "money": -10,
                        "energy": 1,
                        "social": 6,
                        "career": 2
                    }
                },
                {
                    "id": 2,
                    "text": "Politely decline and work through lunch",
                    "impact": {
                        "health": -2,
                        "happiness": -1,
                        "money": 5,
                        "energy": -2,
                        "social": -3,
                        "career": 5
                    }
                },
                {
                    "id": 3,
                    "text": "Suggest a quick coffee break instead",
                    "impact": {
                        "health": 0,
                        "happiness": 2,
                        "money": -3,
                        "energy": 2,
                        "social": 3,
                        "career": 1
                    }
                }
            ]
        },
        3: {
            "description": "It's Friday evening. You receive your first paycheck and feel accomplished.",
            "choices": [
                {
                    "id": 1,
                    "text": "Treat yourself to a nice dinner",
                    "impact": {
                        "health": 3,
                        "happiness": 7,
                        "money": -20,
                        "energy": 2,
                        "social": 0,
                        "career": 0
                    }
                },
                {
                    "id": 2,
                    "text": "Save the money and cook at home",
                    "impact": {
                        "health": 2,
                        "happiness": 1,
                        "money": 10,
                        "energy": -1,
                        "social": 0,
                        "career": 0
                    }
                },
                {
                    "id": 3,
                    "text": "Invite friends over for a potluck party",
                    "impact": {
                        "health": 1,
                        "happiness": 6,
                        "money": -8,
                        "energy": -2,
                        "social": 7,
                        "career": 0
                    }
                }
            ]
        }
    }

    # Get event for specific day or use default
    if day in mock_events:
        return mock_events[day]

    # For days not in mock_events, use a generic event
    # In the future, this will call the LLM
    prompt = f"Generate event for day {day}"
    return generate_response(prompt)
