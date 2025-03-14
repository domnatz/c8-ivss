from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
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
from fastapi.responses import JSONResponse

# Initialize database
async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)

# Create FastAPI app and initialize database on startup
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

# Root endpoint
@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI Backend!"}

# Endpoint to get all assets
@app.get("/api/assets")
async def get_assets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Assets))
    assets = result.scalars().all()
    return assets

# Endpoint to get a specific asset by ID
@app.get("/api/assets/{asset_id}")
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

# Endpoint to get subgroups of a specific asset
@app.get("/api/assets/{asset_id}/subgroups")
async def get_subgroups(asset_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Subgroups).where(models.Subgroups.asset_id == asset_id))
    subgroups = result.scalars().all()
    if not subgroups:
        raise HTTPException(status_code=404, detail="Subgroups not found for the given asset ID")
    return subgroups

# Endpoint to get a specific subgroup by ID
@app.get("/api/subgroups/{subgroup_id}")
async def get_subgroup(subgroup_id: int, db: AsyncSession = Depends(get_db)):
    print(f"Fetching subgroup for subgroup_id: {subgroup_id}")
    result = await db.execute(select(models.Subgroups).where(models.Subgroups.subgroup_id == subgroup_id))
    subgroup = result.scalars().first()
    if not subgroup:
        print(f"No subgroup found for subgroup_id: {subgroup_id}")
        raise HTTPException(status_code=404, detail="Subgroup not found")
    print(f"Found subgroup: {subgroup}")
    return subgroup

# Pydantic model for creating an asset
class AssetCreate(BaseModel):
    asset_name: str
    asset_type: str

# Endpoint to create a new asset
@app.post("/api/assets")
async def create_asset(asset: AssetCreate, db: AsyncSession = Depends(get_db)):
    new_asset = models.Assets(asset_name=asset.asset_name, asset_type=asset.asset_type)
    db.add(new_asset)
    await db.commit()
    await db.refresh(new_asset)
    return new_asset

# Pydantic model for renaming an asset
class AssetRename(BaseModel):
    asset_name: str

# Endpoint to rename an existing asset
@app.put("/api/assets/{asset_id}")
async def rename_asset(asset_id: int, asset: AssetRename, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Assets).where(models.Assets.asset_id == asset_id))
    existing_asset = result.scalars().first()
    if not existing_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    existing_asset.asset_name = asset.asset_name
    await db.commit()
    await db.refresh(existing_asset)
    return existing_asset

# Pydantic model for creating a subgroup
class SubgroupCreate(BaseModel):
    subgroup_name: str

# Endpoint to create a new subgroup for a specific asset
@app.post("/api/assets/{asset_id}/subgroups")
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

# Pydantic model for renaming a subgroup
class SubgroupRename(BaseModel):
    subgroup_name: str

# Endpoint to rename an existing subgroup
@app.put("/api/subgroups/{subgroup_id}")
async def rename_subgroup(subgroup_id: int, subgroup: SubgroupRename, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Subgroups).where(models.Subgroups.subgroup_id == subgroup_id))
    existing_subgroup = result.scalars().first()
    if not existing_subgroup:
        raise HTTPException(status_code=404, detail="Subgroup not found")
    
    existing_subgroup.subgroup_name = subgroup.subgroup_name
    await db.commit()
    await db.refresh(existing_subgroup)
    return existing_subgroup

# Pydantic model for a tag
class Tag(BaseModel):
    tag_name: str

