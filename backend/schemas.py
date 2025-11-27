from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ---------- AUTH ----------

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=32)
    password: str = Field(..., min_length=6, max_length=64)
    full_name: str = Field(..., min_length=2, max_length=64)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- REVIEWS ----------

class ReviewBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    content: str = Field(..., min_length=5, max_length=2000)
    rating: int = Field(..., ge=1, le=5, description="Оценка от 1 до 5")


class ReviewCreate(ReviewBase):
    pass


class ReviewUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    content: Optional[str] = Field(None, min_length=5, max_length=2000)
    rating: Optional[int] = Field(None, ge=1, le=5)


class ReviewOut(ReviewBase):
    id: int
    created_at: datetime
    updated_at: datetime
    author: str
