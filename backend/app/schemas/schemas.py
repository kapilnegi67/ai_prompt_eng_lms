"""Pydantic schemas for request/response validation."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


# ── Auth Schemas ──────────────────────────────────────────────────────────────


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Basket Schemas ────────────────────────────────────────────────────────────


class BasketCreate(BaseModel):
    title: str
    description: Optional[str] = None
    credits: int = 8
    order: int = 0


class BasketResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    credits: int
    order: int
    created_at: datetime

    class Config:
        from_attributes = True


class BasketDetailResponse(BasketResponse):
    modules: list["ModuleResponse"] = []


# ── Module Schemas ────────────────────────────────────────────────────────────


class ModuleCreate(BaseModel):
    basket_id: int
    title: str
    description: Optional[str] = None
    order: int = 0


class ModuleResponse(BaseModel):
    id: int
    basket_id: int
    title: str
    description: Optional[str] = None
    order: int
    created_at: datetime

    class Config:
        from_attributes = True


class ModuleDetailResponse(ModuleResponse):
    lessons: list["LessonResponse"] = []


# ── Lesson Schemas ────────────────────────────────────────────────────────────


class LessonCreate(BaseModel):
    module_id: int
    title: str
    content: Optional[str] = None
    transcript: Optional[str] = None
    notes: Optional[str] = None
    video_url: Optional[str] = None
    order: int = 0
    duration_minutes: int = 0


class LessonResponse(BaseModel):
    id: int
    module_id: int
    title: str
    content: Optional[str] = None
    transcript: Optional[str] = None
    notes: Optional[str] = None
    video_url: Optional[str] = None
    order: int
    duration_minutes: int
    created_at: datetime

    class Config:
        from_attributes = True


class LessonDetailResponse(LessonResponse):
    exercises: list["ExerciseResponse"] = []
    quizzes: list["QuizResponse"] = []


# ── Exercise Schemas ──────────────────────────────────────────────────────────


class ExerciseResponse(BaseModel):
    id: int
    lesson_id: int
    title: str
    description: Optional[str] = None
    prompt_template: Optional[str] = None
    expected_output: Optional[str] = None
    hints: Optional[str] = None
    order: int

    class Config:
        from_attributes = True


# ── Quiz Schemas ──────────────────────────────────────────────────────────────


class QuizResponse(BaseModel):
    id: int
    lesson_id: int
    question: str
    options: Optional[list] = None
    correct_answer: str
    explanation: Optional[str] = None
    order: int

    class Config:
        from_attributes = True


# ── Section Schemas ──────────────────────────────────────────────────────


class SectionQuizResponse(BaseModel):
    id: int
    section_id: int
    question: str
    options: Optional[list] = None
    order: int

    class Config:
        from_attributes = True


class SectionQuizWithAnswer(SectionQuizResponse):
    """Include correct_answer and explanation (used for quiz results)."""
    correct_answer: str
    explanation: Optional[str] = None


class LessonSectionResponse(BaseModel):
    id: int
    lesson_id: int
    title: str
    content: Optional[str] = None
    order: int
    section_quizzes: list[SectionQuizResponse] = []

    class Config:
        from_attributes = True


class SectionProgressResponse(BaseModel):
    id: int
    user_id: int
    section_id: int
    score: float
    passed: bool
    attempts: int
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class QuizSubmission(BaseModel):
    """Submit answers for a section quiz."""
    answers: dict[int, str]  # quiz_id -> selected answer


class QuizResultResponse(BaseModel):
    """Result of a section quiz submission."""
    score: float
    passed: bool
    total_questions: int
    correct_count: int
    attempts: int
    results: list[dict]  # per-question result with correct_answer and explanation


# ── Lab Schemas ───────────────────────────────────────────────────────────────


class LabCreate(BaseModel):
    module_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    starter_prompt: Optional[str] = None
    expected_output: Optional[str] = None
    max_score: int = 100


class LabResponse(BaseModel):
    id: int
    module_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    starter_prompt: Optional[str] = None
    expected_output: Optional[str] = None
    max_score: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Assignment Schemas ────────────────────────────────────────────────────────


class AssignmentCreate(BaseModel):
    module_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    rubric: Optional[dict] = None
    max_score: int = 100
    due_hours: int = 168


class AssignmentResponse(BaseModel):
    id: int
    module_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    rubric: Optional[dict] = None
    max_score: int
    due_hours: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Submission Schemas ────────────────────────────────────────────────────────


class SubmissionCreate(BaseModel):
    assignment_id: Optional[int] = None
    lab_id: Optional[int] = None
    content: str
    prompt_used: Optional[str] = None
    ai_output: Optional[str] = None
    explanation: Optional[str] = None


class SubmissionResponse(BaseModel):
    id: int
    user_id: int
    assignment_id: Optional[int] = None
    lab_id: Optional[int] = None
    content: str
    prompt_used: Optional[str] = None
    ai_output: Optional[str] = None
    explanation: Optional[str] = None
    score: Optional[float] = None
    feedback: Optional[str] = None
    submitted_at: datetime

    class Config:
        from_attributes = True


# ── Prompt Playground Schemas ─────────────────────────────────────────────────


class PromptEvaluateRequest(BaseModel):
    prompt_text: str
    task_description: Optional[str] = None
    expected_format: Optional[str] = None


class DimensionScore(BaseModel):
    clarity: float
    specificity: float
    structure: float
    output_control: float
    context_usage: float
    reasoning_guidance: float
    safety: float


class PromptEvaluateResponse(BaseModel):
    ai_response: str
    score: float
    feedback: str
    improved_prompt: str
    dimension_scores: DimensionScore


# ── AI Tutor Schemas ──────────────────────────────────────────────────────────


class TutorRequest(BaseModel):
    question: str
    context: Optional[str] = None
    lesson_id: Optional[int] = None


class TutorResponse(BaseModel):
    answer: str
    suggestions: list[str] = []


# ── Progress Schemas ──────────────────────────────────────────────────────────


class ProgressUpdate(BaseModel):
    lesson_id: Optional[int] = None
    module_id: Optional[int] = None
    basket_id: Optional[int] = None
    completed: bool = False
    time_spent_minutes: int = 0


class ProgressResponse(BaseModel):
    id: int
    user_id: int
    lesson_id: Optional[int] = None
    module_id: Optional[int] = None
    basket_id: Optional[int] = None
    completed: bool
    time_spent_minutes: int
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CreditResponse(BaseModel):
    id: int
    user_id: int
    basket_id: Optional[int] = None
    credits_earned: float
    total_hours: float
    lab_hours: float
    self_study_hours: float

    class Config:
        from_attributes = True


class StudentProgressSummary(BaseModel):
    user: UserResponse
    total_credits_earned: float
    total_hours: float
    lessons_completed: int
    baskets_progress: list[dict]
    credits: list[CreditResponse]


# Rebuild forward refs
BasketDetailResponse.model_rebuild()
ModuleDetailResponse.model_rebuild()
LessonDetailResponse.model_rebuild()
