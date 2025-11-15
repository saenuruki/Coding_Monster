from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import random

from . import models
from . import init_db
from .llm.event_generator import generate_event

# TODO: Add to a database or other persistent store
games: dict[str, models.Game] = {}

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get the database session
def get_db():
    db = init_db.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/game", response_model=models.StartGameResponse)
def start_game(
    start_req: models.StartGameRequest,
    db: Session = Depends(get_db)
):
    """
    Starts a new game, creates the initial game state in the database,
    generates the first event, and returns both to the client.
    """
    # 1. Create a new User and Game in the database
    # Note: In a real app, you'd get the user_id from an authenticated session.
    # For now, we create a new user for each new game.
    new_user = init_db.User()
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_game = init_db.Game(
        age=start_req.age,
        gender=start_req.gender,
        character_name=start_req.character_name,
        work=start_req.work,
        user_id=new_user.id
    )
    db.add(new_game)
    db.commit()
    db.refresh(new_game)
    game_id = str(new_game.id)

    # 2. Create the first Day entry for the new game
    initial_stats = models.Stats() # Get default starting stats
    new_day = init_db.Day(
        game_id=new_game.id,
        number_of_day=1,
        health=initial_stats.health,
        happiness=initial_stats.happiness,
        stress=initial_stats.stress,
        reputation=initial_stats.reputation,
        education=initial_stats.education,
        money=initial_stats.money,
        weekly_income=initial_stats.weekly_income,
        weekly_expense=initial_stats.weekly_expense,
        free_time=initial_stats.free_time
    )
    db.add(new_day)
    db.commit()
    db.refresh(new_day)

    # 3. Construct the initial game state Pydantic model
    game_state = get_full_game(db, new_game)

    # 4. Generate the first event using the LLM
    event = generate_event(game_state)
    # The active_events dictionary is no longer needed with the new flow.
    # active_events[game_id] = event 

    return models.StartGameResponse(
        game_state=game_state,
        event=event
    )




@app.post("/game/{game_id}/choice", response_model=models.ChoiceResponse)
def make_choice(
    game_id: str,
    choice_request: models.ChoiceRequest,
    db: Session = Depends(get_db)
):
    """
    Handles a player's choice by directly receiving the impact from the
    frontend, updating the game state, and returning the new state.

    NOTE: This endpoint trusts the client to send a valid, unmodified impact
    object. In a real-world scenario, this would be a security risk.
    """
    # 1. Retrieve the game from the database
    db_game = db.query(init_db.Game).filter(init_db.Game.id == game_id).first()
    if not db_game:
        raise HTTPException(status_code=404, detail="Game not found")

    # 2. Get the impact directly from the request
    impact = choice_request.impact

    # 3. Get the most recent day for the game
    current_day = db.query(init_db.Day).filter(init_db.Day.game_id == game_id).order_by(init_db.Day.number_of_day.desc()).first()
    if not current_day:
        raise HTTPException(status_code=404, detail="No days found for this game.")

    # 4. Apply the impact to the day's stats, with clamping
    current_day.health = max(0, min(100, current_day.health + impact.health))
    current_day.happiness = max(0, min(100, current_day.happiness + impact.happiness))
    current_day.stress = max(0, min(100, current_day.stress + impact.stress))
    current_day.reputation += impact.reputation
    current_day.education += impact.education
    current_day.money += impact.money
    current_day.weekly_income += impact.weekly_income
    current_day.weekly_expense += impact.weekly_expense
    current_day.free_time += impact.free_time

    # 5. Commit the changes to the database
    db.commit()
    db.refresh(current_day)

    # 6. Construct the full, updated game state response
    game_state_response = get_full_game(db, db_game)
    
    return models.ChoiceResponse(
        game_state=game_state_response
    )


def get_full_game(db: Session, db_game: init_db.Game) -> models.Game:
    """
    For Jana: Constructs the complete Pydantic Game model from database objects.
    """
    # This function would gather all the necessary data from the DB and assemble the full game state.
    # This is a simplified representation without finances for now. :)
    
    current_day = db.query(init_db.Day).filter(init_db.Day.game_id == db_game.id).order_by(init_db.Day.number_of_day.desc()).first()

    static_props = models.StaticProperties(
        character_name=db_game.character_name,
        gender=db_game.gender,
        age=db_game.age,
        work=db_game.work
    )

    stats = models.Stats(
        health=current_day.health,
        happiness=current_day.happiness,
        stress=current_day.stress,
        reputation=current_day.reputation,
        education=current_day.education,
        money=current_day.money,
        weekly_income=current_day.weekly_income,
        weekly_expense=current_day.weekly_expense,
        free_time=current_day.free_time
    )

    # Finances would be populated from its own tables if they existed - might implement later
    # For now, returning an empty Finances object.
    finances = models.Finances()

    return models.Game(
        user_id=db_game.user_id,
        game_id=str(db_game.id),
        day=current_day.number_of_day,
        static_properties=static_props,
        stats=stats,
        finances=finances
    )