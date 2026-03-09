"""Startup script that initializes DB and seeds data."""
import logging
import time

from sqlalchemy import text

from app.db.database import engine, Base, SessionLocal
from app.models.models import User, Lesson
from app.seed import seed_database

logger = logging.getLogger(__name__)

# Mapping of lesson titles to their stock image URLs
_LESSON_IMAGE_URLS: dict[str, str] = {
    "What are Large Language Models?": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1280&h=720&fit=crop&q=80",
    "How LLMs Process Prompts": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1280&h=720&fit=crop&q=80",
    "Common LLM Capabilities and Limitations": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1280&h=720&fit=crop&q=80",
    "Anatomy of a Good Prompt": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1280&h=720&fit=crop&q=80",
    "Zero-shot Prompting": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1280&h=720&fit=crop&q=80",
    "Instruction Clarity and Specificity": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&h=720&fit=crop&q=80",
    "Introduction to Few-shot Learning": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1280&h=720&fit=crop&q=80",
    "Choosing Effective Examples": "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1280&h=720&fit=crop&q=80",
    "Few-shot Patterns for Different Tasks": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1280&h=720&fit=crop&q=80",
    "Iterative Prompt Refinement": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1280&h=720&fit=crop&q=80",
    "Temperature and Parameter Tuning": "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1280&h=720&fit=crop&q=80",
    "Common Prompt Anti-patterns": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1280&h=720&fit=crop&q=80",
}


def _migrate_video_urls():
    """Migrate YouTube video URLs to stock image URLs for existing lessons."""
    db = SessionLocal()
    try:
        lessons = db.query(Lesson).filter(
            Lesson.video_url.like("%youtube.com%")
        ).all()
        if not lessons:
            return
        updated = 0
        for lesson in lessons:
            new_url = _LESSON_IMAGE_URLS.get(lesson.title)
            if new_url:
                lesson.video_url = new_url
                updated += 1
        if updated:
            db.commit()
            logger.info(f"Migrated {updated} lesson video URLs from YouTube to stock images.")
    except Exception as e:
        db.rollback()
        logger.error(f"Video URL migration failed: {e}")
    finally:
        db.close()


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
    _migrate_video_urls()
