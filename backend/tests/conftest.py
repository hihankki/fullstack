import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Добавляем backend в sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from main import app  # noqa: E402


@pytest.fixture
def client():
    return TestClient(app)