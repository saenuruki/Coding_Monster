from typing import List, Optional

from pydantic import BaseModel, Field


# =============================================================================
# Core Game & Stat Models (previously in schema.py)
# ==============================================================================

# PLEASE FOR THE LOVE OF GNOME USE THE SCHEMAS HERE AND NOT MAKE UP CRAZY ONES
# ------------------- User/Character Schemas -------------------

class StaticProperties(BaseModel):
    """Base properties for character setup, matching the database `Game` table."""
    character_name: str
    gender: str
    age: int
    work: bool
    character_avatar: Optional[str] = Field(None, description="Link to avatar image.")


class Stats(BaseModel):
    """Tracks all ongoing stat values for the player."""
    health: int = Field(100, ge=0, le=100)
    happiness: int = Field(50, ge=0, le=100)
    stress: int = Field(10, ge=0, le=100)
    reputation: int = Field(0, ge=-100, le=100)
    education: int = Field(0, ge=0)
    money: float = Field(50.0, description="Available money in EUR.")
    weekly_income: float = Field(0.0, description="Total weekly income in EUR.")
    weekly_expense: float = Field(0.0, description="Total weekly expenses in EUR.")
    free_time: float = Field(40.0, description="Free time in hours per week.")


# ------------------- Finance Schemas -------------------

class Income(BaseModel):
    source: str
    amount: float
    type: str


class Expense(BaseModel):
    source: str
    amount: float
    type: str


class SavingsAccount(BaseModel):
    type: str  # "fixed" or "flexible"
    amount: float
    interest: float  # monthly rate (e.g., 0.005 = 0.5%)


class Finances(BaseModel):
    incomes: List[Income] = []
    expenses: List[Expense] = []
    savings_account: Optional[SavingsAccount] = None


# ------------------- Action/Event Schemas -------------------

class Impact(BaseModel):
    """Describes stat changes made by an action or event - we add these on."""
    health: int = 0
    happiness: int = 0
    stress: int = 0
    reputation: int = 0
    education: int = 0
    money: float = 0.0
    weekly_income: float = 0.0
    weekly_expense: float = 0.0
    free_time: float = 0.0


class EventOption(BaseModel):
    """An option a user can choose in response to an Event."""
    description: str
    impact: Impact


class Event(BaseModel):
    """A game event with multiple options for the user to select from."""
    event_id: int
    description: str
    options: List[EventOption]


# ------------------- Game Core Schema -------------------

class Game(BaseModel):
    """The main Pydantic model representing the complete state of a game session."""
    user_id: int
    game_id: str
    day: int = 1
    static_properties: StaticProperties # this is stuff like gendah and name of char
    stats: Stats
    finances: Finances


# =============================================================================
# Database & API Models
# ==============================================================================


class GameSchema(BaseModel):
    """Schema for reading game data from the database."""
    id: int
    age: int
    gender: str
    character_name: str
    work: bool
    user_id: int
    # whatever this is (suggested by gemini lol):
    class Config:
        from_attributes = True


# ------------------- API Request/Response Models -------------------

class StartGameRequest(BaseModel):
    """Request model for starting a new game."""
    age: int
    gender: str
    character_name: str
    work: bool


class StartGameResponse(BaseModel):
    """Response model after starting a new game."""
    game_state: Game
    event: Event


class ChoiceRequest(BaseModel):
    """Request model for submitting a choice's impact."""
    impact: Impact


class ChoiceResponse(BaseModel):
    """Response model after a choice has been applied."""
    game_state: Game
