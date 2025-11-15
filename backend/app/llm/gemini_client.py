"""
Mock Gemini API client for development.
This will be replaced with actual Gemini API calls later.
"""

def generate_response(prompt: str) -> dict:
    """
    Mock function that returns a fixed event structure.
    In production, this will call the actual Gemini API.

    Args:
        prompt: The prompt to send to the LLM (currently unused in mock)

    Returns:
        dict: Mock event data with description and choices
    """
    # Mock response - will be replaced with actual API call
    mock_event = {
        "description": "You wake up feeling refreshed after a good night's sleep.",
        "choices": [
            {
                "id": 1,
                "text": "Go for a morning jog in the park",
                "impact": {
                    "health": 5,
                    "happiness": 3,
                    "money": 0,
                    "energy": -2,
                    "social": 0,
                    "career": 0
                }
            },
            {
                "id": 2,
                "text": "Have a hearty breakfast and head to work early",
                "impact": {
                    "health": 2,
                    "happiness": 1,
                    "money": 0,
                    "energy": 3,
                    "social": 0,
                    "career": 4
                }
            },
            {
                "id": 3,
                "text": "Sleep in for another hour",
                "impact": {
                    "health": 1,
                    "happiness": 4,
                    "money": 0,
                    "energy": 5,
                    "social": 0,
                    "career": -3
                }
            }
        ]
    }

    return mock_event
