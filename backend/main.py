from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import auth, reviews

app = FastAPI(
    title="Review Platform API",
    description="Backend for Review Platform with JWT auth and access control",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:3000"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# без AuthMiddleware, чтобы исключить подвисания
# если нужно в отчёт – можно потом подключить, когда всё будет работать

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])


@app.get("/")
async def root():
    return {"message": "Review Platform API is running"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
