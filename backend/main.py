from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.database import AsyncSessionLocal, engine
from backend import models

# Initialize database
async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)

app = FastAPI(on_startup=[init_models])

# Dependency for database session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI Backend!"}

@app.get("/assets")
async def get_assets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Assets))
    assets = result.scalars().all()
    return assets

@app.post("/assets")
async def create_asset(asset_name: str, asset_type: str, db: AsyncSession = Depends(get_db)):
    new_asset = models.Assets(asset_name=asset_name, asset_type=asset_type)
    db.add(new_asset)
    await db.commit()
    await db.refresh(new_asset)
    return new_asset