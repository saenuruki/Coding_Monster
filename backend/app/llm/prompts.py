"""
Prompt templates for LLM event generation.
"""

import os
from .schemas_tmp import Event


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
Generate realistic daily life events with 3 meaningful choices.
Each choice should have impacts on 6 parameters: health, happiness, money, energy, social, career.
Impact values range from -10 to +10.

Return the response in the following JSON format:
{schema}

Make sure:
- All choices have exactly 3 elements (id: 1, 2, 3)
- Impact values must be integers between -10 and +10
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
Provide 3 meaningful choices with appropriate parameter impacts."""

    return prompt


# Parameter names
PARAMETERS = ["health", "happiness", "money", "energy", "social", "career"]

# Impact range
MIN_IMPACT = -10
MAX_IMPACT = 10

# Number of choices per event
NUM_CHOICES = 3
