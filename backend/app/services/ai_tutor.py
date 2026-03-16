"""AI Tutor service for helping students with prompt engineering."""
import logging
from typing import Optional

from openai import OpenAI

from app.config import settings

logger = logging.getLogger(__name__)

TUTOR_SYSTEM_PROMPT = """You are an expert AI tutor for a Prompt Engineering course.
Your role is to:
- Explain prompt engineering concepts clearly
- Suggest better prompts when students ask
- Provide hints for assignments without giving away the answer
- Answer questions about LLMs, prompt patterns, and best practices

Be encouraging, educational, and provide practical examples.
Keep responses concise but thorough."""


def ask_tutor(
    question: str,
    context: Optional[str] = None,
) -> dict:
    """Ask the AI tutor a question."""
    if not settings.OPENAI_API_KEY:
        return _mock_tutor_response(question)

    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        user_message = question
        if context:
            user_message = f"Context: {context}\n\nQuestion: {question}"

        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": TUTOR_SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.7,
            max_tokens=1500,
        )

        answer = response.choices[0].message.content or "I could not generate a response."

        return {
            "answer": answer,
            "suggestions": [
                "Try breaking down complex prompts into smaller steps",
                "Use specific examples in your prompts",
                "Define the desired output format clearly",
            ],
        }

    except Exception as e:
        logger.error(f"AI Tutor error: {e}")
        return _mock_tutor_response(question)


def _mock_tutor_response(question: str) -> dict:
    """Return a mock tutor response when OpenAI is not available."""
    responses = {
        "default": {
            "answer": (
                "Great question! In prompt engineering, the key is to be clear, specific, "
                "and structured in your instructions to the AI. Here are some tips:\n\n"
                "1. **Be Specific**: Instead of 'write about dogs', try 'Write a 200-word "
                "informative paragraph about Golden Retrievers'\n"
                "2. **Set Context**: Tell the AI what role to play or what expertise to use\n"
                "3. **Define Output**: Specify the format you want (JSON, list, paragraph)\n"
                "4. **Provide Examples**: Use few-shot prompting with examples\n\n"
                "Would you like me to elaborate on any of these techniques?"
            ),
            "suggestions": [
                "Practice with the Prompt Playground to see how different prompts affect output",
                "Try the few-shot prompting exercises in Module 3",
                "Review the lesson on output formatting for better control",
            ],
        }
    }
    return responses["default"]
