from datetime import timedelta

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm

from schemas import RegisterRequest, Token
from db import users_db
from security import (
    get_password_hash,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user,
)

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest):
    """
    Регистрация нового пользователя.
    Если username == "admin" -> роль admin, иначе user.
    """
    if data.username in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким именем уже существует",
        )

    hashed_pw = get_password_hash(data.password)
    role = "admin" if data.username == "admin" else "user"

    users_db[data.username] = {
        "username": data.username,
        "hashed_password": hashed_pw,
        "role": role,
        "display_name": data.full_name,  # сохраняем имя
    }

    return {
        "success": True,
        "message": f"Регистрация прошла успешно (роль: {role})",
    }


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Логин: принимает form-data username/password, возвращает JWT.
    """
    username = form_data.username
    password = form_data.password

    user = users_db.get(username)
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": username},
        expires_delta=access_token_expires,
    )

    return Token(access_token=access_token, token_type="bearer")


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Возвращает информацию о текущем пользователе.
    """
    return {
        "username": current_user["username"],
        "role": current_user["role"],
        "full_name": current_user.get("display_name")
        or current_user["username"],
    }
