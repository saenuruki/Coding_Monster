"""Test script for event_generator module"""
from app.models import Game, StaticProperties, Stats, Finances
from app.llm.event_generator import generate_event
import json

# Create a mock game state for Day 1
game_state = Game(
    user_id=1,
    game_id="test-123",
    day=1,
    static_properties=StaticProperties(
        character_name="Alice",
        gender="female",
        age=16,
        work=False
    ),
    stats=Stats(
        health=100,
        happiness=50,
        stress=10,
        reputation=0,
        education=0,
        money=50.0,
        weekly_income=0.0,
        weekly_expense=0.0,
        free_time=40.0
    ),
    finances=Finances()
)

print("Testing generate_event with Day 1...")
print("=" * 60)

event = generate_event(game_state)

print("Event generated successfully!")
print(json.dumps(event, indent=2, ensure_ascii=False))

print("\n" + "=" * 60)
print("Event structure validation:")
print(f"✓ Has 'description': {('description' in event)}")
print(f"✓ Has 'choices': {('choices' in event)}")
if 'choices' in event:
    print(f"✓ Number of choices: {len(event['choices'])}")
    for i, choice in enumerate(event['choices'], 1):
        print(f"  Choice {i}:")
        print(f"    - Has 'text': {('text' in choice)}")
        print(f"    - Has 'impact': {('impact' in choice)}")
