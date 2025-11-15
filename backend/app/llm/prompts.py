"""
Prompt templates for LLM event generation.
"""
import os
import time
from ..models import Game


def load_scenario_strategy() -> str:
    """Load scenario strategy from markdown file."""
    strategy_path = os.path.join(os.path.dirname(__file__), "scenario_strategy.md")
    try:
        with open(strategy_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return "Scenario strategy file not found."


def build_event_prompt(game_state: Game) -> str:
    """
    Builds the prompt for the LLM to generate a game event based on the current
    game state.

    Args:
        game_state: The current Pydantic Game model instance.

    Returns:
        A formatted string to be used as a prompt for the LLM.
    """
    # The event_id is generated here to ensure it's a valid timestamp,
    # and the LLM is instructed to use it.
    current_timestamp = int(time.time())

    # The main instruction block for the LLM.
    # Note: Double curly braces `{{` and `}}` are used to escape the JSON
    # structure within the f-string.
    strategy_content = load_scenario_strategy()
    prompt_template = f"""You are generating a game event for a solo-player financial literacy simulation aimed at teenagers aged 15-18. The game connects everyday choices like studying, gigs, hobbies, socializing, and managing subscriptions/jobs with changes in player stats such as health, happiness, stress, reputation, education, money, weekly income, weekly expense, and free time.

Please create ONE event described as a JSON object following this structure strictly:

{{
  "event_id": {current_timestamp},
  "description": "<A concise, engaging event narrative that introduces a financial or life scenario>",
  "options": [
    {{
      "description": "<First option the player can choose in this scenario>",
      "impact": {{
        "health": <integer between -100 and 100>,
        "happiness": <integer between -100 and 100>,
        "stress": <integer between -100 and 100>,
        "reputation": <integer between -100 and 100>,
        "education": <integer between -100 and 100>,
        "money": <float, can be negative or positive, representing EUR>,
        "weekly_income": <float, change to weekly income in EUR>,
        "weekly_expense": <float, change to weekly expenses in EUR>,
        "free_time": <float, positive or negative, hours gained or lost per week>
      }}
    }},
    {{
      "description": "<Second player option>",
      "impact": {{ ... same structure ... }}
    }},
    {{
      "description": "<Third player option (optional)>",
      "impact": {{ ... same structure ... }}
    }}
  ]
}}

Constraints and guidelines for the event:
{strategy_content}
- The event should be realistic and relatable to a teen managing personal finances.
- Include social pressure, impulsive purchase dilemmas, subscription decisions, job or study choices, or budgeting challenges.
- Keep impacts balanced: avoid overly large positive or negative values; typical impact ranges should be between -20 to 20, except money and financial values which can be larger but reasonable.
- The event narrative and options should clearly reflect possible financial literacy lessons (planning, delayed gratification, budgeting, trade-offs).
- Ensure at least two distinct options with differing impacts on stats and finances.
- Do not include any programming syntax or code; just provide the JSON object as the final output.

Output ONLY the JSON event object.

Example output:

{{
  "event_id": 1699999999,
  "description": "You see an ad for a new music streaming subscription at EUR 5/month, promising great playlists but adding to your monthly expenses.",
  "options": [
    {{
      "description": "Subscribe to the music service.",
      "impact": {{
        "health": 0,
        "happiness": 5,
        "stress": 2,
        "reputation": 0,
        "education": 0,
        "money": 0,
        "weekly_income": 0,
        "weekly_expense": 5,
        "free_time": 0
      }}
    }},
    {{
      "description": "Decide not to subscribe and save money instead.",
      "impact": {{
        "health": 0,
        "happiness": -2,
        "stress": -1,
        "reputation": 0,
        "education": 0,
        "money": 0,
        "weekly_income": 0,
        "weekly_expense": 0,
        "free_time": 0
      }}
    }}
  ]
}}

---"""

    # Add dynamic context from the current game state to help the LLM tailor the event.
    current_stats = game_state.stats.model_dump_json(indent=2)

    final_prompt = (
        f"{prompt_template}\n"
        "Here is the current state of the player to help you tailor the event:\n"
        f"Day: {game_state.day}\n"
        f"Current Stats: {current_stats}\n\n"
        "Please generate one such JSON event now."
    )

    return final_prompt
