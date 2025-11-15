"""
Pydantic schemas for LLM event generation.
"""

from pydantic import BaseModel, Field


class ParameterImpact(BaseModel):
    """Impact on game parameters."""
    health: int = Field(ge=-10, le=10)
    happiness: int = Field(ge=-10, le=10)
    money: int = Field(ge=-10, le=10)
    energy: int = Field(ge=-10, le=10)
    social: int = Field(ge=-10, le=10)
    career: int = Field(ge=-10, le=10)


class Choice(BaseModel):
    """A single choice in an event."""
    id: int = Field(ge=1, le=3)
    text: str
    impact: ParameterImpact


class Event(BaseModel):
    """A game event with description and choices."""
    description: str
    choices: list[Choice] = Field(min_length=3, max_length=3)
