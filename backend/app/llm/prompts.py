"""
Prompt templates for LLM event generation.
Currently contains basic constants. Will be expanded with actual prompts later.
"""

import os


def load_scenario_strategy() -> str:
    """Load scenario strategy from markdown file."""
    strategy_path = os.path.join(os.path.dirname(__file__), "scenario_strategy.md")
    with open(strategy_path, 'r', encoding='utf-8') as f:
        return f.read()


def get_system_prompt() -> str:
    """Get the system prompt including scenario strategy."""
    base_prompt = """
You are a creative storyteller for a life simulation game.
Generate realistic daily life events with 3 meaningful choices.
Each choice should have impacts on 6 parameters: health, happiness, money, energy, social, career.
Impact values range from -10 to +10.
"""

    strategy = load_scenario_strategy()
    return base_prompt + "\n\n" + strategy

# Parameter names
PARAMETERS = ["health", "happiness", "money", "energy", "social", "career"]

# Impact range
MIN_IMPACT = -10
MAX_IMPACT = 10

# Number of choices per event
NUM_CHOICES = 3
