from __future__ import annotations

import os
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status

from db import (
    create_review,
    delete_review,
    get_review,
    list_reviews,
    update_review,
)
from repositories.files_repo import create_file, delete_files_by_review, get_files_by_review
from rbac import Permission, has_permission
from schemas import ReviewCreate, ReviewFileOut, ReviewListResponse, ReviewOut, ReviewUpdate
from security import get_current_user

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_SORT_FIELDS = {"id", "title", "rating", "author", "category", "city", "created_at", "updated_at"}
ALLOWED_ORDER_VALUES = {"asc", "desc"}
ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "application/pdf"}
MAX_FILE_SIZE = 2 * 1024 * 1024


@router.get("/", response_model=ReviewListResponse)
async def get_reviews_endpoint(
    q: Optional[str] = None,
    category: Optional[str] = None,
    city: Optional[str] = None,
    author: Optional[str] = None,
    rating_min: Optional[int] = Query(None, ge=1, le=5),
    rating_max: Optional[int] = Query(None, ge=1, le=5),
    sort_by: str = "id",
    order: str = "desc",
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    data = list_reviews()

    if q:
        q_lower = q.lower()
        data = [
            r for r in data
            if q_lower in r.content.lower()
            or q_lower in r.author.lower()
            or q_lower in r.title.lower()
            or q_lower in r.category.lower()
            or q_lower in r.city.lower()
        ]

    if category:
        category_lower = category.lower()
        data = [r for r in data if r.category.lower() == category_lower]

    if city:
        city_lower = city.lower()
        data = [r for r in data if city_lower in r.city.lower()]

    if author:
        author_lower = author.lower()
        data = [r for r in data if author_lower in r.author.lower()]

    if rating_min is not None:
        data = [r for r in data if r.rating >= rating_min]

    if rating_max is not None:
        data = [r for r in data if r.rating <= rating_max]

    if sort_by not in ALLOWED_SORT_FIELDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Некорректное поле сортировки. Допустимо: {', '.join(sorted(ALLOWED_SORT_FIELDS))}",
        )

    order = order.lower().strip()
    if order not in ALLOWED_ORDER_VALUES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="order должен быть 'asc' или 'desc'",
        )

    reverse = order == "desc"
    data = sorted(data, key=lambda x: getattr(x, sort_by), reverse=reverse)

    total = len(data)
    start = (page - 1) * limit
    end = start + limit

    return ReviewListResponse(
        items=data[start:end],
        total=total,
        page=page,
        pages=(total + limit - 1) // limit,
    )


@router.get("/{review_id}", response_model=ReviewOut)
async def get_review_endpoint(review_id: int):
    review = get_review(review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Отзыв с id={review_id} не найден",
        )
    return review


@router.post("/", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
async def create_review_endpoint(
    review_data: ReviewCreate,
    current_user: dict = Depends(get_current_user),
):
    role = (current_user.get("role") or "user").lower()
    if not has_permission(role, Permission.REVIEWS_CREATE.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для создания отзыва",
        )

    author = current_user.get("display_name") or current_user["username"]
    return create_review(review_data, author=author)


@router.put("/{review_id}", response_model=ReviewOut)
async def update_review_endpoint(
    review_id: int,
    review_data: ReviewUpdate,
    current_user: dict = Depends(get_current_user),
):
    review = get_review(review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Отзыв с id={review_id} не найден",
        )

    role = (current_user.get("role") or "user").lower()
    current_name = current_user.get("display_name") or current_user["username"]

    if has_permission(role, Permission.REVIEWS_UPDATE_ANY.value):
        updated = update_review(review_id, review_data)
        if not updated:
            raise HTTPException(status_code=404, detail="Отзыв не найден")
        return updated

    if has_permission(role, Permission.REVIEWS_UPDATE_OWN.value) and review.author == current_name:
        updated = update_review(review_id, review_data)
        if not updated:
            raise HTTPException(status_code=404, detail="Отзыв не найден")
        return updated

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Недостаточно прав для изменения этого отзыва",
    )


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review_endpoint(
    review_id: int,
    current_user: dict = Depends(get_current_user),
):
    review = get_review(review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Отзыв с id={review_id} не найден",
        )

    role = (current_user.get("role") or "user").lower()
    current_name = current_user.get("display_name") or current_user["username"]

    if has_permission(role, Permission.REVIEWS_DELETE_ANY.value):
        delete_review(review_id)
        delete_files_by_review(review_id)
        return

    if has_permission(role, Permission.REVIEWS_DELETE_OWN.value) and review.author == current_name:
        delete_review(review_id)
        delete_files_by_review(review_id)
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Недостаточно прав для удаления этого отзыва",
    )


@router.post("/{review_id}/files", response_model=ReviewFileOut, status_code=status.HTTP_201_CREATED)
async def upload_review_file(
    review_id: int,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    review = get_review(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Отзыв не найден")

    role = (current_user.get("role") or "user").lower()
    current_name = current_user.get("display_name") or current_user["username"]

    can_upload = (
        has_permission(role, Permission.REVIEWS_UPDATE_ANY.value)
        or (has_permission(role, Permission.REVIEWS_UPDATE_OWN.value) and review.author == current_name)
    )
    if not can_upload:
        raise HTTPException(status_code=403, detail="Недостаточно прав для загрузки файла")

    content = await file.read()

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Допустимы только PNG, JPEG и PDF",
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Файл слишком большой. Максимум 2 МБ",
        )

    original_name = file.filename or "file"
    safe_name = os.path.basename(original_name)
    ext = os.path.splitext(safe_name)[1]
    generated_name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, generated_name)

    with open(path, "wb") as f:
        f.write(content)

    created = create_file(
        review_id=review_id,
        filename=generated_name,
        content_type=file.content_type or "application/octet-stream",
        size=len(content),
    )

    return ReviewFileOut(
        id=created.id,
        filename=created.filename,
        content_type=created.content_type,
        size=created.size,
        created_at=created.created_at,
    )


@router.get("/{review_id}/files", response_model=list[ReviewFileOut])
async def get_review_files(review_id: int):
    review = get_review(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Отзыв не найден")

    files = get_files_by_review(review_id)
    return [
        ReviewFileOut(
            id=f.id,
            filename=f.filename,
            content_type=f.content_type,
            size=f.size,
            created_at=f.created_at,
        )
        for f in files
    ]