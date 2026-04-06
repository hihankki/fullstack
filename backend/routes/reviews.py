from typing import List, Optional
from fastapi import Query

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
from rbac import Permission, has_permission

router = APIRouter()


@router.get("/", response_model=List[ReviewOut])
async def get_reviews():
    """Список отзывов (публичный)."""
    return list_reviews()


@router.get("/", response_model=dict)
async def get_reviews(
    q: Optional[str] = None,                      # поиск
    rating: Optional[int] = Query(None, ge=1, le=5),  # фильтр
    sort_by: str = "id",                          # сортировка
    order: str = "desc",
    page: int = 1,                                # пагинация
    limit: int = 10,
):
    data = list_reviews()

    # 🔍 ПОИСК (по тексту или автору)
    if q:
        q_lower = q.lower()
        data = [
            r for r in data
            if q_lower in r.text.lower()
            or q_lower in r.author.lower()
        ]

    # ⭐ ФИЛЬТР
    if rating:
        data = [r for r in data if r.rating == rating]

    # 🔽 СОРТИРОВКА
    reverse = order == "desc"
    try:
        data = sorted(data, key=lambda x: getattr(x, sort_by), reverse=reverse)
    except Exception:
        pass  # если поле не существует

    # 📄 ПАГИНАЦИЯ
    total = len(data)
    start = (page - 1) * limit
    end = start + limit

    return {
        "items": data[start:end],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


@router.post("/", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
async def create_review_endpoint(
    review_data: ReviewCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Создать отзыв (только авторизованные + permission reviews:create).
    """
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
    """
    Обновить отзыв.
    - admin (reviews:update_any): любые
    - user (reviews:update_own): только свои
    """
    review = get_review(review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Отзыв с id={review_id} не найден",
        )

    role = (current_user.get("role") or "user").lower()
    current_name = current_user.get("display_name") or current_user["username"]

    if has_permission(role, Permission.REVIEWS_UPDATE_ANY.value):
        return update_review(review_id, review_data)

    if has_permission(role, Permission.REVIEWS_UPDATE_OWN.value) and review.author == current_name:
        return update_review(review_id, review_data)

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Недостаточно прав для изменения этого отзыва",
    )


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review_endpoint(
    review_id: int,
    current_user: dict = Depends(get_current_user),
):
    """
    Удалить отзыв.
    - admin (reviews:delete_any): любые
    - user (reviews:delete_own): только свои
    """
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
        return

    if has_permission(role, Permission.REVIEWS_DELETE_OWN.value) and review.author == current_name:
        delete_review(review_id)
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Недостаточно прав для удаления этого отзыва",
    )