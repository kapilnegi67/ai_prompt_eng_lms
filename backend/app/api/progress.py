"""Progress and credit tracking API endpoints."""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import Progress, Credit, User, Basket, Lesson
from app.schemas.schemas import (
    ProgressUpdate,
    ProgressResponse,
    CreditResponse,
    StudentProgressSummary,
    UserResponse,
)
from app.services.auth import get_current_user

router = APIRouter(tags=["Progress"])


@router.post("/progress", response_model=ProgressResponse)
def update_progress(
    progress_data: ProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update student progress for a lesson/module/basket."""
    # Check if progress record exists
    query = db.query(Progress).filter(Progress.user_id == current_user.id)
    if progress_data.lesson_id:
        query = query.filter(Progress.lesson_id == progress_data.lesson_id)
    elif progress_data.module_id:
        query = query.filter(Progress.module_id == progress_data.module_id)
    elif progress_data.basket_id:
        query = query.filter(Progress.basket_id == progress_data.basket_id)

    existing = query.first()

    if existing:
        existing.completed = progress_data.completed
        existing.time_spent_minutes += progress_data.time_spent_minutes
        if progress_data.completed:
            existing.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        _update_credits(current_user.id, db)
        return existing

    progress = Progress(
        user_id=current_user.id,
        lesson_id=progress_data.lesson_id,
        module_id=progress_data.module_id,
        basket_id=progress_data.basket_id,
        completed=progress_data.completed,
        time_spent_minutes=progress_data.time_spent_minutes,
        completed_at=datetime.utcnow() if progress_data.completed else None,
    )
    db.add(progress)
    db.commit()
    db.refresh(progress)

    # Update credits based on hours
    _update_credits(current_user.id, db)

    return progress


@router.get("/progress/{user_id}", response_model=StudentProgressSummary)
def get_progress(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get progress summary for a student."""
    # Students can only view their own progress, admins can view any
    if current_user.id != user_id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get all progress records
    progress_records = db.query(Progress).filter(Progress.user_id == user_id).all()
    credits = db.query(Credit).filter(Credit.user_id == user_id).all()

    lessons_completed = sum(1 for p in progress_records if p.completed and p.lesson_id)
    total_hours = sum(p.time_spent_minutes for p in progress_records) / 60.0
    total_credits = sum(c.credits_earned for c in credits)

    # Basket progress
    baskets = db.query(Basket).all()
    baskets_progress = []
    for basket in baskets:
        basket_progress = [
            p for p in progress_records if p.basket_id == basket.id
        ]
        basket_credit = next((c for c in credits if c.basket_id == basket.id), None)
        baskets_progress.append(
            {
                "basket_id": basket.id,
                "basket_title": basket.title,
                "total_credits": basket.credits,
                "earned_credits": basket_credit.credits_earned if basket_credit else 0,
                "completed": any(p.completed for p in basket_progress),
            }
        )

    return StudentProgressSummary(
        user=UserResponse.model_validate(user),
        total_credits_earned=total_credits,
        total_hours=round(total_hours, 1),
        lessons_completed=lessons_completed,
        baskets_progress=baskets_progress,
        credits=[CreditResponse.model_validate(c) for c in credits],
    )


@router.get("/credits", response_model=list[CreditResponse])
def get_my_credits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get credits for the current user."""
    credits = db.query(Credit).filter(Credit.user_id == current_user.id).all()
    return credits


def _update_credits(user_id: int, db: Session):
    """Recalculate credits for a user based on their progress."""
    progress_records = db.query(Progress).filter(Progress.user_id == user_id).all()
    total_minutes = sum(p.time_spent_minutes for p in progress_records)
    total_hours = total_minutes / 60.0

    # 1 credit = 45 hours (15 lab + 30 self-study)
    credits_earned = total_hours / 45.0

    # Get or create overall credit record
    credit = db.query(Credit).filter(
        Credit.user_id == user_id, Credit.basket_id.is_(None)
    ).first()

    if credit:
        credit.credits_earned = round(credits_earned, 2)
        credit.total_hours = round(total_hours, 1)
    else:
        credit = Credit(
            user_id=user_id,
            credits_earned=round(credits_earned, 2),
            total_hours=round(total_hours, 1),
        )
        db.add(credit)

    db.commit()
