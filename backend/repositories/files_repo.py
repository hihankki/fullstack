from __future__ import annotations

from datetime import datetime
from typing import Dict, List

from models.review_file import ReviewFile


files_db: Dict[int, ReviewFile] = {}
_current_file_id = 0


def _get_next_file_id() -> int:
    global _current_file_id
    _current_file_id += 1
    return _current_file_id


def create_file(review_id: int, filename: str, content_type: str, size: int) -> ReviewFile:
    file = ReviewFile(
        id=_get_next_file_id(),
        review_id=review_id,
        filename=filename,
        content_type=content_type,
        size=size,
        created_at=datetime.utcnow().isoformat(),
    )
    files_db[file.id] = file
    return file


def get_files_by_review(review_id: int) -> List[ReviewFile]:
    return [f for f in files_db.values() if f.review_id == review_id]


def delete_files_by_review(review_id: int) -> None:
    to_delete = [file_id for file_id, f in files_db.items() if f.review_id == review_id]
    for file_id in to_delete:
        del files_db[file_id]