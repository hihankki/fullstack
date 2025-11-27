from typing import Dict, List, Optional
from datetime import datetime

from schemas import ReviewOut, ReviewCreate, ReviewUpdate

# Пользователи: username -> {username, hashed_password, role}
users_db: Dict[str, dict] = {}

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
