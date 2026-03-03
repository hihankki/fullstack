from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

from token_utils import hash_token


REFRESH_FILE = Path(__file__).resolve().parent.parent / "refresh_tokens.json"


@dataclass
class RefreshSession:
    token_hash: str
    username: str
    expires_at: str  # ISO
    revoked: bool
    created_at: str  # ISO
    replaced_by: Optional[str] = None  # hash нового токена (для ротации)


class RefreshRepository:
    def __init__(self) -> None:
        self._db: dict[str, dict] = {}
        self._load()

    def _load(self) -> None:
        if REFRESH_FILE.exists():
            try:
                self._db = json.loads(REFRESH_FILE.read_text(encoding="utf-8"))
                if not isinstance(self._db, dict):
                    self._db = {}
            except Exception:
                self._db = {}
        else:
            self._db = {}

    def _save(self) -> None:
        REFRESH_FILE.write_text(json.dumps(self._db, ensure_ascii=False, indent=2), encoding="utf-8")

    def create(self, raw_token: str, username: str, ttl_days: int) -> str:
        token_h = hash_token(raw_token)
        now = datetime.utcnow()
        exp = now + timedelta(days=ttl_days)

        self._db[token_h] = {
            "token_hash": token_h,
            "username": username,
            "expires_at": exp.isoformat(),
            "revoked": False,
            "created_at": now.isoformat(),
            "replaced_by": None,
        }
        self._save()
        return token_h

    def get(self, raw_token: str) -> Optional[RefreshSession]:
        token_h = hash_token(raw_token)
        rec = self._db.get(token_h)
        if not rec:
            return None
        return RefreshSession(**rec)

    def revoke(self, raw_token: str, replaced_by_raw: Optional[str] = None) -> None:
        token_h = hash_token(raw_token)
        if token_h not in self._db:
            return
        self._db[token_h]["revoked"] = True
        if replaced_by_raw:
            self._db[token_h]["replaced_by"] = hash_token(replaced_by_raw)
        self._save()

    def is_valid(self, session: RefreshSession) -> bool:
        if session.revoked:
            return False
        try:
            exp = datetime.fromisoformat(session.expires_at)
        except Exception:
            return False
        return datetime.utcnow() < exp