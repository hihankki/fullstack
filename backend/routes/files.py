from __future__ import annotations

import os
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile, status

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    original_name = file.filename or "file"
    safe_name = os.path.basename(original_name)

    if not safe_name or safe_name in {".", ".."}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Некорректное имя файла",
        )

    ext = os.path.splitext(safe_name)[1]
    generated_name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, generated_name)

    content = await file.read()
    with open(path, "wb") as f:
        f.write(content)

    return {
        "filename": generated_name,
        "original_filename": safe_name,
    }