# Life Simulation Game Backend MVP Implementation Plan

## Technology Stack

  * FastAPI (Python)
  * Google Gemini API (LLM)
  * SQLite (Data Persistence)
  * Pydantic (Data Validation)

## Parameter Design

Manage 6 parameters (modifiable later):

  * health
  * happiness
  * money
  * energy
  * social
  * career

Change range for each parameter: -10 to +10

## Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application body
│   ├── models.py            # Data model definitions
│   ├── database.py          # SQLite connection management
│   ├── llm/
│   │   ├── __init__.py
│   │   ├── gemini_client.py # Gemini API integration
│   │   ├── prompts.py       # Prompt templates
│   │   └── event_generator.py # Event generation logic
│   └── api/
│       ├── __init__.py
│       └── routes.py        # API endpoints
├── requirements.txt
└── .env.example
```

## API Endpoint Design

1.  `POST /api/game/start` - Start new game
2.  `GET /api/game/{game_id}/day/{day_number}` - Get event for specified day
3.  `POST /api/game/{game_id}/choice` - Select choice and update parameters
4.  `GET /api/game/{game_id}/status` - Get current status

## Task Assignment

- **Iena**: database.py, models.py, update_stats function, API endpoints
- **Kent**: LLM module (gemini_client.py, prompts.py, event_generator.py)

## LLM Module Functionality (Kent)

1.  **Event Generation**: Generate an event + 3 choices based on the current day and parameter status
2.  **Parameter Calculation**: Calculate the impact of each choice on parameters (-10 to +10)
3.  **Structured Output**: Return in JSON format

### LLM Output Format
```json
{
  "event": {
    "description": "Event description text",
    "choices": [
      {
        "id": 1,
        "text": "Choice 1",
        "impact": {
          "health": 5,
          "happiness": 3,
          "money": 0,
          "energy": -2,
          "social": 0,
          "career": 2
        }
      },
      // ... choices 2, 3
    ]
  }
}
```

## Database Functionality (Iena)

1.  **GameState Management**: Store game_id, current_day, and 6 parameters in SQLite
2.  **update_stats Function**: Update parameters using impact values returned from LLM
3.  **Data Persistence**: Save and load game progress state

## Implementation Order

1.  **Parallel Work**:
    - Iena: FastAPI setup + database.py + models.py
    - Kent: gemini_client.py + prompts.py + event_generator.py
2.  **Integration**: Connect LLM module with DB in API endpoints
3.  **Testing**: Local E2E testing