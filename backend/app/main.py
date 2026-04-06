"""
AetherNet Backend - FastAPI Application Entry Point
Registers all routers, CORS middleware, lifespan handlers, and the SSE event stream.
Production-ready with environment-specific configuration.
"""

import logging
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from app.core.config import get_settings
from app.core.database import create_indexes, close_db, seed_base_models
from app.core.security import verify_clerk_token
from app.api.routes import auth, models, versions, sessions

from fl.pubsub import event_bus

logging.basicConfig(level=logging.INFO)
logger=logging.getLogger(__name__)
settings=get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic."""
    env_label = "PRODUCTION" if settings.is_production else "DEVELOPMENT"
    logger.info(f"{env_label} - AetherNet backend starting...")
    logger.info(f"Environment: {settings.app_env}")
    logger.info(f"CORS Origins: {', '.join(settings.cors_origins_list)}")
    await create_indexes()
    await seed_base_models()
    yield
    await close_db()
    logger.info("AetherNet backend shut down.")


app=FastAPI(
    title="AetherNet API",
    description="Decentralized AI Model Marketplace - Backend API",
    version="1.0.0",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    lifespan=lifespan,
)

# Configure CORS with environment-specific origins
cors_origins = settings.cors_origins_list
allow_credentials = True

# Allow all origins in development for easier testing
if not settings.is_production and "localhost" in cors_origins[0]:
    cors_origins = cors_origins + ["*"]

logger.info(f"Effective CORS allow_origins: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "X-Content-Range"],
)

app.include_router(auth.router,     prefix="/api/v1")
app.include_router(models.router,   prefix="/api/v1")
app.include_router(versions.router, prefix="/api/v1")
app.include_router(sessions.router, prefix="/api/v1")


@app.get("/api/v1/events/stream", tags=["Events"])
async def event_stream(request: Request):
    """
    Server-Sent Events endpoint.
    Frontend subscribes here to receive real-time FL updates.
    EventSource cannot send headers, so it passes ?token=... for auth.
    """
    token=request.query_params.get("token")
    if not token:
        raise HTTPException(status_code=401, detail="Missing auth token for SSE stream")

    try:
        verify_clerk_token(token)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid auth token for SSE stream")

    async def generator():
        subscriber=event_bus.subscribe().__aiter__()
        try:
            while True:
                if await request.is_disconnected():
                    break

                try:
                    event=await asyncio.wait_for(subscriber.__anext__(), timeout=1.0)
                except TimeoutError:
                    continue
                except StopAsyncIteration:
                    break

                yield {"event": event["type"], "data": event["data"]}
        finally:
            await subscriber.aclose()

    return EventSourceResponse(generator(), ping=15)


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "AetherNet API"}
