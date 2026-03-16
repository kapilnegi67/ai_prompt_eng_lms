"""Admin API endpoints for course management."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import Basket, Module, Lesson, Lab, Assignment, User, Exercise, Quiz
from app.schemas.schemas import (
    BasketCreate,
    BasketResponse,
    ModuleCreate,
    ModuleResponse,
    LessonCreate,
    LessonResponse,
    LabCreate,
    LabResponse,
    AssignmentCreate,
    AssignmentResponse,
    UserResponse,
)
from app.services.auth import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── Basket Management ────────────────────────────────────────────────────────


@router.post("/basket", response_model=BasketResponse)
def create_basket(
    data: BasketCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new course basket."""
    basket = Basket(**data.model_dump())
    db.add(basket)
    db.commit()
    db.refresh(basket)
    return basket


@router.put("/basket/{basket_id}", response_model=BasketResponse)
def update_basket(
    basket_id: int,
    data: BasketCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update a course basket."""
    basket = db.query(Basket).filter(Basket.id == basket_id).first()
    if not basket:
        raise HTTPException(status_code=404, detail="Basket not found")
    for key, value in data.model_dump().items():
        setattr(basket, key, value)
    db.commit()
    db.refresh(basket)
    return basket


@router.delete("/basket/{basket_id}")
def delete_basket(
    basket_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Delete a course basket."""
    basket = db.query(Basket).filter(Basket.id == basket_id).first()
    if not basket:
        raise HTTPException(status_code=404, detail="Basket not found")
    db.delete(basket)
    db.commit()
    return {"message": "Basket deleted"}


# ── Module Management ────────────────────────────────────────────────────────


@router.post("/module", response_model=ModuleResponse)
def create_module(
    data: ModuleCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new module."""
    basket = db.query(Basket).filter(Basket.id == data.basket_id).first()
    if not basket:
        raise HTTPException(status_code=404, detail="Basket not found")
    module = Module(**data.model_dump())
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


@router.put("/module/{module_id}", response_model=ModuleResponse)
def update_module(
    module_id: int,
    data: ModuleCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update a module."""
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    for key, value in data.model_dump().items():
        setattr(module, key, value)
    db.commit()
    db.refresh(module)
    return module


@router.delete("/module/{module_id}")
def delete_module(
    module_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Delete a module."""
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    db.delete(module)
    db.commit()
    return {"message": "Module deleted"}


# ── Lesson Management ────────────────────────────────────────────────────────


@router.post("/lesson", response_model=LessonResponse)
def create_lesson(
    data: LessonCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new lesson."""
    module = db.query(Module).filter(Module.id == data.module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    lesson = Lesson(**data.model_dump())
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.put("/lesson/{lesson_id}", response_model=LessonResponse)
def update_lesson(
    lesson_id: int,
    data: LessonCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update a lesson."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    for key, value in data.model_dump().items():
        setattr(lesson, key, value)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete("/lesson/{lesson_id}")
def delete_lesson(
    lesson_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Delete a lesson."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(lesson)
    db.commit()
    return {"message": "Lesson deleted"}


# ── Lab Management ───────────────────────────────────────────────────────────


@router.post("/lab", response_model=LabResponse)
def create_lab(
    data: LabCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new lab."""
    lab = Lab(**data.model_dump())
    db.add(lab)
    db.commit()
    db.refresh(lab)
    return lab


@router.put("/lab/{lab_id}", response_model=LabResponse)
def update_lab(
    lab_id: int,
    data: LabCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update a lab."""
    lab = db.query(Lab).filter(Lab.id == lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    for key, value in data.model_dump().items():
        setattr(lab, key, value)
    db.commit()
    db.refresh(lab)
    return lab


@router.delete("/lab/{lab_id}")
def delete_lab(
    lab_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Delete a lab."""
    lab = db.query(Lab).filter(Lab.id == lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    db.delete(lab)
    db.commit()
    return {"message": "Lab deleted"}


# ── Assignment Management ────────────────────────────────────────────────────


@router.post("/assignment", response_model=AssignmentResponse)
def create_assignment(
    data: AssignmentCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new assignment."""
    assignment = Assignment(**data.model_dump())
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.put("/assignment/{assignment_id}", response_model=AssignmentResponse)
def update_assignment(
    assignment_id: int,
    data: AssignmentCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update an assignment."""
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    for key, value in data.model_dump().items():
        setattr(assignment, key, value)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.delete("/assignment/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Delete an assignment."""
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(assignment)
    db.commit()
    return {"message": "Assignment deleted"}


# ── Student Management ───────────────────────────────────────────────────────


@router.get("/students", response_model=list[UserResponse])
def list_students(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List all students."""
    from app.models.models import RoleEnum

    students = db.query(User).filter(User.role == RoleEnum.STUDENT).all()
    return students


@router.get("/analytics")
def get_analytics(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get platform analytics for admins."""
    from app.models.models import PromptAttempt, Progress, Submission, RoleEnum

    total_students = db.query(User).filter(User.role == RoleEnum.STUDENT).count()
    total_prompts = db.query(PromptAttempt).count()
    total_submissions = db.query(Submission).count()
    completed_lessons = db.query(Progress).filter(Progress.completed.is_(True), Progress.lesson_id.isnot(None)).count()

    # Average prompt scores
    from sqlalchemy import func

    avg_score = db.query(func.avg(PromptAttempt.score)).scalar() or 0

    return {
        "total_students": total_students,
        "total_prompt_attempts": total_prompts,
        "total_submissions": total_submissions,
        "completed_lessons": completed_lessons,
        "average_prompt_score": round(float(avg_score), 1),
    }
