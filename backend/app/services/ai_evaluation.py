"""AI Prompt Evaluation Engine using OpenAI API."""
import json
import logging
from typing import Optional

from openai import OpenAI

from app.config import settings

logger = logging.getLogger(__name__)

EVALUATION_SYSTEM_PROMPT = """You are an expert prompt engineering evaluator.
Evaluate the given prompt based on these dimensions (score each 1-10):

1. Clarity - How clear and unambiguous is the prompt?
2. Specificity - How specific are the instructions?
3. Structure - How well structured is the prompt?
4. Output Control - Does the prompt specify the desired output format?
5. Context Usage - Does the prompt provide sufficient context?
6. Reasoning Guidance - Does the prompt guide the AI's reasoning process?
7. Safety - Does the prompt include appropriate safety considerations?

Return a JSON object with this exact structure:
{
  "ai_response": "<the AI response to the prompt>",
  "score": <overall score 1-10>,
  "feedback": "<detailed feedback>",
  "improved_prompt": "<an improved version of the prompt>",
  "dimension_scores": {
    "clarity": <1-10>,
    "specificity": <1-10>,
    "structure": <1-10>,
    "output_control": <1-10>,
    "context_usage": <1-10>,
    "reasoning_guidance": <1-10>,
    "safety": <1-10>
  }
}

Return ONLY valid JSON, no markdown formatting."""


def evaluate_prompt(
    prompt_text: str,
    task_description: Optional[str] = None,
    expected_format: Optional[str] = None,
) -> dict:
    """Evaluate a prompt using OpenAI and return structured feedback."""
    if not settings.OPENAI_API_KEY:
        return _mock_evaluation(prompt_text)

    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        user_message = f"Evaluate this prompt:\n\n{prompt_text}"
        if task_description:
            user_message += f"\n\nTask description: {task_description}"
        if expected_format:
            user_message += f"\n\nExpected output format: {expected_format}"

        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": EVALUATION_SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.3,
            max_tokens=2000,
        )

        content = response.choices[0].message.content
        if not content:
            return _mock_evaluation(prompt_text)

        # Clean markdown code blocks if present
        content = content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        result = json.loads(content)
        return result

    except Exception as e:
        logger.error(f"OpenAI evaluation error: {e}")
        return _mock_evaluation(prompt_text)


def _mock_evaluation(prompt_text: str) -> dict:
    """Return a mock evaluation when OpenAI is not available."""
    word_count = len(prompt_text.split())
    base_score = min(10, max(1, word_count / 5))

    has_question = "?" in prompt_text
    has_format = any(
        w in prompt_text.lower()
        for w in ["json", "list", "table", "format", "structure"]
    )
    has_context = word_count > 20
    has_role = any(
        w in prompt_text.lower() for w in ["you are", "act as", "role", "expert"]
    )

    clarity = min(10, base_score + (2 if has_question else 0))
    specificity = min(10, base_score + (1 if word_count > 15 else 0))
    structure = min(10, base_score + (2 if has_format else 0))
    output_control = min(10, 3 + (4 if has_format else 0))
    context_usage = min(10, 3 + (4 if has_context else 0))
    reasoning = min(10, base_score + (2 if has_role else 0))
    safety = min(10, 7)

    overall = round(
        (clarity + specificity + structure + output_control + context_usage + reasoning + safety) / 7,
        1,
    )

    feedback_parts = []
    if not has_format:
        feedback_parts.append("Consider specifying the desired output format.")
    if not has_context:
        feedback_parts.append("Add more context to help the AI understand the task better.")
    if not has_role:
        feedback_parts.append("Consider assigning a role to the AI for better results.")
    if not feedback_parts:
        feedback_parts.append("Good prompt! Consider adding more specific constraints.")

    return {
        "ai_response": f"[Mock AI Response] Based on the prompt: '{prompt_text[:100]}...', here is a sample response demonstrating the expected output.",
        "score": overall,
        "feedback": " ".join(feedback_parts),
        "improved_prompt": f"As an expert, {prompt_text} Please provide a structured response in a clear format.",
        "dimension_scores": {
            "clarity": clarity,
            "specificity": specificity,
            "structure": structure,
            "output_control": output_control,
            "context_usage": context_usage,
            "reasoning_guidance": reasoning,
            "safety": safety,
        },
    }
