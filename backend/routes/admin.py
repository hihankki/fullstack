from fastapi import APIRouter, Depends, HTTPException, status

from db import users_db, save_users
from rbac import Permission, Role, require_permissions
from schemas import RoleUpdate

router = APIRouter()


@router.get("/users", dependencies=[Depends(require_permissions(Permission.USERS_MANAGE_ROLES.value))])
async def list_users():
    return [
        {
            "username": u["username"],
            "role": u.get("role", "user"),
            "full_name": u.get("display_name") or u["username"],
        }
        for u in users_db.values()
    ]


@router.patch(
    "/users/{username}/role",
    dependencies=[Depends(require_permissions(Permission.USERS_MANAGE_ROLES.value))],
)
async def set_user_role(username: str, data: RoleUpdate):
    username = username.strip()
    user = users_db.get(username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )

    new_role = data.role.lower().strip()
    if new_role not in {Role.user.value, Role.admin.value}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="role должен быть 'user' или 'admin'",
        )

    user["role"] = new_role
    save_users()
    return {"success": True, "username": username, "role": new_role}