# Coding_Monster

Life simulation game with LLM-generated events.

## Local Development

### Backend

**With uv:**
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

**With venv:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The backend will be available at `http://127.0.0.1:8000` and frontend at `http://localhost:3000`.