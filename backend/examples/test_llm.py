"""
Simple test script for LLM module.
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from llm.event_generator import generate_event
import json


def test_mock_mode():
    """Test event generation in mock mode."""
    print("Testing LLM module in MOCK mode...")
    print("-" * 50)

    for day in [1, 2, 3, 4]:
        print(f"\nDay {day}:")
        event = generate_event(day)
        print(json.dumps(event, indent=2, ensure_ascii=False))
        print("-" * 50)


if __name__ == "__main__":
    test_mock_mode()
