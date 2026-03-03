from __future__ import annotations

from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

from repositories.users_repo import UsersRepository
from token_utils import decode_access_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# ✅ singleton репозиторий прямо тут, чтобы не было deps.py -> security.py -> deps.py
_users_repo_singleton = UsersRepository()


def get_users_repo() -> UsersRepository:
    return _users_repo_singleton


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    users_repo: UsersRepository = Depends(get_users_repo),
) -> dict:
    try:
        payload = decode_access_token(token)
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Токен недействителен или истёк",
        )

    user = users_repo.get_by_username(username)
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    return user