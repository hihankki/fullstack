from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_reviews():
    return {"message": "Get reviews endpoint"}

@router.post("/")
async def create_review():
    return {"message": "Create review endpoint"}