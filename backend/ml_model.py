# backend/ml_model.py
"""
Модуль для проверки токсичности с помощью уже обученной модели.

Использует:
- pymorphy2 (если есть) для лемматизации;
- простую токенизацию/фильтрацию без NLTK;
- сохранённую модель sentiment_model.pkl.

Если что-то идёт не так (нет модели/библиотек) — модерация
мягко отключается, и все тексты считаются НЕ токсичными,
чтобы НЕ ронять сервер.
"""

# ============================
# ПАТЧ ДЛЯ PYTHON 3.11+ (inspect.getargspec)
# ============================
import inspect
from collections import namedtuple

ArgSpec = getattr(
    inspect,
    "ArgSpec",
    namedtuple("ArgSpec", "args varargs keywords defaults")
)

def getargspec_compatible(func):
    fs = inspect.getfullargspec(func)
    return ArgSpec(
        args=fs.args,
        varargs=fs.varargs,
        keywords=fs.varkw,
        defaults=fs.defaults
    )

inspect.getargspec = getargspec_compatible

# ============================
# ИМПОРТЫ С ЗАЩИТОЙ
# ============================
import os
import re
from typing import Optional

try:
    import joblib
except Exception:
    joblib = None
    print("[toxicity] joblib недоступен, модерация отключена.")

try:
    import pymorphy2
except Exception:
    pymorphy2 = None
    print("[toxicity] pymorphy2 недоступен, лемматизация отключена.")


# ============================
# ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
# ============================
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "ml", "sentiment_model.pkl")

_model: Optional[object] = None
_morph: Optional[object] = None
_initialized: bool = False   # true, когда мы уже попытались инициализировать
_enabled: bool = False       # true, если модель реально работает


def _init():
    """
    Ленивая инициализация: вызывается только при первом predict.
    """
    global _initialized, _enabled, _model, _morph

    if _initialized:
        return

    _initialized = True
    _enabled = False

    # Инициализация pymorphy2 (если есть)
    if pymorphy2 is not None:
        try:
            _morph = pymorphy2.MorphAnalyzer()
        except Exception as e:
            print(f"[toxicity] Ошибка инициализации pymorphy2: {e}")
            _morph = None

    # Загрузка модели
    if joblib is None:
        print("[toxicity] joblib отсутствует, модель не будет загружена.")
        return

    if not os.path.exists(MODEL_PATH):
        print(f"[toxicity] Файл модели не найден: {MODEL_PATH}")
        return

    try:
        _model = joblib.load(MODEL_PATH)
        _enabled = True
        print(f"[toxicity] Модель токсичности загружена из {MODEL_PATH}")
    except Exception as e:
        print(f"[toxicity] Ошибка при загрузке модели: {e}")
        _model = None
        _enabled = False


# ============================
# ПРЕДОБРАБОТКА ТЕКСТА
# ============================
def _simple_tokenize(text: str):
    """
    Простейшая токенизация: берём только русские слова.
    """
    text = text.lower()
    # Находим подряд идущие буквы русского алфавита
    return re.findall(r"[а-яё]+", text)


def _lemm_russian(text: str) -> str:
    """
    Упрощённая версия lemm_russian:
    - токены по regex,
    - если есть pymorphy2 — лемматизация,
    - без стоп-слов, чтобы не зависеть от NLTK.
    """
    tokens = _simple_tokenize(text)
    if not tokens:
        return ""

    if _morph is None:
        # Нет pymorphy2 — просто объединяем токены
        return " ".join(tokens)

    lemmas = []
    for w in tokens:
        try:
            lemmas.append(_morph.parse(w)[0].normal_form)
        except Exception:
            lemmas.append(w)
    return " ".join(lemmas)


def predict_sentiment(text: str) -> str:
    """
    Возвращает:
    - "TOXIC"  если модель считает текст токсичным;
    - "NORMAL" если не токсичный;
    - "EMPTY"  если после обработки текст пустой;
    - если модель отключена — всегда "NORMAL".
    """
    _init()

    # Если модель не включена — ничего не блокируем
    if not _enabled or _model is None:
        return "NORMAL"

    processed = _lemm_russian(text)
    if not processed.strip():
        return "EMPTY"

    try:
        prediction = _model.predict([processed])[0]
        # считаем, что модель обучена на метках 0/1
        return "TOXIC" if int(prediction) == 1 else "NORMAL"
    except Exception as e:
        print(f"[toxicity] Ошибка при предсказании: {e}")
        return "NORMAL"


def is_toxic(text: str) -> bool:
    """
    True, если текст считаем токсичным.

    - Если модель отключена → всегда False.
    - Если модель вернула "TOXIC" → True.
    - "EMPTY" считаем НЕ токсичным.
    """
    label = predict_sentiment(text)
    return label == "TOXIC"
