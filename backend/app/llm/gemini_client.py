"""
Gemini API client with mock/production mode support.
"""

import os
import json
from dotenv import load_dotenv

load_dotenv()

USE_MOCK = os.getenv("USE_MOCK_LLM", "true").lower() == "true"

if not USE_MOCK:
    from google import genai

    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        os.environ["GOOGLE_API_KEY"] = api_key
        client = genai.Client(api_key=api_key)
    else:
        print("Warning: GEMINI_API_KEY not found. Falling back to mock mode.")
        USE_MOCK = True


def _get_mock_event() -> dict:
    """Return a mock event for testing."""
    return {
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


def generate_response(prompt: str) -> dict:
    """
    Generate event using Gemini API or mock data.

    Args:
        prompt: The prompt to send to the LLM

    Returns:
        dict: Event data with description and choices
    """
    if USE_MOCK:
        return _get_mock_event()

    response = client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=prompt,
        config={"response_mime_type": "application/json"}
    )

    result = json.loads(response.text)
    return result
