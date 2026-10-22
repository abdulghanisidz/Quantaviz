import json
import os
import re
from typing import Any

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="QuantaViz Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

UNSAFE_KEYWORDS = {
    "violence": ["kill", "murder", "stab", "shoot", "assassinate", "attack"],
    "adult": ["porn", "sex video", "nude", "xxx", "explicit sex"],
    "illegal": ["hack account", "make drugs", "counterfeit", "steal", "fraud"],
    "self_harm": ["suicide", "self harm", "cut myself", "how to die"],
    "hate": ["hate speech", "racial slur", "genocide"],
    "dangerous": ["bomb", "weapon", "explosive", "poison", "how to make a gun"],
}

UNSAFE_PATTERNS = [
    ("self_harm", re.compile(r"\b(can|should|want to|how to|ways to)?\s*(i|me|myself)\s*(kill|hurt|harm|cut|poison)\s*(myself)?\b")),
    ("self_harm", re.compile(r"\b(suicide|self[\s-]?harm|end my life|want to die|how to die)\b")),
    ("violence", re.compile(r"\b(can|how do|how to|should|want to)?\s*(i|we)\s*(kill|hurt|harm|attack|stab|shoot|poison)\s*(him|her|them|someone|my friend|my brother|my sister|my wife|my husband|people)\b")),
    ("violence", re.compile(r"\b(kill|hurt|harm|attack|stab|shoot|poison)\s*(my friend|someone|a person|people|him|her|them)\b")),
    ("dangerous", re.compile(r"\b(how to make|make|build|create)\s*(a|an)?\s*(bomb|explosive|weapon|gun|poison)\b")),
    ("illegal", re.compile(r"\b(how to|ways to|can i)\s*(hack|steal|fraud|counterfeit|bypass security)\b")),
    ("adult", re.compile(r"\b(child porn|rape|sexual assault|forced sex)\b")),
    ("hate", re.compile(r"\b(genocide|ethnic cleansing|racial slur|hate speech)\b")),
]


def build_rejected_payload(message: str | None = None) -> dict[str, Any]:
    return {
        "status": "rejected",
        "reason": "unsafe_query",
        "message": message or "Sorry, I cannot help with that topic. Please try a safe educational concept.",
        "explanation": "",
        "flowchart": "",
        "visual_type": "none",
        "visual_data": {},
        "quiz": [],
    }


def build_error_payload() -> dict[str, Any]:
    return {
        "status": "error",
        "message": "Unable to generate safe educational content. Please try again.",
        "explanation": "",
        "flowchart": "",
        "visual_type": "none",
        "visual_data": {},
        "quiz": [],
    }


def detect_unsafe_query(query: str) -> str | None:
    lowered = str(query or "").lower()
    normalized = re.sub(r"[^a-z0-9\s]", " ", lowered)
    normalized = re.sub(r"\s+", " ", normalized).strip()

    for category, pattern in UNSAFE_PATTERNS:
        if pattern.search(normalized):
            return category

    for category, keywords in UNSAFE_KEYWORDS.items():
        if any(keyword in normalized for keyword in keywords):
            return category
    return None


def is_valid_payload(data: dict[str, Any]) -> bool:
    required_fields = ["explanation", "flowchart", "visual_type", "visual_data", "quiz"]
    return isinstance(data, dict) and all(field in data for field in required_fields)


def build_prompt(topic: str) -> str:
    return f"""Explain this topic simply for a student.

Also generate:

1. A flowchart in Mermaid.js format (if applicable)
2. Best visualization type (diagram / 3d / simulation / none)
3. Visual data (short description)
4. 3 quiz questions with:
   - Every quiz question must be specifically about "{topic}"
   - Do not ask generic study-skill questions
   - Each question should mention the topic directly or a core term from it
   - Prefer one definition question, one mechanism/working question, and one application/example question
   - question
   - options (4)
   - correct_answer
   - explanation

Return STRICT JSON:
{{
  "domain": "medical | biology | chemistry | quantum | mechanical | civil | electrical | data_structures | mathematics | environmental | tech | default",
  "explanation": "",
  "flowchart": "",
  "visual_type": "",
  "visual_data": "",
  "quiz": [
    {{
      "question": "",
      "options": ["", "", "", ""],
      "correct_answer": "",
      "explanation": ""
    }}
  ]
}}

Topic: {topic}"""


