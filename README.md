# Coding_Monster

Life simulation game with LLM-generated events.

## Local Development

### Backend

#### 1. Install Dependencies

**With uv:**
```bash
cd backend
uv sync
```

**With venv:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

#### 2. Initialize Database (First Time Only)

**Important:** Run this command only once before the first server start:

```bash
cd backend
uv run python -m app.init_db
```

This creates `mydb.sqlite` with the required database tables.

#### 3. Run Backend Server

**With uv:**
```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

**With venv:**
```bash
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The backend will be available at `http://127.0.0.1:8000` and frontend at `http://localhost:3000`.