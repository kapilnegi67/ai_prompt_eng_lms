"""Prompt Playground API endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import PromptAttempt, User
from app.schemas.schemas import PromptEvaluateRequest, PromptEvaluateResponse, TutorRequest, TutorResponse
from app.services.auth import get_current_user
from app.services.ai_evaluation import evaluate_prompt
from app.services.ai_tutor import ask_tutor

router = APIRouter(tags=["Prompt Playground"])


@router.post("/prompt/evaluate", response_model=PromptEvaluateResponse)
def evaluate_user_prompt(
    request: PromptEvaluateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Evaluate a prompt and return AI feedback with scores."""
    result = evaluate_prompt(
        prompt_text=request.prompt_text,
        task_description=request.task_description,
        expected_format=request.expected_format,
    )

    # Save the attempt
    attempt = PromptAttempt(
        user_id=current_user.id,
        prompt_text=request.prompt_text,
        task_description=request.task_description,
        expected_format=request.expected_format,
        ai_response=result.get("ai_response", ""),
        score=result.get("score", 0),
        feedback=result.get("feedback", ""),
        improved_prompt=result.get("improved_prompt", ""),
        dimension_scores=result.get("dimension_scores", {}),
    )
    db.add(attempt)
    db.commit()

    return PromptEvaluateResponse(
        ai_response=result.get("ai_response", ""),
        score=result.get("score", 0),
        feedback=result.get("feedback", ""),
        improved_prompt=result.get("improved_prompt", ""),
        dimension_scores=result.get("dimension_scores", {}),
    )


@router.post("/tutor/ask", response_model=TutorResponse)
def ask_ai_tutor(
    request: TutorRequest,
    current_user: User = Depends(get_current_user),
):
    """Ask the AI tutor a question."""
    result = ask_tutor(
        question=request.question,
        context=request.context,
    )
    return TutorResponse(
        answer=result.get("answer", ""),
        suggestions=result.get("suggestions", []),
    )
