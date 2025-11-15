from pydantic import BaseModel

class GameSchema(BaseModel):
    id: int
    age: int
    gender: str
    character_name: str
    work: bool
    user_id: int

    class Config:
        from_attributes = True  

class GameStatus(BaseModel):
    user_id: int
    work: bool
    age: int
    gender: str
    character_name: str
    day: int = 1

class StartGameRequest(BaseModel):
    age: int
    gender: str
    character_name: str
    work: bool

class Impact(BaseModel):
    health: int
    happiness: int
    money: float
    stress: int
    social: int
    reputation: int
    education: int
    weekly_income: float
    weekly_expense: float
    free_time: float


class Choice(BaseModel):
    id: int
    text: str
    impact: Impact

class DayEvent(BaseModel):
    day: int
    description: str
    choices: list[Choice]

class GameEvent(BaseModel):
    event_message: str
    choices: list[Choice]


class StartGameResponse(BaseModel):
    game_id: str
    event: GameEvent


class ChoiceRequest(BaseModel):
    day: int
    choice_id: int


class ChoiceResponse(BaseModel):
    status: GameStatus
    applied_choice: Choice


class GameState:
    def __init__(self, game_id: str):
        self.game_id = game_id
        self.day = 1
        self.health = 100
        self.money = 50.0
        self.mood = 50
        self.is_over = False
