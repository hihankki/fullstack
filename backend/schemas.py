from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=32)
    password: str = Field(..., min_length=6, max_length=72)
    full_name: str = Field(..., min_length=2, max_length=64)


class Token(BaseModel):
    access_token: str
    token_type: str


class RoleUpdate(BaseModel):
    role: str = Field(..., min_length=4, max_length=10)


class ReviewCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=5000)
    rating: int = Field(..., ge=1, le=5)
    category: str = Field(..., min_length=2, max_length=50)
    city: str = Field(..., min_length=2, max_length=100)
    file_url: Optional[str] = None


class ReviewUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = Field(None, max_length=5000)
    rating: Optional[int] = Field(None, ge=1, le=5)
    category: Optional[str] = Field(None, min_length=2, max_length=50)
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    file_url: Optional[str] = None


class ReviewFileOut(BaseModel):
    id: int
    filename: str
    content_type: str
    size: int
    created_at: str


class ReviewOut(BaseModel):
    id: int
    title: str
    content: str
    rating: int
    category: str
    city: str
    author: str
    created_at: datetime
    updated_at: datetime
    file_url: Optional[str] = None
    files: list[ReviewFileOut] = []


class ReviewListResponse(BaseModel):
    items: list[ReviewOut]
    total: int
    page: int
    pages: int


class ExternalWeatherOut(BaseModel):
    city: str
    resolved_name: Optional[str] = None
    country: Optional[str] = None
    temperature: Optional[float] = None
    wind_speed: Optional[float] = None
    weather_code: Optional[int] = None
    source: str