from fastapi import APIRouter, UploadFile, File, HTTPException
from services.minio_service import upload_file_to_minio
import uuid

router = APIRouter()


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Файл не выбран")

    # уникальное имя
    unique_name = f"{uuid.uuid4()}_{file.filename}"

    try:
        url = upload_file_to_minio(file.file, unique_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки: {str(e)}")

    return {
        "filename": unique_name,
        "url": url,
    }