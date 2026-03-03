from __future__ import annotations

from typing import Optional

from db import users_db, save_users


class UsersRepository:
    def get_by_username(self, username: str) -> Optional[dict]:
        return users_db.get(username)

    def exists(self, username: str) -> bool:
        return username in users_db

    def create(self, username: str, hashed_password: str, role: str, display_name: str) -> dict:
        users_db[username] = {
            "username": username,
            "hashed_password": hashed_password,
            "role": role,
            "display_name": display_name,
        }
        save_users()
        return users_db[username]

    def set_role(self, username: str, role: str) -> None:
        if username in users_db:
            users_db[username]["role"] = role
            save_users()