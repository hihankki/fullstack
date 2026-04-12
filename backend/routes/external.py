from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from services.external.unsplash_service import UnsplashService, get_unsplash_service

router = APIRouter()


@router.get("/category-image")
async def get_category_image(
    category: str = Query(..., min_length=1, max_length=100),
    service: UnsplashService = Depends(get_unsplash_service),
):
    return await service.get_category_image(category)