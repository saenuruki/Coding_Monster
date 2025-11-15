import uuid
import random
from fastapi import FastAPI, HTTPException, Depends
from typing import List
import sqlite3
from sqlalchemy.orm import Session
from init_db import SessionLocal, User, Game, Day, init_db 
from models import *

app = FastAPI()
conn = sqlite3.connect("mydb.sqlite")


games: dict[str, GameState] = {}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    init_db()

def get_day_event(game: GameState, day_number: int) -> DayEvent:
    if day_number != game.day:
        raise HTTPException(
            status_code=400,
            detail=f"Сейчас день {game.day}, нельзя запрашивать событие для дня {day_number}"
        )

    description = f"День {day_number}: ты просыпаешься и решаешь, чем заняться."

    choices = [
        Choice(
            id=1,
            text="Пойти работать (деньги ↑, настроение ↓)",
            money_delta=+20,
            mood_delta=-10,
        ),
        Choice(
            id=2,
            text="Отдохнуть (настроение ↑, деньги ↓)",
            money_delta=-10,
            mood_delta=+15,
        ),
        Choice(
            id=3,
            text="Позаниматься спортом (здоровье ↑, настроение ↑, деньги 0)",
            health_delta=+10,
            mood_delta=+5,
        ),
    ]

    return DayEvent(day=day_number, description=description, choices=choices)


def apply_choice(game: GameState, choice: Choice):
    game.health += choice.health_delta
    game.money += choice.money_delta
    game.mood += choice.mood_delta

    if game.health <= 0 or game.money < -50 or game.mood <= -20:
        game.is_over = True

    if not game.is_over:
        game.day += 1


def to_status(game: GameState) -> GameStatus:
    return GameStatus(
        game_id=game.game_id,
        day=game.day,
        health=game.health,
        money=game.money,
        mood=game.mood,
        is_over=game.is_over,
    )

def call_llm_for_start(payload: StartGameRequest) -> GameEvent:
    'Delete code here and add llm module response generation'

    event_message = (
        f"Тебе {payload.age} лет, тебя зовут {payload.character_name}. "
        f"Сегодня твой первый день {'на новой работе' if payload.work else 'без работы'}. "
        f"Как ты поступишь?"
    )

    choices = [
        Choice(id=1, text="Пойти на работу пораньше и подготовиться.", impact=10),
        Choice(id=2, text="Выспаться и прийти ровно к началу рабочего дня.", impact=0),
        Choice(id=3, text="Опоздать и зайти тихо, надеясь, что никто не заметит.", impact=-5),
        Choice(id=4, text="Сделать вид, что заболел(а), и остаться дома.", impact=-10),
    ]

    return GameEvent(event_message=event_message, choices=choices)

@app.post("/api/game/start", response_model=StartGameResponse)
async def start_game(body: StartGameRequest, db: Session = Depends(get_db)):
    game_id = str(uuid.uuid4())
    user = User()
    db.add(user)
    db.flush()
    game = Game(
        age=body.age,
        gender=body.gender,
        character_name=body.character_name,
        work=body.work,
        user_id=user.id,
    )
    db.add(game)
    db.flush()
    initial_day = Day(
        game_id=game.id,
        number_of_day=1,
        health=random.randint(60, 90),
        happiness=random.randint(60, 90),
        stress=random.randint(60, 90),
        reputation=random.randint(60, 90),
        education=random.randint(60, 90),
        money=400,
        weekly_income=random.randint(60, 90),
        weekly_expense=random.randint(60, 90),
        free_time=10,
    )
    db.add(initial_day)

    db.commit()

    db.refresh(user)
    db.refresh(game)
    db.refresh(initial_day)
    
    event = call_llm_for_start(body)

    games[game_id] = GameState(game_id=game_id, params=body, event=event)

    return StartGameResponse(
        game_id=game_id,
        event=event
    )


# GET /api/game/{game_id}/day/{day_number} - Get event for specified day
@app.get("/api/game/{game_id}/day/{day_number}", response_model=DayEvent)
async def get_day(game_id: str, day_number: int):
    game = games.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.is_over:
        raise HTTPException(status_code=400, detail="Game is already over")

    return get_day_event(game, day_number)


# POST /api/game/{game_id}/choice - Select choice and update parameters
@app.post("/api/game/{game_id}/choice", response_model=ChoiceResponse)
async def make_choice(game_id: str, body: ChoiceRequest):
    game = games.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.is_over:
        raise HTTPException(status_code=400, detail="Game is already over")

    event = get_day_event(game, body.day)

    selected = next((c for c in event.choices if c.id == body.choice_id), None)
    if not selected:
        raise HTTPException(status_code=400, detail="Invalid choice_id")

    apply_choice(game, selected)

    return ChoiceResponse(
        status=to_status(game),
        applied_choice=selected
    )


# GET /api/game/{game_id}/status - Get current status
@app.get("/api/game/{game_id}/status", response_model=GameStatus)
async def get_status(game_id: str):
    game = games.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    return to_status(game)