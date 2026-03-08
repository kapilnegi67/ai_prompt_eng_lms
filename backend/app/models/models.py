"""SQLAlchemy database models for the Prompt Engineering LMS."""
import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    JSON,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class RoleEnum(str, enum.Enum):
    """User roles."""

    STUDENT = "student"
    ADMIN = "admin"


class User(Base):
    """User account model."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(Enum(RoleEnum), default=RoleEnum.STUDENT, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    progress = relationship("Progress", back_populates="user")
    credits = relationship("Credit", back_populates="user")
    submissions = relationship("Submission", back_populates="user")
    prompt_attempts = relationship("PromptAttempt", back_populates="user")
    certificates = relationship("Certificate", back_populates="user")


class Basket(Base):
    """Course basket (e.g., Basic, Intermediate, Advanced)."""

    __tablename__ = "baskets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    credits = Column(Integer, default=8)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    modules = relationship("Module", back_populates="basket", cascade="all, delete-orphan")


class Module(Base):
    """Module within a basket."""

    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    basket_id = Column(Integer, ForeignKey("baskets.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    basket = relationship("Basket", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module", cascade="all, delete-orphan")


class Lesson(Base):
    """Lesson within a module."""

    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    transcript = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    video_url = Column(String(500), nullable=True)
    order = Column(Integer, default=0)
    duration_minutes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    module = relationship("Module", back_populates="lessons")
    video = relationship("Video", back_populates="lesson", uselist=False)
    exercises = relationship("Exercise", back_populates="lesson", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="lesson", cascade="all, delete-orphan")


class Video(Base):
    """Video associated with a lesson."""

    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), unique=True, nullable=False)
    url = Column(String(500), nullable=False)
    title = Column(String(255), nullable=True)
    duration_seconds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    lesson = relationship("Lesson", back_populates="video")


class Exercise(Base):
    """Practice exercise within a lesson."""

    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    prompt_template = Column(Text, nullable=True)
    expected_output = Column(Text, nullable=True)
    hints = Column(Text, nullable=True)
    order = Column(Integer, default=0)

    # Relationships
    lesson = relationship("Lesson", back_populates="exercises")


class Quiz(Base):
    """Quiz within a lesson."""

    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)
    correct_answer = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=True)
    order = Column(Integer, default=0)

    # Relationships
    lesson = relationship("Lesson", back_populates="quizzes")


class Lab(Base):
    """Lab assignment simulating real-world problems."""

    __tablename__ = "labs"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    starter_prompt = Column(Text, nullable=True)
    expected_output = Column(Text, nullable=True)
    max_score = Column(Integer, default=100)
    created_at = Column(DateTime, default=datetime.utcnow)


class Assignment(Base):
    """Assignment with evaluation rubric."""

    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    rubric = Column(JSON, nullable=True)
    max_score = Column(Integer, default=100)
    due_hours = Column(Integer, default=168)
    created_at = Column(DateTime, default=datetime.utcnow)


class Submission(Base):
    """Student submission for an assignment or lab."""

    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=True)
    lab_id = Column(Integer, ForeignKey("labs.id"), nullable=True)
    content = Column(Text, nullable=False)
    prompt_used = Column(Text, nullable=True)
    ai_output = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="submissions")


class PromptAttempt(Base):
    """Record of a prompt attempt in the playground."""

    __tablename__ = "prompt_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prompt_text = Column(Text, nullable=False)
    task_description = Column(Text, nullable=True)
    expected_format = Column(Text, nullable=True)
    ai_response = Column(Text, nullable=True)
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    improved_prompt = Column(Text, nullable=True)
    dimension_scores = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="prompt_attempts")


class Progress(Base):
    """Track student progress through lessons."""

    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=True)
    basket_id = Column(Integer, ForeignKey("baskets.id"), nullable=True)
    completed = Column(Boolean, default=False)
    time_spent_minutes = Column(Integer, default=0)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="progress")


class Credit(Base):
    """Track credits earned by students."""

    __tablename__ = "credits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    basket_id = Column(Integer, ForeignKey("baskets.id"), nullable=True)
    credits_earned = Column(Float, default=0.0)
    total_hours = Column(Float, default=0.0)
    lab_hours = Column(Float, default=0.0)
    self_study_hours = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="credits")


class Certificate(Base):
    """Certificate issued upon completion."""

    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    basket_id = Column(Integer, ForeignKey("baskets.id"), nullable=True)
    title = Column(String(255), nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)
    certificate_url = Column(String(500), nullable=True)

    # Relationships
    user = relationship("User", back_populates="certificates")