def split_sentences(text: str) -> list[str]:
    cleaned = str(text or "").replace("\n", " ")
    return [part.strip() for part in cleaned.split(".") if part.strip()]


def clean_sentence(text: str) -> str:
    return str(text or "").strip().lstrip("-* ").rstrip(".!? ").strip()


def topic_keywords(topic: str) -> list[str]:
    stopwords = {
        "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how", "in", "into",
        "is", "it", "of", "on", "or", "the", "to", "what", "when", "where", "which", "why",
        "with", "your",
    }
    keywords: list[str] = []
    for word in str(topic or "").lower().split():
        normalized = "".join(ch for ch in word if ch.isalnum())
        if len(normalized) > 2 and normalized not in stopwords and normalized not in keywords:
            keywords.append(normalized)
    return keywords


def count_keyword_hits(text: str, keywords: list[str]) -> int:
    haystack = str(text or "").lower()
    return sum(1 for keyword in keywords if keyword in haystack)


def build_topic_specific_quiz(topic: str, explanation: str) -> list[dict[str, Any]]:
    safe_topic = topic or "this topic"
    sentences = [clean_sentence(part) for part in split_sentences(explanation) if clean_sentence(part)]
    primary = sentences[0] if sentences else f"{safe_topic} is best understood by focusing on what it is and how it behaves"
    secondary = (
        sentences[1]
        if len(sentences) > 1
        else f"{safe_topic} becomes clearer when you connect its key parts and their effects"
    )
    tertiary = (
        sentences[2]
        if len(sentences) > 2
        else f"{safe_topic} is easier to remember when linked to examples and practical reasoning"
    )

    return [
        {
            "question": f"Which statement best describes {safe_topic}?",
            "options": [
                primary,
                f"{safe_topic} is only a memorization trick with no real mechanism",
                f"{safe_topic} has no relation to how systems behave",
                f"{safe_topic} can only be understood without any conceptual model",
            ],
            "correct_answer": primary,
            "explanation": primary,
        },
        {
            "question": f"According to the explanation, what is most important when understanding {safe_topic}?",
            "options": [
                secondary,
                f"Avoid linking causes and effects in {safe_topic}",
                f"Treat {safe_topic} as isolated facts with no relationships",
                f"Ignore the main idea behind {safe_topic} and focus only on jargon",
            ],
            "correct_answer": secondary,
            "explanation": secondary,
        },
        {
            "question": f"Which statement is most consistent with how {safe_topic} should be applied or interpreted?",
            "options": [
                tertiary,
                f"{safe_topic} should never be connected to examples or real situations",
                f"{safe_topic} becomes stronger when you remove all reasoning and context",
                f"{safe_topic} is unrelated to changes in variables or conditions",
            ],
            "correct_answer": tertiary,
            "explanation": tertiary,
        },
    ]


def is_topic_relevant_quiz_item(item: dict[str, Any], topic: str) -> bool:
    question = str(item.get("question", "")).lower()
    generic_patterns = [
        "best first step when learning",
        "why use visuals",
        "what improves learning most",
        "study skill",
        "learning most",
    ]
    if any(pattern in question for pattern in generic_patterns):
        return False

    combined = " ".join(
        [
            str(item.get("question", "")),
            str(item.get("correct_answer", "")),
            str(item.get("explanation", "")),
            *[str(option) for option in item.get("options", [])],
        ]
    ).lower()
    clean_topic = str(topic or "").strip().lower()
    if clean_topic and clean_topic in combined:
        return True

    keywords = topic_keywords(topic)
    return count_keyword_hits(combined, keywords) >= max(1, min(2, len(keywords)))


def fallback_payload(topic: str) -> dict[str, Any]:
    safe_topic = topic or "this topic"
    fallback_explanation = f"{safe_topic} is an important concept, but the AI response could not be parsed cleanly this time."
    return {
        "status": "success",
        "domain": "default",
        "explanation": fallback_explanation,
        "flowchart": "",
        "visual_type": "none",
        "visual_data": "",
        "quiz": build_topic_specific_quiz(safe_topic, fallback_explanation),
    }


