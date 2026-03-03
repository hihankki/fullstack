from __future__ import annotations

from enum import Enum
from typing import Iterable, Set

from fastapi import Depends, HTTPException, status

from security import get_current_user


class Role(str, Enum):
    guest = "guest"
    user = "user"
    admin = "admin"


class Permission(str, Enum):
    REVIEWS_READ = "reviews:read"
    REVIEWS_CREATE = "reviews:create"
    REVIEWS_UPDATE_OWN = "reviews:update_own"
    REVIEWS_DELETE_OWN = "reviews:delete_own"
    REVIEWS_UPDATE_ANY = "reviews:update_any"
    REVIEWS_DELETE_ANY = "reviews:delete_any"
    USERS_MANAGE_ROLES = "users:manage_roles"


ROLE_PERMISSIONS: dict[str, Set[str]] = {
    Role.guest.value: {
        Permission.REVIEWS_READ.value,
    },
    Role.user.value: {
        Permission.REVIEWS_READ.value,
        Permission.REVIEWS_CREATE.value,
        Permission.REVIEWS_UPDATE_OWN.value,
        Permission.REVIEWS_DELETE_OWN.value,
    },
    Role.admin.value: {
        Permission.REVIEWS_READ.value,
        Permission.REVIEWS_CREATE.value,
        Permission.REVIEWS_UPDATE_ANY.value,
        Permission.REVIEWS_DELETE_ANY.value,
        Permission.USERS_MANAGE_ROLES.value,
    },
}


def has_permission(role: str, permission: str) -> bool:
    perms = ROLE_PERMISSIONS.get(role, set())
    return permission in perms


def require_permissions(*permissions: str):
    """
    FastAPI dependency:
    - требует авторизацию (JWT)
    - проверяет, что у роли есть ВСЕ permissions
    """
    async def _dep(current_user: dict = Depends(get_current_user)) -> dict:
        role = (current_user.get("role") or Role.user.value).lower()
        missing = [p for p in permissions if not has_permission(role, p)]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Недостаточно прав (missing: {', '.join(missing)})",
            )
        return current_user

    return _dep