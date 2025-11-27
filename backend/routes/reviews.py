from typing import List

from fastapi import APIRouter, HTTPException, status, Depends

from schemas import ReviewOut, ReviewCreate, ReviewUpdate
from db import (
    create_review,
    get_review,
    list_reviews,
    update_review,
    delete_review,
)
from security import get_current_user

router = APIRouter()


@router.get("/", response_model=List[ReviewOut])
async def get_reviews():
    """
    Список отзывов (публичный).
    """
    return list_reviews()


@router.get("/{review_id}", response_model=ReviewOut)
async def get_review_by_id(review_id: int):
    """
    Один отзыв (публичный).
    """
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
    """
    Создать отзыв (только авторизованные).
    В поле author пишем display_name, если он есть, иначе username.
    """
    author = current_user.get("display_name") or current_user["username"]
    return create_review(review_data, author=author)


@router.put("/{review_id}", response_model=ReviewOut)
async def update_review_endpoint(
    review_id: int,
    review_data: ReviewUpdate,
    current_user: dict = Depends(get_current_user),
):
    """
    Обновить отзыв.
    user -> только свои (по имени)
    admin -> любые
    """
    review = get_review(review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Отзыв с id={review_id} не найден",
        )

    # author на стороне сервера = display_name или username автора в момент создания
    current_name = current_user.get("display_name") or current_user["username"]

    if current_user["role"] != "admin" and review.author != current_name:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для изменения этого отзыва",
        )

    updated = update_review(review_id, review_data)
    return updated


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review_endpoint(
    review_id: int,
    current_user: dict = Depends(get_current_user),
):
    """
    Удалить отзыв.
    user -> только свои (по имени)
    admin -> любые
    """
    review = get_review(review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Отзыв с id={review_id} не найден",
        )

    current_name = current_user.get("display_name") or current_user["username"]

    # ВАЖНО: admin пропускаем, для остальных сравниваем автора
    if current_user["role"] != "admin" and review.author != current_name:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для удаления этого отзыва",
        )

    delete_review(review_id)
    return
