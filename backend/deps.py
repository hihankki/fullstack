from repositories.users_repo import UsersRepository
from repositories.refresh_repo import RefreshRepository
from services.auth_service import AuthService

_users_repo = UsersRepository()
_refresh_repo = RefreshRepository()
_auth_service = AuthService(users_repo=_users_repo, refresh_repo=_refresh_repo)


def get_auth_service() -> AuthService:
    return _auth_service