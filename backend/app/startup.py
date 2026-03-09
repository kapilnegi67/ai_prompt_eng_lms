"""Startup script that initializes DB and seeds data."""
import logging
import time

from sqlalchemy import text

from app.db.database import engine, Base, SessionLocal
from app.models.models import User, Lesson, LessonSection, SectionQuiz
from app.seed import seed_database, _seed_lesson_sections

logger = logging.getLogger(__name__)

# Mapping of lesson titles to their stock video URLs (Mixkit free stock videos)
_LESSON_VIDEO_URLS: dict[str, str] = {
    "What are Large Language Models?": "https://assets.mixkit.co/videos/99786/99786-720.mp4",
    "How LLMs Process Prompts": "https://assets.mixkit.co/videos/46635/46635-720.mp4",
    "Common LLM Capabilities and Limitations": "https://assets.mixkit.co/videos/50748/50748-720.mp4",
    "Anatomy of a Good Prompt": "https://assets.mixkit.co/videos/9757/9757-720.mp4",
    "Zero-shot Prompting": "https://assets.mixkit.co/videos/12748/12748-720.mp4",
    "Instruction Clarity and Specificity": "https://assets.mixkit.co/videos/47051/47051-720.mp4",
    "Introduction to Few-shot Learning": "https://assets.mixkit.co/videos/23282/23282-720.mp4",
    "Choosing Effective Examples": "https://assets.mixkit.co/videos/41638/41638-720.mp4",
    "Few-shot Patterns for Different Tasks": "https://assets.mixkit.co/videos/31771/31771-720.mp4",
    "Iterative Prompt Refinement": "https://assets.mixkit.co/videos/221/221-720.mp4",
    "Temperature and Parameter Tuning": "https://assets.mixkit.co/videos/43527/43527-720.mp4",
    "Common Prompt Anti-patterns": "https://assets.mixkit.co/videos/51214/51214-720.mp4",
}


def _migrate_video_urls():
    """Migrate old video URLs (YouTube or Unsplash) to Mixkit stock videos."""
    db = SessionLocal()
    try:
        lessons = db.query(Lesson).filter(
            ~Lesson.video_url.like("%mixkit.co%")
        ).all()
        if not lessons:
            return
        updated = 0
        for lesson in lessons:
            new_url = _LESSON_VIDEO_URLS.get(lesson.title)
            if new_url:
                lesson.video_url = new_url
                updated += 1
        if updated:
            db.commit()
            logger.info(f"Migrated {updated} lesson video URLs to Mixkit stock videos.")
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


def _migrate_lesson_sections():
    """Seed lesson sections for existing deployments that don't have them yet."""
    db = SessionLocal()
    try:
        existing = db.query(LessonSection).first()
        if existing:
            return  # already seeded
        lessons = db.query(Lesson).order_by(Lesson.id).all()
        if not lessons:
            return
        _seed_lesson_sections(db, lessons)
        db.commit()
        logger.info(f"Seeded {len(lessons) * 3} lesson sections with quizzes.")
    except Exception as e:
        db.rollback()
        logger.error(f"Lesson sections migration failed: {e}")
    finally:
        db.close()


def init_db():
    """Initialize the database and run seed data."""
    from app.config import settings
    if not settings.DATABASE_URL.startswith("sqlite"):
        wait_for_db()
    Base.metadata.create_all(bind=engine)
    seed_database()
    _migrate_video_urls()
    _migrate_lesson_sections()
