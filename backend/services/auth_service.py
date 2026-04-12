from __future__ import annotations

from fastapi import HTTPException, status

from config import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from repositories.refresh_repo import RefreshRepository
from repositories.users_repo import UsersRepository
from security import get_password_hash, verify_password
from token_utils import create_access_token, create_refresh_token


class AuthService:
    def __init__(self, users_repo: UsersRepository, refresh_repo: RefreshRepository):
        self.users_repo = users_repo
        self.refresh_repo = refresh_repo

    def register(self, username: str, password: str, full_name: str) -> dict:
        username = username.strip()
        if self.users_repo.exists(username):
            raise HTTPException(status_code=400, detail="Пользователь уже существует")

        role = "user"

        if len(password.encode("utf-8")) > 72:
            raise HTTPException(
                status_code=400,
                detail="Пароль слишком длинный (bcrypt максимум 72 байта)",
            )

        hashed = get_password_hash(password)
        self.users_repo.create(username, hashed, role, full_name)
        return {"success": True, "role": role}

    def login(self, username: str, password: str) -> tuple[str, str]:
        username = username.strip()
        user = self.users_repo.get_by_username(username)
        if not user or not verify_password(password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный логин или пароль",
            )

        access = create_access_token(
            subject=username,
            expires_minutes=ACCESS_TOKEN_EXPIRE_MINUTES,
        )
        refresh = create_refresh_token()
        self.refresh_repo.create(
            refresh,
            username=username,
            ttl_days=REFRESH_TOKEN_EXPIRE_DAYS,
        )
        return access, refresh

    def refresh(self, old_refresh: str) -> tuple[str, str]:
        session = self.refresh_repo.get(old_refresh)
        if not session or not self.refresh_repo.is_valid(session):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token недействителен",
            )

        new_access = create_access_token(
            subject=session.username,
            expires_minutes=ACCESS_TOKEN_EXPIRE_MINUTES,
        )
        new_refresh = create_refresh_token()
        self.refresh_repo.create(
            new_refresh,
            username=session.username,
            ttl_days=REFRESH_TOKEN_EXPIRE_DAYS,
        )
        self.refresh_repo.revoke(old_refresh, replaced_by_raw=new_refresh)

        return new_access, new_refresh

    def logout(self, refresh_token: str) -> None:
        if refresh_token:
            self.refresh_repo.revoke(refresh_token)