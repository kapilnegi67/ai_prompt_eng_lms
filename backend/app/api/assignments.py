"""Assignment submission API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import Submission, Assignment, Lab, User
from app.schemas.schemas import SubmissionCreate, SubmissionResponse
from app.services.auth import get_current_user

router = APIRouter(tags=["Assignments"])


@router.post("/assignment/submit", response_model=SubmissionResponse)
def submit_assignment(
    submission_data: SubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit an assignment or lab work."""
    # Validate assignment or lab exists
    if submission_data.assignment_id:
        assignment = db.query(Assignment).filter(
            Assignment.id == submission_data.assignment_id
        ).first()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")

    if submission_data.lab_id:
        lab = db.query(Lab).filter(Lab.id == submission_data.lab_id).first()
        if not lab:
            raise HTTPException(status_code=404, detail="Lab not found")

    submission = Submission(
        user_id=current_user.id,
        assignment_id=submission_data.assignment_id,
        lab_id=submission_data.lab_id,
        content=submission_data.content,
        prompt_used=submission_data.prompt_used,
        ai_output=submission_data.ai_output,
        explanation=submission_data.explanation,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


@router.get("/submissions", response_model=list[SubmissionResponse])
def list_my_submissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all submissions by the current user."""
    submissions = (
        db.query(Submission)
        .filter(Submission.user_id == current_user.id)
        .order_by(Submission.submitted_at.desc())
        .all()
    )
    return submissions
