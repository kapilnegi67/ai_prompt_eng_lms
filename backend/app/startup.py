"""Startup script that initializes DB and seeds data."""
import logging
import time

from sqlalchemy import text

from app.db.database import engine, Base, SessionLocal
from app.models.models import User
from app.seed import seed_database

logger = logging.getLogger(__name__)


def wait_for_db(max_retries: int = 30, delay: int = 2):
    """Wait for the database to be ready."""
    for i in range(max_retries):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
                logger.info("Database is ready!")
                return True
        except Exception as e:
            logger.info(f"Waiting for database... attempt {i + 1}/{max_retries}")
            time.sleep(delay)
    raise Exception("Database not available after maximum retries")


def init_db():
    """Initialize the database and run seed data."""
    from app.config import settings
    if not settings.DATABASE_URL.startswith("sqlite"):
        wait_for_db()
    Base.metadata.create_all(bind=engine)
    seed_database()
