from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from schemas import ReviewOut, ReviewCreate, ReviewUpdate

# ---------- USERS (persist to json) ----------

USERS_FILE = Path(__file__).resolve().parent / "users.json"

# Пользователи: username -> {username, hashed_password, role, display_name}
users_db: Dict[str, dict] = {}


def load_users() -> None:
    global users_db
    if USERS_FILE.exists():
        try:
            data = json.loads(USERS_FILE.read_text(encoding="utf-8"))
            # гарантируем формат dict[str, dict]
            if isinstance(data, dict):
                users_db = data
        except Exception:
            # если файл битый — начинаем с пустого
            users_db = {}


def save_users() -> None:
    USERS_FILE.write_text(
        json.dumps(users_db, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


# загружаем пользователей при импорте модуля
load_users()

# ---------- REVIEWS (in-memory) ----------

# Отзывы: id -> ReviewOut
reviews_db: Dict[int, ReviewOut] = {}
_current_review_id = 0


def _get_next_review_id() -> int:
    global _current_review_id
    _current_review_id += 1
    return _current_review_id


def create_review(data: ReviewCreate, author: str) -> ReviewOut:
    new_id = _get_next_review_id()
    now = datetime.utcnow()

    review = ReviewOut(
        id=new_id,
        title=data.title,
        content=data.content,
        rating=data.rating,
        author=author,
        created_at=now,
        updated_at=now,
    )
    reviews_db[new_id] = review
    return review


def get_review(review_id: int) -> Optional[ReviewOut]:
    return reviews_db.get(review_id)


def list_reviews() -> List[ReviewOut]:
    return list(reviews_db.values())


def update_review(review_id: int, data: ReviewUpdate) -> Optional[ReviewOut]:
    review = reviews_db.get(review_id)
    if not review:
        return None

    updated_data = review.dict()
    if data.title is not None:
        updated_data["title"] = data.title
    if data.content is not None:
        updated_data["content"] = data.content
    if data.rating is not None:
        updated_data["rating"] = data.rating

    updated_data["updated_at"] = datetime.utcnow()
    updated_review = ReviewOut(**updated_data)
    reviews_db[review_id] = updated_review
    return updated_review


def delete_review(review_id: int) -> bool:
    if review_id in reviews_db:
        del reviews_db[review_id]
        return True
    return False