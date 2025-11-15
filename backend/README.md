# Backend

## Run Server

### With uv
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

### With venv
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Server runs at http://localhost:8000
