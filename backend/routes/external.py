from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from services.weather_service import WeatherService, get_weather_service

router = APIRouter()


@router.get("/weather")
async def get_weather(
    city: str = Query(..., min_length=1, max_length=100),
    service: WeatherService = Depends(get_weather_service),
):
    return await service.get_weather_by_city(city)