# Endpoint to upload a masterlist file and process its content
@app.post("/api/upload_masterlist")
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
                masterlist = models.MasterList(file_name=file.filename)
                db.add(masterlist)
                await db.flush()
                print(f"Added masterlist: {masterlist}")

                for row in reader:
                    print(f"Processing row: {row}")
                    if tags_column in row and row[tags_column] is not None:
                        tags = row[tags_column].split(',')
                        for tag_name in tags:
                            tag = models.Tags(tag_name=tag_name.strip(), file_id=masterlist.file_id, tag_type="default")
                            db.add(tag)
                            print(f"Added tag: {tag}")
                    else:
                        print(f"Tags column '{tags_column}' not found or empty in the file")
                        raise HTTPException(status_code=400, detail=f"Tags column '{tags_column}' not found or empty in the file")

        else:
            workbook = load_workbook(filename=BytesIO(content))
            sheet = workbook.active
            headers = [cell.value for cell in sheet[1]]
            
            tags_idx = headers.index(tags_column) if tags_column in headers else None
            if tags_idx is None:
                print(f"Tags column '{tags_column}' not found in the file")
                raise HTTPException(status_code=400, detail=f"Tags column '{tags_column}' not found in the file")

            async with db.begin():
                masterlist = models.MasterList(file_name=file.filename)
                db.add(masterlist)
                await db.flush()
                print(f"Added masterlist: {masterlist}")

                for row in sheet.iter_rows(min_row=2, values_only=True):
                    print(f"Processing row: {row}")
                    if row[tags_idx] is not None:
                        tags = row[tags_idx].split(',')
                        for tag_name in tags:
                            tag = models.Tags(tag_name=tag_name.strip(), file_id=masterlist.file_id, tag_type="default")
                            db.add(tag)
                            print(f"Added tag: {tag}")
                    else:
                        print(f"Tags column '{tags_column}' is empty in the file")
                        raise HTTPException(status_code=400, detail=f"Tags column '{tags_column}' is empty in the file")

        await db.commit()
        return {"message": "Masterlist uploaded successfully", "file_id": masterlist.file_id, "file_name": masterlist.file_name}

    except Exception as e:
        await db.rollback()
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
# Endpoint to get tags by file ID
@app.get("/api/tags")
async def get_tags_by_file_id(file_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Tags).where(models.Tags.file_id == file_id))
    tags = result.scalars().all()
    if not tags:
        raise HTTPException(status_code=404, detail="Tags not found for the given file ID")
    return tags

# Endpoint to get the latest masterlist
@app.get("/api/masterlist/latest")
async def get_latest_masterlist(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.MasterList).order_by(models.MasterList.file_id.desc()).limit(1))
    masterlist = result.scalars().first()
    if not masterlist:
        raise HTTPException(status_code=404, detail="No masterlist found")
    return {"file_id": masterlist.file_id, "file_name": masterlist.file_name}

# Endpoint to get a masterlist by file ID
@app.get("/api/masterlist/{file_id}")
async def get_masterlist_by_file_id(file_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.MasterList).where(models.MasterList.file_id == file_id))
    masterlist = result.scalars().first()
    if not masterlist:
        raise HTTPException(status_code=404, detail="Masterlist not found for the given file ID")
    return {"file_id": masterlist.file_id, "file_name": masterlist.file_name}

# Pydantic model for creating a subgroup tag
class SubgroupTagCreate(BaseModel):
    tag_id: int
    tag_name: str

# Endpoint to add a tag to a subgroup
@app.post("/api/subgroups/{subgroup_id}/tags", status_code=status.HTTP_201_CREATED)
async def add_tag_to_subgroup(subgroup_id: int, tag: SubgroupTagCreate, db: AsyncSession = Depends(get_db)):
    print(f"Received request to add tag {tag.tag_id} to subgroup {subgroup_id}")
    try:
        result = await db.execute(select(models.Subgroups).where(models.Subgroups.subgroup_id == subgroup_id))
        existing_subgroup = result.scalars().first()
        if not existing_subgroup:
            return JSONResponse(status_code=404, content={"detail": "Subgroup not found"})

        new_subgroup_tag = models.SubgroupTag(
            subgroup_id=subgroup_id,
            tag_id=tag.tag_id,
            subgroup_tag_name=tag.tag_name  # Ensure this field is set
        )
        db.add(new_subgroup_tag)
        await db.commit()
        await db.refresh(new_subgroup_tag)
        print(f"Added tag {tag.tag_id} to subgroup {subgroup_id}")
        return new_subgroup_tag
    except Exception as e:
        print(f"Error adding tag to subgroup: {e}")
        return JSONResponse(status_code=500, content={"detail": f"Internal Server Error: {str(e)}"})
    
# Endpoint to get tags of a specific subgroup
@app.get("/api/subgroups/{subgroup_id}/tags")
async def get_subgroup_tags(subgroup_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.SubgroupTag).where(models.SubgroupTag.subgroup_id == subgroup_id))
    tags = result.scalars().all()
    if not tags:
        raise HTTPException(status_code=404, detail="Tags not found for the given subgroup ID")
    return tags

# Endpoint to get all masterlists
@app.get("/api/masterlists")
async def get_all_masterlists(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.MasterList))
    masterlists = result.scalars().all()
    if not masterlists:
        raise HTTPException(status_code=404, detail="No masterlists found")
    return masterlists