import boto3
from botocore.client import Config

MINIO_ENDPOINT = "http://127.0.0.1:9000"
MINIO_ACCESS_KEY = "minioadmin"
MINIO_SECRET_KEY = "minioadmin"
MINIO_BUCKET = "reviews"


s3 = boto3.client(
    "s3",
    endpoint_url=MINIO_ENDPOINT,
    aws_access_key_id=MINIO_ACCESS_KEY,
    aws_secret_access_key=MINIO_SECRET_KEY,
    config=Config(signature_version="s3v4"),
    region_name="us-east-1",
)


def upload_file_to_minio(file_obj, filename: str) -> str:
    s3.upload_fileobj(file_obj, MINIO_BUCKET, filename)

    # ссылка на файл
    return f"{MINIO_ENDPOINT}/{MINIO_BUCKET}/{filename}"