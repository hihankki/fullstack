from fastapi import APIRouter, Depends, Response, Request, status
from fastapi.security import OAuth2PasswordRequestForm

from config import (
    REFRESH_COOKIE_NAME,
    REFRESH_COOKIE_PATH,
    REFRESH_COOKIE_SAMESITE,
    REFRESH_COOKIE_SECURE,
)
from deps import get_auth_service
from schemas import RegisterRequest, Token
from services.auth_service import AuthService
from security import get_current_user

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, auth: AuthService = Depends(get_auth_service)):
    return auth.register(username=data.username, password=data.password, full_name=data.full_name)


@router.post("/login", response_model=Token)
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth: AuthService = Depends(get_auth_service),
):
    access, refresh = auth.login(form_data.username, form_data.password)

    # refresh -> HttpOnly cookie
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh,
        httponly=True,
        secure=REFRESH_COOKIE_SECURE,
        samesite=REFRESH_COOKIE_SAMESITE,
        path=REFRESH_COOKIE_PATH,
    )
    return Token(access_token=access, token_type="bearer")


@router.post("/refresh", response_model=Token)
async def refresh(
    request: Request,
    response: Response,
    auth: AuthService = Depends(get_auth_service),
):
    old_refresh = request.cookies.get(REFRESH_COOKIE_NAME) or ""
    access, new_refresh = auth.refresh(old_refresh)

    # ротация refresh cookie
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=new_refresh,
        httponly=True,
        secure=REFRESH_COOKIE_SECURE,
        samesite=REFRESH_COOKIE_SAMESITE,
        path=REFRESH_COOKIE_PATH,
    )
    return Token(access_token=access, token_type="bearer")


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    response: Response,
    auth: AuthService = Depends(get_auth_service),
):
    refresh = request.cookies.get(REFRESH_COOKIE_NAME) or ""
    auth.logout(refresh)

    # очищаем cookie
    response.delete_cookie(key=REFRESH_COOKIE_NAME, path=REFRESH_COOKIE_PATH)
    return


@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user["username"],
        "role": current_user.get("role", "user"),
        "full_name": current_user.get("display_name") or current_user["username"],
    }