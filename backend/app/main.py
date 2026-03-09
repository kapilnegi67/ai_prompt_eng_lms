"""Main FastAPI application entry point."""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.database import engine, Base
from app.api import auth, courses, playground, assignments, progress, admin
from app.startup import init_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize database and seed data
init_db()

app = FastAPI(
    title="Prompt Engineering Learning Platform",
    description="Interactive AI learning platform for Prompt Engineering",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(playground.router)
app.include_router(assignments.router)
app.include_router(progress.router)
app.include_router(admin.router)


@app.get("/")
def root():
    """Health check endpoint."""
    return {
        "message": "Prompt Engineering Learning Platform API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    """Health check for Docker."""
    return {"status": "healthy"}
