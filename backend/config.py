ACCESS_TOKEN_EXPIRE_MINUTES = 5          # короткий access
REFRESH_TOKEN_EXPIRE_DAYS = 7            # долгий refresh

REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_COOKIE_PATH = "/api/auth"        # refresh cookie только для auth-эндпоинтов
REFRESH_COOKIE_SAMESITE = "lax"          # для localhost ок
REFRESH_COOKIE_SECURE = False            # True если https