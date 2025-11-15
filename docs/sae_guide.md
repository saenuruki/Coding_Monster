# Backend API Guide

This document is for Sae :>

## Base URL

`http://localhost:8000` (This may vary based on your local setup and deployment)

## 1. Start a New Game

**Endpoint:** `POST /game`

Starts a new game session, initializes the player's state in the database, and generates the first event.

### Request

`models.StartGameRequest`

```json
{
  "age": 18,
  "gender": "male",
  "character_name": "Sae",
  "work": false
}
```

### Response

`models.StartGameResponse`

```json
{
  "game_state": {
    "user_id": 1,
    "game_id": "1",
    "day": 1,
    "static_properties": {
      "character_name": "Sae",
      "gender": "male",
      "age": 18,
      "work": true,
      "character_avatar": null // this will be replaced with a link later 
    },
    "stats": {
      "health": 100,
      "happiness": 50,
      "stress": 10,
      "reputation": 0,
      "education": 0,
      "money": 50.0,
      "weekly_income": 0.0,
      "weekly_expense": 0.0,
      "free_time": 40.0
    },
    "finances": {
      "incomes": [],
      "expenses": [],
      "savings_account": null
    }
  },
  "event": {
    "event_id": 1700000000,
    "description": "Blah blah",
    "options": [
      {
        "description": "Look for a part-time job.",
        "impact": {
          "health": 0,
          "happiness": 5,
          "stress": 10,
          "reputation": 5,
          "education": 0,
          "money": 0,
          "weekly_income": 50.0,
          "weekly_expense": 0.0,
          "free_time": -10.0
        }
      },
      {
        "description": "Focus on your studies instead.",
        "impact": {
          "health": 0,
          "happiness": 2,
          "stress": 5,
          "reputation": 0,
          "education": 15,
          "money": 0,
          "weekly_income": 0.0,
          "weekly_expense": 0.0,
          "free_time": -5.0
        }
      }
    ]
  }
}
```

## 2. Make a Choice

**Endpoint:** `POST /game/{game_id}/choice`

Submits the player's selected choice (impact object) and updates the game state in the database. Returns the updated game state.

### Path Parameters

- `game_id`: The unique ID of the current game session (string).

### Request

`models.ChoiceRequest`

The frontend should send the `impact` object directly from the selected `EventOption`.

```json
{
  "impact": {
    "health": 0,
    "happiness": 5,
    "stress": 2,
    "reputation": 0,
    "education": 0,
    "money": 0,
    "weekly_income": 0,
    "weekly_expense": 5,
    "free_time": 0
  }
}
```

### Response

`models.ChoiceResponse`

```json
{
  "game_state": {
    "user_id": 1,
    "game_id": "1",
    "day": 2,
    "static_properties": {
      "character_name": "Sae",
      "gender": "male",
      "age": 18,
      "work": true,
      "character_avatar": null
    },
    "stats": {
      "health": 100,
      "happiness": 55,
      "stress": 12,
      "reputation": 0,
      "education": 0,
      "money": 50.0,
      "weekly_income": 0.0,
      "weekly_expense": 5.0,
      "free_time": 40.0
    },
    "finances": {
      "incomes": [],
      "expenses": [],
      "savings_account": null
    }
  }
}
```

## Data Models

All data models (schemas) used in requests and responses are defined in `backend/app/models.py`. Key models include:

-   `Game`: The comprehensive game state, including static properties, current stats, and financial details.
-   `StaticProperties`: Player's fixed characteristics like gender, name, etc.
-   `Stats`: Player's dynamic attributes (health, money, stress, etc.).
-   `Finances`: Detailed financial breakdown (incomes, expenses, savings).
-   `Income`, `Expense`, `SavingsAccount`: Components of `Finances`.
-   `Event`: A game event presented to the player, containing multiple `EventOption`s.
-   `EventOption`: A choice within an `Event`, including its `description` and `impact`.
-   `Impact`: The changes applied to player stats when an `EventOption` is chosen.
-   `StartGameRequest`: Request body for starting a new game.
-   `StartGameResponse`: Response body when a new game starts.
-   `ChoiceRequest`: Request body for making a choice.
-   `ChoiceResponse`: Response body after a choice is processed.

Please refer to `backend/app/models.py` for the exact structure and field definitions of these models!
