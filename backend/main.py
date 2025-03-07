from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.database import AsyncSessionLocal, engine
from backend import models
from pydantic import BaseModel
from typing import List
import csv
from io import StringIO, BytesIO
from openpyxl import load_workbook

# Initialize database
async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)

app = FastAPI(on_startup=[init_models])

# CORS configuration
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/assets/{asset_id}")
async def get_asset(asset_id: int, db: AsyncSession = Depends(get_db)):
    print(f"Fetching asset with asset_id: {asset_id}")
    result = await db.execute(select(models.Assets).where(models.Assets.asset_id == asset_id))
    asset = result.scalars().first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return {
        "asset_id": asset.asset_id,
        "asset_name": asset.asset_name,
        "asset_type": asset.asset_type,
    }

@app.get("/assets/{asset_id}/subgroups")
async def get_subgroups(asset_id: int, db: AsyncSession = Depends(get_db)):
    print(f"Fetching subgroups for asset_id: {asset_id}")
    result = await db.execute(select(models.Subgroups).where(models.Subgroups.asset_id == asset_id))
    subgroups = result.scalars().all()
    if not subgroups:
        print(f"No subgroups found for asset_id: {asset_id}")
        raise HTTPException(status_code=404, detail="Subgroups not found for the given asset ID")
    print(f"Found subgroups: {subgroups}")
    return subgroups

@app.get("/subgroups/{subgroup_id}")
async def get_subgroup(subgroup_id: int, db: AsyncSession = Depends(get_db)):
    print(f"Fetching subgroup for subgroup_id: {subgroup_id}")
    result = await db.execute(select(models.Subgroups).where(models.Subgroups.subgroup_id == subgroup_id))
    subgroup = result.scalars().first()
    if not subgroup:
        print(f"No subgroup found for subgroup_id: {subgroup_id}")
        raise HTTPException(status_code=404, detail="Subgroup not found")
    print(f"Found subgroup: {subgroup}")
    return subgroup

class AssetCreate(BaseModel):
    asset_name: str
    asset_type: str

@app.post("/assets")
async def create_asset(asset: AssetCreate, db: AsyncSession = Depends(get_db)):
    new_asset = models.Assets(asset_name=asset.asset_name, asset_type=asset.asset_type)
    db.add(new_asset)
    await db.commit()
    await db.refresh(new_asset)
    return new_asset

class AssetRename(BaseModel):
    asset_name: str

@app.put("/assets/{asset_id}")
async def rename_asset(asset_id: int, asset: AssetRename, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Assets).where(models.Assets.asset_id == asset_id))
    existing_asset = result.scalars().first()
    if not existing_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    existing_asset.asset_name = asset.asset_name
    await db.commit()
    await db.refresh(existing_asset)
    return existing_asset

class SubgroupCreate(BaseModel):
    subgroup_name: str

@app.post("/assets/{asset_id}/subgroups")
async def create_subgroup(asset_id: int, subgroup: SubgroupCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Assets).where(models.Assets.asset_id == asset_id))
    existing_asset = result.scalars().first()
    if not existing_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    new_subgroup = models.Subgroups(
        subgroup_name=subgroup.subgroup_name,
        asset_id=asset_id
    )
    db.add(new_subgroup)
    await db.commit()
    await db.refresh(new_subgroup)
    return new_subgroup

class SubgroupRename(BaseModel):
    subgroup_name: str

@app.put("/subgroups/{subgroup_id}")
async def rename_subgroup(subgroup_id: int, subgroup: SubgroupRename, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Subgroups).where(models.Subgroups.subgroup_id == subgroup_id))
    existing_subgroup = result.scalars().first()
    if not existing_subgroup:
        raise HTTPException(status_code=404, detail="Subgroup not found")
    
    existing_subgroup.subgroup_name = subgroup.subgroup_name
    await db.commit()
    await db.refresh(existing_subgroup)
    return existing_subgroup

class Tag(BaseModel):
    tag_name: str

@app.post("/upload_masterlist")
async def upload_masterlist(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file type")

    try:
        tags_column = "tags"
        content = await file.read()

        if file.filename.endswith('.csv'):
            content_str = content.decode("utf-8")
            reader = csv.DictReader(StringIO(content_str))

            async with db.begin():
                for row in reader:
                    masterlist = models.MasterList(file_name=row.get('file_name', 'Unknown'))
                    db.add(masterlist)
                    await db.flush()
                    
                    if tags_column in row and row[tags_column] is not None:
                        tags = row[tags_column].split(',')
                        for tag_name in tags:
                            tag = models.Tags(tag_name=tag_name.strip(), masterlist_id=masterlist.file_id)
                            db.add(tag)
                    else:
                        raise HTTPException(status_code=400, detail=f"Tags column '{tags_column}' not found or empty in the file")

        else:
            workbook = load_workbook(filename=BytesIO(content))
            sheet = workbook.active
            headers = [cell.value for cell in sheet[1]]
            
            tags_idx = headers.index(tags_column) if tags_column in headers else None
            if tags_idx is None:
                raise HTTPException(status_code=400, detail=f"Tags column '{tags_column}' not found in the file")

            async with db.begin():
                for row in sheet.iter_rows(min_row=2, values_only=True):
                    masterlist = models.MasterList(file_name=row[0] or 'Unknown')
                    db.add(masterlist)
                    await db.flush()

                    if row[tags_idx] is not None:
                        tags = row[tags_idx].split(',')
                        for tag_name in tags:
                            tag = models.Tags(tag_name=tag_name.strip(), masterlist_id=masterlist.file_id)
                            db.add(tag)
                    else:
                        raise HTTPException(status_code=400, detail=f"Tags column '{tags_column}' is empty in the file")

        await db.commit()
        return {"message": "Masterlist uploaded successfully", "file_id": masterlist.file_id, "file_name": masterlist.file_name}

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/tags/{file_id}", response_model=List[Tag])
async def get_tags_by_file_id(file_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Tags).where(models.Tags.file_id == file_id))
    tags = result.scalars().all()
    if not tags:
        raise HTTPException(status_code=404, detail="Tags not found for the given file ID")
    return tags

@app.get("/masterlist/latest", response_model=dict)
async def get_latest_masterlist(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.MasterList).order_by(models.MasterList.file_id.desc()).limit(1))
    masterlist = result.scalars().first()
    if not masterlist:
        raise HTTPException(status_code=404, detail="No masterlist found")

    return {"file_id": masterlist.file_id, "file_name": masterlist.file_name}