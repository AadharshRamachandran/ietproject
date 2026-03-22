# AetherNet — Decentralized AI Model Marketplace

> **Philosophy**: *Data stays local. Intelligence is shared.*

A federated AI model marketplace where users can publish, version, and collaboratively fine-tune machine learning models — without ever uploading their raw data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI + Uvicorn |
| Database | MongoDB Atlas (Motor async driver) |
| Storage | Pinata / IPFS |
| Auth | JWT (python-jose + bcrypt) |
| Federated Learning | Flower (flwr) |
| Frontend | React (Vite) |
| Real-time Events | Server-Sent Events (SSE) |

---

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/routes/     # FastAPI route handlers
│   │   ├── core/           # Config, DB, Security
│   │   ├── models/         # Pydantic schemas
│   │   └── services/       # Pinata storage service
│   ├── fl/                 # Flower server, client, pubsub
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api/            # Axios wrappers
│       ├── components/     # UI components (common, marketplace, sandbox, training)
│       ├── contexts/       # React contexts (Auth, Sandbox)
│       ├── hooks/          # Custom hooks (useSSE, useLocalFS, useAuth)
│       ├── pages/          # Full page components
│       └── styles/         # Global CSS, variables, animations
├── shared_models/          # Model recipe JSON files
└── .env.template
```

---

## Quick Start

### Backend
```bash
cd backend
cp ../.env.template .env
# Fill in .env values
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Flower FL Server
```bash
cd backend
python fl/run_server.py --session-key <key> --rounds 3
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## Key Features

- 🔒 **Zero-upload Training** — Local Sandbox scans data locally; no bytes reach the server
- 📦 **Immutable Versioning** — Every training session creates a new IPFS-pinned version CID
- 🌐 **Federated Learning** — Flower-based FL with `ValidationStrategy` that ousts mismatched clients
- 📡 **Live Events** — SSE stream pushes round progress, ouster alerts, and completion events to the UI
- 🗝️ **Session Keys** — Only the session creator (lead user) can close a session and pin the final model

---

## Environment Variables

See `.env.template` for all required variables.