def extract_json_block(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if len(lines) >= 3:
            cleaned = "\n".join(lines[1:-1]).strip()

    start = cleaned.find("{")
    if start == -1:
        raise ValueError("No JSON object found in response.")

    depth = 0
    for index in range(start, len(cleaned)):
        char = cleaned[index]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return cleaned[start : index + 1]

    raise ValueError("Incomplete JSON object in response.")


def call_gemini(prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise RuntimeError("Missing GEMINI_API_KEY")

    response = requests.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent",
        params={"key": GEMINI_API_KEY},
        headers={"Content-Type": "application/json"},
        json={
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.3, "responseMimeType": "application/json"},
        },
        timeout=30,
    )
    response.raise_for_status()
    body = response.json()
    return (
        body.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [{}])[0]
        .get("text", "")
    )


def call_groq(prompt: str) -> str:
    if not GROQ_API_KEY:
        raise RuntimeError("Missing GROQ_API_KEY")

    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": GROQ_MODEL,
            "temperature": 0.3,
            "response_format": {"type": "json_object"},
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=30,
    )
    response.raise_for_status()
    body = response.json()
    return body.get("choices", [{}])[0].get("message", {}).get("content", "")


def normalize_payload(data: dict[str, Any], topic: str) -> dict[str, Any]:
    allowed_domains = {
        "medical",
        "biology",
        "chemistry",
        "quantum",
        "mechanical",
        "civil",
        "electrical",
        "data_structures",
        "mathematics",
        "environmental",
        "tech",
        "default",
    }
    quiz = data.get("quiz")
    if not isinstance(quiz, list):
        quiz = []

    normalized_quiz = []
    for item in quiz[:3]:
        if not isinstance(item, dict):
            continue
        options = item.get("options")
        if not isinstance(options, list):
            options = []
        safe_options = [str(option) for option in options[:4]]
        while len(safe_options) < 4:
            safe_options.append("")
        normalized_quiz.append(
            {
                "question": str(item.get("question", "")),
                "options": safe_options,
                "correct_answer": str(item.get("correct_answer", "")),
                "explanation": str(item.get("explanation", "")),
            }
        )

    base = fallback_payload(topic)
    explanation = str(data.get("explanation", base["explanation"]))
    topical_quiz = [item for item in normalized_quiz if is_topic_relevant_quiz_item(item, topic)]
    domain = str(data.get("domain", "default")).lower()
    if domain not in allowed_domains:
        domain = "default"
    return {
        "status": "success",
        "domain": domain,
        "explanation": explanation,
        "flowchart": str(data.get("flowchart", "")),
        "visual_type": str(data.get("visual_type", "none")).lower(),
        "visual_data": str(data.get("visual_data", "")),
        "quiz": topical_quiz if len(topical_quiz) == 3 else build_topic_specific_quiz(topic, explanation),
    }


def generate_payload(topic: str) -> dict[str, Any]:
    prompt = build_prompt(topic)
    errors = []

    for provider_name, provider in (("Gemini", call_gemini), ("Groq", call_groq)):
        try:
            raw_text = provider(prompt)
            json_text = extract_json_block(raw_text)
            parsed = json.loads(json_text)
            if not isinstance(parsed, dict):
                raise ValueError("Parsed response is not a JSON object.")
            return normalize_payload(parsed, topic)
        except (requests.RequestException, ValueError, json.JSONDecodeError, RuntimeError) as exc:
            errors.append(f"{provider_name}: {exc}")

    raise HTTPException(status_code=502, detail={"message": "AI generation failed", "providers": errors})


@app.get("/generate")
def generate(topic: str = Query(..., min_length=1)):
    clean_topic = topic.strip()
    if not clean_topic:
        raise HTTPException(status_code=400, detail="Topic is required")

    unsafe_reason = detect_unsafe_query(clean_topic)
    if unsafe_reason:
        return {"data": build_rejected_payload()}

    try:
        data = generate_payload(clean_topic)
    except HTTPException:
        raise
    except Exception:
        data = build_error_payload()

    try:
        json.loads(json.dumps(data))
    except (TypeError, ValueError):
        data = build_error_payload()

    if not is_valid_payload(data):
        data = build_error_payload()

    return {"data": data}
