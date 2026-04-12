from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()

import os

ACCESS_TOKEN_EXPIRE_MINUTES = 5
REFRESH_TOKEN_EXPIRE_DAYS = 7

REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_COOKIE_PATH = "/api/auth"
REFRESH_COOKIE_SAMESITE = "lax"
REFRESH_COOKIE_SECURE = False  # True для https

SECRET_KEY = os.getenv("SECRET_KEY", "dev_only_change_me")
ALGORITHM = "HS256"

APP_BASE_URL = os.getenv("APP_BASE_URL", "http://127.0.0.1:8000")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://127.0.0.1:5173")

UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY", "")
UNSPLASH_BASE_URL = "https://api.unsplash.com"
UNSPLASH_TIMEOUT_SECONDS = float(os.getenv("UNSPLASH_TIMEOUT_SECONDS", "5"))
UNSPLASH_MAX_RETRIES = int(os.getenv("UNSPLASH_MAX_RETRIES", "2"))
UNSPLASH_CACHE_TTL_SECONDS = int(os.getenv("UNSPLASH_CACHE_TTL_SECONDS", "1800"))