from jose import JWTError, jwt
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from security import SECRET_KEY, ALGORITHM
from db import users_db


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Middleware для проверки JWT и подстановки текущего пользователя в request.state.user.

    Логика:
    - Для путей /api/reviews с методами POST, PUT, DELETE:
      * проверяет заголовок Authorization: Bearer <token>
      * декодирует токен
      * находит пользователя в users_db
      * кладёт его в request.state.user
    - Для остальных запросов проверка не выполняется (они остаются публичными).
    """

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        method = request.method

        # По умолчанию пользователь = None
        request.state.user = None

        # Защищаем только изменение отзывов
        if path.startswith("/api/reviews") and method in ("POST", "PUT", "DELETE"):
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Необходим токен авторизации (Bearer)"},
                )

            token = auth_header.split(" ", 1)[1]

            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                username: str = payload.get("sub")
                if username is None:
                    raise JWTError()
            except JWTError:
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Некорректный или просроченный токен"},
                )

            user = users_db.get(username)
            if not user:
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Пользователь из токена не найден"},
                )

            # Сохраняем пользователя в request.state
            request.state.user = user

        response = await call_next(request)
        return response
