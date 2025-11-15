# Backend

## Setup

### 1. Install Dependencies

#### With uv
```bash
cd backend
uv sync
```

#### With venv
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Initialize Database (First Time Only)

**Important:** Run this command only once before the first server start:

```bash
cd backend
uv run python -m app.init_db
```

This creates `mydb.sqlite` with the required tables (users, games, days).

### 3. Run Server

#### With uv
```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

#### With venv
```bash
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000
```

Server runs at http://localhost:8000

## Reset Database

To reset all data:

```bash
rm backend/mydb.sqlite
uv run python -m app.init_db
```
