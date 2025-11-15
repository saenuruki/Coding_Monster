"""
Prompt templates for LLM event generation.
"""

import os
from app.models import Event


def load_scenario_strategy() -> str:
    """Load scenario strategy from markdown file."""
    strategy_path = os.path.join(os.path.dirname(__file__), "scenario_strategy.md")
    with open(strategy_path, 'r', encoding='utf-8') as f:
        return f.read()


def get_json_schema() -> str:
    """Get JSON schema for event structure."""
    return Event.model_json_schema()


def get_system_prompt() -> str:
    """Get the system prompt including scenario strategy."""
    schema = get_json_schema()

    base_prompt = f"""You are a creative storyteller for a life simulation game.
Generate realistic daily life events with multiple meaningful choices.
Each choice should have impacts on the following parameters:
- health (0-100): physical well-being
- happiness (0-100): emotional well-being
- stress (0-100): stress level
- reputation (-100 to 100): social standing
- education (0+): education level
- money (EUR): available cash
- weekly_income (EUR): regular income per week
- weekly_expense (EUR): regular expenses per week
- free_time (hours/week): available free time

Return the response in the following JSON format:
{schema}

Make sure:
- All impacts are within valid ranges
- Description is engaging and reflects the current day"""

    strategy = load_scenario_strategy()
    return base_prompt + "\n\n" + strategy


def build_event_prompt(day: int) -> str:
    """
    Build a prompt for event generation based on day.

    Args:
        day: Current day number
        # TODO: Add history_of_choices parameter in the future
        # history_of_choices: List of past choices to create coherent narrative

    Returns:
        str: Formatted prompt for LLM
    """
    prompt = f"""{get_system_prompt()}

Current game state:
- Day: {day}

Generate a realistic daily event for day {day}.
Provide meaningful choices with appropriate parameter impacts."""

    return prompt


# Parameter names
PARAMETERS = ["health", "happiness", "stress", "reputation", "education", "money", "weekly_income", "weekly_expense", "free_time"]
