"""Course-related API endpoints (baskets, modules, lessons)."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models.models import Basket, Module, Lesson, Lab, Assignment, User
from app.schemas.schemas import (
    BasketResponse,
    BasketDetailResponse,
    ModuleResponse,
    ModuleDetailResponse,
    LessonResponse,
    LessonDetailResponse,
    LabResponse,
    AssignmentResponse,
)
from app.services.auth import get_current_user

router = APIRouter(tags=["Courses"])


@router.get("/baskets", response_model=list[BasketResponse])
def list_baskets(db: Session = Depends(get_db)):
    """List all course baskets."""
    baskets = db.query(Basket).order_by(Basket.order).all()
    return baskets


@router.get("/baskets/{basket_id}", response_model=BasketDetailResponse)
def get_basket(basket_id: int, db: Session = Depends(get_db)):
    """Get a basket with its modules."""
    basket = (
        db.query(Basket)
        .options(joinedload(Basket.modules))
        .filter(Basket.id == basket_id)
        .first()
    )
    if not basket:
        raise HTTPException(status_code=404, detail="Basket not found")
    return basket


@router.get("/modules/{module_id}", response_model=ModuleDetailResponse)
def get_module(module_id: int, db: Session = Depends(get_db)):
    """Get a module with its lessons."""
    module = (
        db.query(Module)
        .options(joinedload(Module.lessons))
        .filter(Module.id == module_id)
        .first()
    )
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


@router.get("/lessons/{lesson_id}", response_model=LessonDetailResponse)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    """Get a lesson with exercises and quizzes."""
    lesson = (
        db.query(Lesson)
        .options(joinedload(Lesson.exercises), joinedload(Lesson.quizzes))
        .filter(Lesson.id == lesson_id)
        .first()
    )
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.get("/labs", response_model=list[LabResponse])
def list_labs(module_id: int = None, db: Session = Depends(get_db)):
    """List labs, optionally filtered by module."""
    query = db.query(Lab)
    if module_id:
        query = query.filter(Lab.module_id == module_id)
    return query.all()


@router.get("/labs/{lab_id}", response_model=LabResponse)
def get_lab(lab_id: int, db: Session = Depends(get_db)):
    """Get a specific lab."""
    lab = db.query(Lab).filter(Lab.id == lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    return lab


@router.get("/assignments", response_model=list[AssignmentResponse])
def list_assignments(module_id: int = None, db: Session = Depends(get_db)):
    """List assignments, optionally filtered by module."""
    query = db.query(Assignment)
    if module_id:
        query = query.filter(Assignment.module_id == module_id)
    return query.all()


@router.get("/assignments/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(assignment_id: int, db: Session = Depends(get_db)):
    """Get a specific assignment."""
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment
