from __future__ import annotations

import asyncio
import time
from typing import Optional

import httpx
from fastapi import HTTPException, status

from config import (
    UNSPLASH_ACCESS_KEY,
    UNSPLASH_BASE_URL,
    UNSPLASH_CACHE_TTL_SECONDS,
    UNSPLASH_MAX_RETRIES,
    UNSPLASH_TIMEOUT_SECONDS,
)


class UnsplashService:
    def __init__(self) -> None:
        self._cache: dict[str, dict] = {}

    def _get_cached(self, key: str) -> Optional[dict]:
        item = self._cache.get(key)
        if not item:
            return None
        if item["expires_at"] < time.time():
            del self._cache[key]
            return None
        return item["value"]

    def _set_cached(self, key: str, value: dict) -> None:
        self._cache[key] = {
            "value": value,
            "expires_at": time.time() + UNSPLASH_CACHE_TTL_SECONDS,
        }

    async def get_category_image(self, category: str) -> dict:
        category = category.strip()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="category обязателен",
            )

        cached = self._get_cached(category.lower())
        if cached:
            return cached

        if not UNSPLASH_ACCESS_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Внешний API не настроен",
            )

        params = {
            "query": category,
            "orientation": "landscape",
            "per_page": 1,
        }

        headers = {
            "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}",
            "Accept-Version": "v1",
        }

        last_error: Optional[str] = None

        for attempt in range(UNSPLASH_MAX_RETRIES + 1):
            try:
                async with httpx.AsyncClient(timeout=UNSPLASH_TIMEOUT_SECONDS) as client:
                    response = await client.get(
                        f"{UNSPLASH_BASE_URL}/search/photos",
                        params=params,
                        headers=headers,
                    )

                if response.status_code == 429:
                    last_error = "Превышен лимит запросов к внешнему API"
                    if attempt < UNSPLASH_MAX_RETRIES:
                        await asyncio.sleep(1 + attempt)
                        continue
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail=last_error,
                    )

                response.raise_for_status()
                payload = response.json()
                results = payload.get("results") or []

                if not results:
                    normalized = {
                        "category": category,
                        "image_url": None,
                        "thumb_url": None,
                        "alt": f"Изображение по категории {category}",
                        "author_name": None,
                        "author_url": None,
                        "source": "unsplash",
                    }
                    self._set_cached(category.lower(), normalized)
                    return normalized

                item = results[0]
                user = item.get("user") or {}
                urls = item.get("urls") or {}

                normalized = {
                    "category": category,
                    "image_url": urls.get("regular"),
                    "thumb_url": urls.get("thumb"),
                    "alt": item.get("alt_description") or f"Изображение по категории {category}",
                    "author_name": user.get("name"),
                    "author_url": user.get("links", {}).get("html"),
                    "source": "unsplash",
                }
                self._set_cached(category.lower(), normalized)
                return normalized

            except httpx.TimeoutException:
                last_error = "Внешний API не ответил вовремя"
                if attempt < UNSPLASH_MAX_RETRIES:
                    await asyncio.sleep(1 + attempt)
                    continue
            except httpx.HTTPError as e:
                last_error = f"Ошибка внешнего API: {str(e)}"
                if attempt < UNSPLASH_MAX_RETRIES:
                    await asyncio.sleep(1 + attempt)
                    continue

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=last_error or "Внешний API недоступен",
        )


_unsplash_service = UnsplashService()


def get_unsplash_service() -> UnsplashService:
    return _unsplash_service