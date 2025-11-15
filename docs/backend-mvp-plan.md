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

## LLM Module Functionality

1.  **Event Generation**: Generate an event + 3 choices based on the current day and parameter status
2.  **Parameter Calculation**: Calculate the effect of each choice on parameters (-10 to +10)
3.  **Structured Output**: Return in JSON format (using Gemini Function Calling)

## Implementation Order

1.  Basic FastAPI setup + dependencies
2.  Data models and SQLite DB setup
3.  Gemini API integration and prompt design
4.  Implement event generation logic
5.  Implement API endpoints
6.  Local operation check