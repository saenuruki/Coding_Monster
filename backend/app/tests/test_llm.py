"""
Test script for LLM event generation with updated models.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.llm.prompts import build_event_prompt, get_system_prompt, get_json_schema
from app.llm.gemini_client import generate_response
from app.models import Event

def test_prompts():
    """Test prompt generation."""
    print("=== Testing Prompt Generation ===\n")

    # Test JSON schema
    print("1. JSON Schema:")
    schema = get_json_schema()
    print(schema)
    print("\n")

    # Test system prompt
    print("2. System Prompt (first 500 chars):")
    sys_prompt = get_system_prompt()
    print(sys_prompt[:500] + "...\n")

    # Test event prompt
    print("3. Event Prompt for Day 5:")
    event_prompt = build_event_prompt(5)
    print(event_prompt[:500] + "...\n")

def test_event_generation():
    """Test actual event generation."""
    print("\n=== Testing Event Generation ===\n")

    day = 5
    prompt = build_event_prompt(day)

    print(f"Generating event for day {day}...")
    result = generate_response(prompt)

    print("\nRaw result:")
    print(result)

    # Try to parse as Event model
    print("\n\nParsing as Event model:")
    try:
        event = Event(**result)
        print(f"✓ Successfully parsed as Event model")
        print(f"Event ID: {event.event_id}")
        print(f"Description: {event.description}")
        print(f"Number of options: {len(event.options)}")
        for i, option in enumerate(event.options):
            print(f"\nOption {i+1}:")
            print(f"  Description: {option.description}")
            print(f"  Impact: {option.impact}")
    except Exception as e:
        print(f"✗ Failed to parse: {e}")

if __name__ == "__main__":
    test_prompts()
    test_event_generation()
