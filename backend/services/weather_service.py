from __future__ import annotations

import httpx
from fastapi import HTTPException, status


class WeatherService:
    async def get_weather_by_city(self, city: str) -> dict:
        city = city.strip()
        if not city:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="city обязателен",
            )

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                geo_resp = await client.get(
                    "https://geocoding-api.open-meteo.com/v1/search",
                    params={
                        "name": city,
                        "count": 1,
                        "language": "ru",
                        "format": "json",
                    },
                )

            geo_resp.raise_for_status()
            geo_data = geo_resp.json()
            results = geo_data.get("results") or []

            if not results:
                return {
                    "city": city,
                    "resolved_name": None,
                    "country": None,
                    "temperature": None,
                    "wind_speed": None,
                    "weather_code": None,
                    "source": "open-meteo",
                }

            place = results[0]
            latitude = place["latitude"]
            longitude = place["longitude"]

            async with httpx.AsyncClient(timeout=8.0) as client:
                weather_resp = await client.get(
                    "https://api.open-meteo.com/v1/forecast",
                    params={
                        "latitude": latitude,
                        "longitude": longitude,
                        "current": "temperature_2m,wind_speed_10m,weather_code",
                    },
                )

            weather_resp.raise_for_status()
            weather_data = weather_resp.json()
            current = weather_data.get("current") or {}

            return {
                "city": city,
                "resolved_name": place.get("name"),
                "country": place.get("country"),
                "temperature": current.get("temperature_2m"),
                "wind_speed": current.get("wind_speed_10m"),
                "weather_code": current.get("weather_code"),
                "source": "open-meteo",
            }

        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Внешний API погоды не ответил вовремя",
            )
        except httpx.HTTPError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Внешний API погоды недоступен",
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Ошибка при получении погоды",
            )


_weather_service = WeatherService()


def get_weather_service() -> WeatherService:
    return _weather_service