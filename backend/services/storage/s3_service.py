import boto3
from botocore.client import Config
import uuid

S3_ENDPOINT = "http://127.0.0.1:9000"
S3_ACCESS_KEY = "admin"
S3_SECRET_KEY = "password"
S3_BUCKET = "reviews"


class S3Service:
    def __init__(self):
        self.client = boto3.client(
            "s3",
            endpoint_url=S3_ENDPOINT,
            aws_access_key_id=S3_ACCESS_KEY,
            aws_secret_access_key=S3_SECRET_KEY,
            config=Config(signature_version="s3v4"),
            region_name="us-east-1",
        )

    def upload_file(self, file) -> str:
        file_id = str(uuid.uuid4())
        filename = f"{file_id}_{file.filename}"

        self.client.upload_fileobj(
            file.file,
            S3_BUCKET,
            filename,
            ExtraArgs={"ContentType": file.content_type},
        )

        return f"{S3_ENDPOINT}/{S3_BUCKET}/{filename}"