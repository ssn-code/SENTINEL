import json
import os
import re
import socket
import urllib.error
import urllib.request
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor


router = APIRouter()

OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions"
HTTP_USER_AGENT = "crime-reporter/1.0 (+https://local.dev)"

STATE_ALIASES = {
    "uttarpradesh": "Uttar Pradesh",
    "uttaranchal": "Uttarakhand",
    "tamilnadu": "Tamil Nadu",
    "telengana": "Telangana",
    "meghalya": "Meghalaya",
    "jammu kashmir": "Jammu and Kashmir",
    "jammu and kashmir": "Jammu and Kashmir",
    "orissa": "Odisha",
    "a and n islands": "Andaman and Nicobar Islands",
    "a n islands": "Andaman and Nicobar Islands",
    "a&n islands": "Andaman and Nicobar Islands",
    "andaman and nicobar": "Andaman and Nicobar Islands",
    "d and n haveli": "Dadra and Nagar Haveli and Daman and Diu",
    "d n haveli": "Dadra and Nagar Haveli and Daman and Diu",
    "d&n haveli": "Dadra and Nagar Haveli and Daman and Diu",
    "dadra and nagar haveli": "Dadra and Nagar Haveli and Daman and Diu",
    "daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
    "nct of delhi": "Delhi",
    "pondicherry": "Puducherry",
}


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str


def connect_db():
    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url:
        raise RuntimeError("DATABASE_URL is required. This project is configured to use Neon only.")

    connect_timeout = int(os.getenv("POSTGRES_CONNECT_TIMEOUT", "5"))
    return psycopg2.connect(database_url, connect_timeout=connect_timeout)


def normalize_state_name(value: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()
    cleaned = re.sub(r"\s+", " ", cleaned)
    return STATE_ALIASES.get(cleaned, cleaned.title())


def fetch_state_rows() -> list[dict[str, Any]]:
    connection = connect_db()
    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT
                    state,
                    women_crimes,
                    ipc_crimes,
                    cyber_crimes
                FROM state_crime_data
                ORDER BY ipc_crimes DESC
                """
            )
            rows = cursor.fetchall()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to load state crime data: {exc}") from exc
    finally:
        connection.close()

    return [
        {
            "state": normalize_state_name(str(row["state"])),
            "ipc_crimes": int(row["ipc_crimes"]),
            "women_crimes": int(row["women_crimes"]),
            "cyber_crimes": int(row["cyber_crimes"]),
        }
        for row in rows
    ]


def build_dataset_context(states: list[dict[str, Any]]) -> str:
    summary = {
        "states_count": len(states),
        "total_ipc_crimes": sum(state["ipc_crimes"] for state in states),
        "total_women_crimes": sum(state["women_crimes"] for state in states),
        "total_cyber_crimes": sum(state["cyber_crimes"] for state in states),
    }
    payload = {
        "summary": summary,
        "states": states,
    }
    return json.dumps(payload, ensure_ascii=True)


def extract_output_text(payload: dict[str, Any]) -> str:
    if isinstance(payload.get("output_text"), str) and payload["output_text"].strip():
        return payload["output_text"].strip()

    for item in payload.get("output", []):
        if item.get("type") != "message":
            continue
        for content in item.get("content", []):
            text = content.get("text")
            if isinstance(text, str) and text.strip():
                return text.strip()

    return ""


def extract_chat_completion_text(payload: dict[str, Any]) -> str:
    choices = payload.get("choices", [])
    if not choices:
        return ""

    message = choices[0].get("message", {})
    content = message.get("content", "")
    if isinstance(content, str):
        return content.strip()

    if isinstance(content, list):
        parts = []
        for item in content:
            if item.get("type") == "text" and isinstance(item.get("text"), str):
                parts.append(item["text"])
        return "".join(parts).strip()

    return ""


def call_openai(question: str, dataset_context: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured.")

    payload = {
        "model": os.getenv("OPENAI_MODEL", "gpt-5"),
        "instructions": (
            "You are SENTINEL AI. Answer only using the provided crime dataset. "
            "If the dataset does not support the answer, say that clearly. "
            "Keep answers concise and factual. When comparing states, mention the relevant metrics."
        ),
        "input": (
            "Crime dataset JSON:\n"
            f"{dataset_context}\n\n"
            f"User question: {question}"
        ),
        "text": {
            "verbosity": "low",
        },
    }

    request = urllib.request.Request(
        OPENAI_RESPONSES_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": HTTP_USER_AGENT,
        },
        method="POST",
    )

    timeout_seconds = float(os.getenv("OPENAI_TIMEOUT_SECONDS", "25"))

    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            response_payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise HTTPException(status_code=502, detail=f"OpenAI request failed: {detail}") from exc
    except (urllib.error.URLError, socket.timeout) as exc:
        raise HTTPException(status_code=504, detail=f"OpenAI request timed out or failed: {exc}") from exc

    answer = extract_output_text(response_payload)
    if not answer:
        raise HTTPException(status_code=502, detail="OpenAI returned an empty response.")

    return answer


def call_groq(question: str, dataset_context: str) -> str:
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured.")

    payload = {
        "model": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are SENTINEL AI. Answer only using the provided crime dataset. "
                    "If the dataset does not support the answer, say that clearly. "
                    "Keep answers concise and factual. When comparing states, mention the relevant metrics."
                ),
            },
            {
                "role": "user",
                "content": (
                    "Crime dataset JSON:\n"
                    f"{dataset_context}\n\n"
                    f"User question: {question}"
                ),
            },
        ],
        "temperature": 0.2,
    }

    request = urllib.request.Request(
        GROQ_CHAT_COMPLETIONS_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": HTTP_USER_AGENT,
        },
        method="POST",
    )

    timeout_seconds = float(os.getenv("GROQ_TIMEOUT_SECONDS", "25"))

    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            response_payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise HTTPException(status_code=502, detail=f"Groq request failed: {detail}") from exc
    except (urllib.error.URLError, socket.timeout) as exc:
        raise HTTPException(status_code=504, detail=f"Groq request timed out or failed: {exc}") from exc

    answer = extract_chat_completion_text(response_payload)
    if not answer:
        raise HTTPException(status_code=502, detail="Groq returned an empty response.")

    return answer


def generate_answer(question: str, dataset_context: str) -> str:
    provider = os.getenv("AI_PROVIDER", "openai").strip().lower()
    if provider == "groq":
        return call_groq(question, dataset_context)
    return call_openai(question, dataset_context)


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is required.")

    states = fetch_state_rows()
    answer = generate_answer(question, build_dataset_context(states))
    return ChatResponse(answer=answer)
