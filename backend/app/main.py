import uuid
import random
from fastapi import FastAPI, HTTPException, Depends
from typing import List
import sqlite3
from sqlalchemy.orm import Session
from init_db import SessionLocal, User, Game, Day, init_db 
from models import *
from llm.event_generator import generate_event

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

# NEED!
# def apply_choice(game: GameState, choice: Choice):
#     game.health += choice.health_delta
#     game.money += choice.money_delta
#     game.mood += choice.mood_delta

#     if game.health <= 0 or game.money < -50 or game.mood <= -20:
#         game.is_over = True

#     if not game.is_over:
#         game.day += 1


# def to_status(game: GameState) -> GameStatus:
#     return Game(
#         game_id=game_id,
#         day=game.day,
#         health=game.health,
#         money=game.money,
#         mood=game.mood,
#         is_over=game.is_over,
#     )

def call_llm_for_start(dayNumber: int, game_id:int) -> Event:
    return Event(game_id=game_id, event=generate_event(dayNumber))

def call_llm_for_start(game_id:int) -> Event:
    return Event(game_id=game_id, event=generate_event(1))
    
    

@app.post("/api/game/start", response_model=StartGameResponse)
async def start_game(body: StartGameRequest, db: Session = Depends(get_db)):
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
    
    event = call_llm_for_start(game_id=game.id)

    return StartGameResponse(
        game_id=game.id,
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