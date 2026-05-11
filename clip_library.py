import hashlib
import json
import os
import re
import time
from typing import Any, Dict, List, Optional


def slugify(value: str, max_length: int = 80) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "-", (value or "").strip()).strip("-").lower()
    if not cleaned:
        cleaned = "video"
    return cleaned[:max_length].strip("-") or "video"


def ensure_dir(path: str) -> str:
    os.makedirs(path, exist_ok=True)
    return path


def read_json(path: str, default: Optional[Any] = None):
    if not os.path.exists(path):
        return {} if default is None else default
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def write_json(path: str, payload: Any) -> None:
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)


def now_ts() -> float:
    return time.time()


def source_id_from_url(url: str) -> str:
    return hashlib.sha1(url.strip().encode("utf-8")).hexdigest()[:16]


def composition_id_from_sources(source_ids: List[str]) -> str:
    normalized = "|".join(source_ids)
    return hashlib.sha1(normalized.encode("utf-8")).hexdigest()[:16]


def build_source_record(source_id: str, url: str) -> Dict[str, Any]:
    ts = now_ts()
    return {
        "id": source_id,
        "url": url,
        "title": "",
        "status": "pending",
        "created_at": ts,
        "updated_at": ts,
        "video_path": "",
        "duration_sec": 0,
        "analysis_count": 0,
        "last_error": None,
    }


def summarize_source(record: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": record.get("id"),
        "url": record.get("url"),
        "title": record.get("title"),
        "status": record.get("status"),
        "duration_sec": record.get("duration_sec", 0),
        "analysis_count": record.get("analysis_count", 0),
        "updated_at": record.get("updated_at"),
    }
