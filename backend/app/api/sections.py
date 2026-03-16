"""Section-based interactive lesson flow API endpoints."""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models.models import LessonSection, SectionQuiz, SectionProgress, User
from app.schemas.schemas import (
    LessonSectionResponse,
    SectionProgressResponse,
    QuizSubmission,
    QuizResultResponse,
)
from app.services.auth import get_current_user

router = APIRouter(tags=["Sections"])

PASS_THRESHOLD = 0.80  # 80% required to pass


@router.get(
    "/lessons/{lesson_id}/sections",
    response_model=list[LessonSectionResponse],
)
def get_lesson_sections(lesson_id: int, db: Session = Depends(get_db)):
    """Return all sections (with quizzes) for a lesson, ordered by section.order."""
    sections = (
        db.query(LessonSection)
        .options(joinedload(LessonSection.section_quizzes))
        .filter(LessonSection.lesson_id == lesson_id)
        .order_by(LessonSection.order)
        .all()
    )
    return sections


@router.get(
    "/lessons/{lesson_id}/section-progress",
    response_model=list[SectionProgressResponse],
)
def get_section_progress(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the current user's progress for every section in the lesson."""
    section_ids = (
        db.query(LessonSection.id)
        .filter(LessonSection.lesson_id == lesson_id)
        .all()
    )
    section_id_list = [s[0] for s in section_ids]
    if not section_id_list:
        return []

    progress = (
        db.query(SectionProgress)
        .filter(
            SectionProgress.user_id == current_user.id,
            SectionProgress.section_id.in_(section_id_list),
        )
        .all()
    )
    return progress


@router.post(
    "/sections/{section_id}/submit-quiz",
    response_model=QuizResultResponse,
)
def submit_section_quiz(
    section_id: int,
    body: QuizSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Grade the quiz for a section and record progress."""
    section = (
        db.query(LessonSection)
        .options(joinedload(LessonSection.section_quizzes))
        .filter(LessonSection.id == section_id)
        .first()
    )
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    quizzes = sorted(section.section_quizzes, key=lambda q: q.order)
    if not quizzes:
        raise HTTPException(status_code=400, detail="Section has no quiz questions")

    # Grade each question
    total = len(quizzes)
    correct = 0
    results: list[dict] = []
    for q in quizzes:
        user_answer = body.answers.get(q.id, "")
        is_correct = user_answer == q.correct_answer
        if is_correct:
            correct += 1
        results.append(
            {
                "quiz_id": q.id,
                "question": q.question,
                "user_answer": user_answer,
                "correct_answer": q.correct_answer,
                "is_correct": is_correct,
                "explanation": q.explanation or "",
            }
        )

    score = correct / total if total > 0 else 0.0
    passed = score >= PASS_THRESHOLD

    # Upsert progress
    prog = (
        db.query(SectionProgress)
        .filter(
            SectionProgress.user_id == current_user.id,
            SectionProgress.section_id == section_id,
        )
        .first()
    )
    if prog is None:
        prog = SectionProgress(
            user_id=current_user.id,
            section_id=section_id,
            score=score,
            passed=passed,
            attempts=1,
            completed_at=datetime.utcnow() if passed else None,
        )
        db.add(prog)
    else:
        prog.attempts += 1
        if score > prog.score:
            prog.score = score
        if passed and not prog.passed:
            prog.passed = True
            prog.completed_at = datetime.utcnow()
    db.commit()

    return QuizResultResponse(
        score=round(score * 100, 1),
        passed=passed,
        total_questions=total,
        correct_count=correct,
        attempts=prog.attempts,
        results=results,
    )
