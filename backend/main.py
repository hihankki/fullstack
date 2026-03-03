from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import auth, reviews
from routes import admin as admin_routes

app = FastAPI(title="MVP API (Access+Refresh)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://[::1]:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://[::1]:5173",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(admin_routes.router, prefix="/api/admin", tags=["admin"])

@app.get("/api/health")
async def health():
    return {"ok": True}