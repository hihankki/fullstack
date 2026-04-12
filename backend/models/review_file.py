from dataclasses import dataclass


@dataclass
class ReviewFile:
    id: int
    review_id: int
    filename: str
    content_type: str
    size: int
    created_at: str