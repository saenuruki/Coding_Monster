
import pytest
from pydantic import ValidationError
from backend.app.models import Game, StaticProperties, Stats, Finances, Income, Expense

def test_game_model_instantiation_and_validation():
    """
    Tests if the main Game model and its nested Pydantic models can be 
    instantiated correctly with valid data. This verifies that the entire 
    schema is structurally sound, consistent, and types are correct.
    """
    try:
        # 1. Define sample data for all nested models
        static_props_data = {
            "character_name": "Alex",
            "gender": "non-binary",
            "age": 19,
            "work": True,
            "character_avatar": "http://example.com/avatar.png"
        }

        stats_data = {
            "health": 95,
            "happiness": 80,
            "stress": 15,
            "reputation": 20,
            "education": 10,
            "money": 1250.75,
            "weekly_income": 200.0,
            "weekly_expense": 120.50,
            "free_time": 30.0
        }

        finances_data = {
            "incomes": [{"source": "Part-time Job", "amount": 200.0, "type": "salary"}],
            "expenses": [{"source": "Groceries", "amount": 120.50, "type": "living"}],
            "savings_account": None
        }

        # 2. Create the main Game model instance
        game_instance = Game(
            user_id=101,
            game_id="test_game_abcde",
            day=10,
            is_over=False,
            static_properties=StaticProperties(**static_props_data),
            stats=Stats(**stats_data),
            finances=Finances(**finances_data)
        )

        # 3. Assert that the object was created and data is correctly assigned
        assert game_instance.user_id == 101
        assert game_instance.game_id == "test_game_abcde"
        assert game_instance.stats.money == 1250.75
        assert game_instance.static_properties.character_name == "Alex"
        assert len(game_instance.finances.incomes) == 1
        assert game_instance.finances.expenses[0].source == "Groceries"

    except ValidationError as ve:
        pytest.fail(f"Pydantic model validation failed: {ve}")
    except Exception as e:
        pytest.fail(f"An unexpected error occurred during model instantiation: {e}")

    # Test default values
    stats_with_defaults = Stats()
    assert stats_with_defaults.health == 100
    assert stats_with_defaults.money == 50.0

    print("\\n✅ All Pydantic models instantiated and validated successfully.")

        