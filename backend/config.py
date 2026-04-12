from __future__ import annotations

import os

ACCESS_TOKEN_EXPIRE_MINUTES = 5
REFRESH_TOKEN_EXPIRE_DAYS = 7

REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_COOKIE_PATH = "/api/auth"
REFRESH_COOKIE_SAMESITE = "lax"
REFRESH_COOKIE_SECURE = False  # True для https

SECRET_KEY = os.getenv("SECRET_KEY", "dev_only_change_me")
ALGORITHM = "HS256"