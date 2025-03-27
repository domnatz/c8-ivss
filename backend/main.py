# --- Import section ---
# Core FastAPI components
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from backend.database import AsyncSessionLocal, engine
from backend import models
from pydantic import BaseModel
import re
from typing import List, Dict, Any, Optional
import csv
from io import StringIO, BytesIO
from openpyxl import load_workbook, Workbook
from fastapi.responses import JSONResponse, FileResponse
import os
import tempfile

# --- Database initialization ---
# This function runs at app startup to create database tables
async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)

# Create our FastAPI application
app = FastAPI(on_startup=[init_models])

# --- CORS configuration ---
# Allow frontend requests from localhost
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

# --- Database session helper ---
# Creates a new database connection for each request
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# --- Base health check endpoint ---
@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI Backend!"}

# --- Asset Management Endpoints ---

# Get all assets in the system
@app.get("/api/assets")
async def get_assets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Assets))
    assets = result.scalars().all()
    return assets

# Get a single asset by ID
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

# Get all subgroups that belong to a specific asset
@app.get("/api/assets/{asset_id}/subgroups")
async def get_subgroups(asset_id: int, db: AsyncSession = Depends(get_db)):
    # First check if the asset exists
    asset_result = await db.execute(select(models.Assets).where(models.Assets.asset_id == asset_id))
    asset = asset_result.scalars().first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Get subgroups (may be empty)
    result = await db.execute(select(models.Subgroups).where(models.Subgroups.asset_id == asset_id))
    subgroups = result.scalars().all()
    return subgroups

# Get details for a specific subgroup
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

# Data validation model for creating assets
class AssetCreate(BaseModel):
    asset_name: str
    asset_type: str

# Create a new asset
@app.post("/api/assets")
async def create_asset(asset: AssetCreate, db: AsyncSession = Depends(get_db)):
    new_asset = models.Assets(asset_name=asset.asset_name, asset_type=asset.asset_type)
    db.add(new_asset)
    await db.commit()
    await db.refresh(new_asset)
    return new_asset

# Data validation for renaming an asset
class AssetRename(BaseModel):
    asset_name: str

# Rename an existing asset
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

# Data validation for creating subgroups
class SubgroupCreate(BaseModel):
    subgroup_name: str

# Create a new subgroup within an asset
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

# Data validation for renaming subgroups
class SubgroupRename(BaseModel):
    subgroup_name: str

# Rename an existing subgroup
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

# Data validation for tags
class Tag(BaseModel):
    tag_name: str

# --- Masterlist Management ---

# Upload a masterlist file (CSV or Excel) and extract tags
@app.post("/api/upload_masterlist")
async def upload_masterlist(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    # Validate file type
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file type")

    try:
        tags_column = "tags"
        content = await file.read()

        # Handle CSV files
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
                        # Split tags by comma and process each one
                        tags = row[tags_column].split(',')
                        for tag_name in tags:
                            tag = models.Tags(tag_name=tag_name.strip(), file_id=masterlist.file_id, tag_type="default")
                            db.add(tag)
                            print(f"Added tag: {tag}")
                    else:
                        print(f"Tags column '{tags_column}' not found or empty in the file")
                        raise HTTPException(status_code=400, detail=f"Tags column '{tags_column}' not found or empty in the file")

        # Handle Excel files
        else:
            workbook = load_workbook(filename=BytesIO(content))
            sheet = workbook.active
            headers = [cell.value for cell in sheet[1]]
            
            # Find tags column index
            tags_idx = headers.index(tags_column) if tags_column in headers else None
            if tags_idx is None:
                print(f"Tags column '{tags_column}' not found in the file")
                raise HTTPException(status_code=400, detail=f"Tags column '{tags_column}' not found in the file")

            async with db.begin():
                masterlist = models.MasterList(file_name=file.filename)
                db.add(masterlist)
                await db.flush()
                print(f"Added masterlist: {masterlist}")

                # Process each row starting from row 2 (after headers)
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
    
# Get all tags from a specific masterlist
@app.get("/api/tags")
async def get_tags_by_file_id(file_id: int, db: AsyncSession = Depends(get_db)):
    # First check if the file exists
    file_result = await db.execute(select(models.MasterList).where(models.MasterList.file_id == file_id))
    file = file_result.scalars().first()
    if not file:
        raise HTTPException(status_code=404, detail="Masterlist file not found")
    
    # Get tags (may be empty)
    result = await db.execute(select(models.Tags).where(models.Tags.file_id == file_id))
    tags = result.scalars().all()
    return tags

# Get the most recently uploaded masterlist
@app.get("/api/masterlist/latest")
async def get_latest_masterlist(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.MasterList).order_by(models.MasterList.file_id.desc()).limit(1))
    masterlist = result.scalars().first()
    if not masterlist:
        raise HTTPException(status_code=404, detail="No masterlist found")
    return {"file_id": masterlist.file_id, "file_name": masterlist.file_name}

# Get masterlist by ID
@app.get("/api/masterlist/{file_id}")
async def get_masterlist_by_file_id(file_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.MasterList).where(models.MasterList.file_id == file_id))
    masterlist = result.scalars().first()
    if not masterlist:
        raise HTTPException(status_code=404, detail="Masterlist not found for the given file ID")
    return {"file_id": masterlist.file_id, "file_name": masterlist.file_name}

# --- Subgroup Tag Management ---

# Data validation for creating subgroup tags
class SubgroupTagCreate(BaseModel):
    tag_id: int
    tag_name: str
    parent_subgroup_tag_id: int = None
    formula_id: int = None  # Optional formula ID

# Add a tag to a subgroup or as a child of another tag
@app.post("/api/subgroups/{subgroup_id}/tags", status_code=status.HTTP_201_CREATED)
async def add_tag_to_subgroup(subgroup_id: int, tag: SubgroupTagCreate, db: AsyncSession = Depends(get_db)):
    print(f"Received request to add tag {tag.tag_id} to subgroup {subgroup_id}")
    try:
        # Check if formula exists if formula_id is provided
        if tag.formula_id:
            formula_result = await db.execute(select(models.Formulas).where(models.Formulas.formula_id == tag.formula_id))
            formula = formula_result.scalars().first()
            if not formula:
                return JSONResponse(status_code=404, content={"detail": "Formula not found"})
                
        # Only verify the subgroup exists if this is a root-level tag (no parent)
        if tag.parent_subgroup_tag_id is None:
            result = await db.execute(select(models.Subgroups).where(models.Subgroups.subgroup_id == subgroup_id))
            existing_subgroup = result.scalars().first()
            if not existing_subgroup:
                return JSONResponse(status_code=404, content={"detail": "Subgroup not found"})
            
            # This is a root-level tag, associate it with the subgroup
            new_subgroup_tag = models.SubgroupTag(
                subgroup_id=subgroup_id,
                tag_id=tag.tag_id,
                subgroup_tag_name=tag.tag_name,
                parent_subgroup_tag_id=None,
                formula_id=tag.formula_id
            )
        else:
            # This is a child tag, only associate it with the parent tag
            # First, verify the parent tag exists
            result = await db.execute(
                select(models.SubgroupTag).where(models.SubgroupTag.subgroup_tag_id == tag.parent_subgroup_tag_id)
            )
            parent_tag = result.scalars().first()
            if not parent_tag:
                return JSONResponse(status_code=404, content={"detail": "Parent tag not found"})
            
            # Create child tag without subgroup_id
            new_subgroup_tag = models.SubgroupTag(
                subgroup_id=None,  # No direct association with subgroup
                tag_id=tag.tag_id,
                subgroup_tag_name=tag.tag_name,
                parent_subgroup_tag_id=tag.parent_subgroup_tag_id,
                formula_id=tag.formula_id
            )

        db.add(new_subgroup_tag)
        await db.commit()
        await db.refresh(new_subgroup_tag)
        print(f"Added tag {tag.tag_id} to {'subgroup ' + str(subgroup_id) if tag.parent_subgroup_tag_id is None else 'parent tag ' + str(tag.parent_subgroup_tag_id)}")
        return new_subgroup_tag
    except Exception as e:
        print(f"Error adding tag to subgroup: {e}")
        return JSONResponse(status_code=500, content={"detail": f"Internal Server Error: {str(e)}"})
    
# Get all tags for a specific subgroup
@app.get("/api/subgroups/{subgroup_id}/tags")
async def get_subgroup_tags(subgroup_id: int, db: AsyncSession = Depends(get_db)):
    # First check if the subgroup exists
    subgroup_result = await db.execute(select(models.Subgroups).where(models.Subgroups.subgroup_id == subgroup_id))
    subgroup = subgroup_result.scalars().first()
    if not subgroup:
        raise HTTPException(status_code=404, detail="Subgroup not found")
    
    # Get tags (may be empty)
    result = await db.execute(select(models.SubgroupTag).where(models.SubgroupTag.subgroup_id == subgroup_id))
    tags = result.scalars().all()
    return tags

# Get all masterlist files
@app.get("/api/masterlists")
async def get_all_masterlists(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.MasterList))
    masterlists = result.scalars().all()
    return masterlists  # Might be an empty list if none exist

# --- Formula Management ---

# Data validation for creating formulas
class FormulaCreate(BaseModel):
    formula_name: str
    formula_desc: str = None
    formula_expression: str
    num_parameters: int

# Data validation for formula evaluation
class FormulaEvaluationRequest(BaseModel):
    formula_id: int
    parameters: Dict[str, Any]

# Get all formulas
@app.get("/api/formulas")
async def get_formulas(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Formulas))
    formulas = result.scalars().all()
    return formulas

# Get a specific formula by ID
@app.get("/api/formulas/{formula_id}")
async def get_formula(formula_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Formulas).where(models.Formulas.formula_id == formula_id))
    formula = result.scalars().first()
    if not formula:
        raise HTTPException(status_code=404, detail="Formula not found")
    return formula

# Data validation for creating formulas - remove num_parameters
class FormulaCreate(BaseModel):
    formula_name: str
    formula_desc: str = None
    formula_expression: str

# Helper function to extract variables from formula expression
def extract_variables(formula_expression):
    # Find all instances of $variable in the expression
    # The pattern finds any $ followed by word characters (letters, numbers, underscore)
    variables = re.findall(r'\$([a-zA-Z_][a-zA-Z0-9_]*)', formula_expression)
    # Return unique variable names without the $ sign
    return list(set(variables))

# Create a new formula
@app.post("/api/formulas")
async def create_formula(formula: FormulaCreate, db: AsyncSession = Depends(get_db)):
    async with db.begin():
        new_formula = models.Formulas(
            formula_name=formula.formula_name,
            formula_desc=formula.formula_desc,
            formula_expression=formula.formula_expression
        )
        db.add(new_formula)
        await db.flush()  # Get the formula_id
        
        # Rest of the function stays the same...  # Get the formula_id
        
        # Extract variables from the formula expression
        variable_names = extract_variables(formula.formula_expression)
        
        # Create variable records
        for var_name in variable_names:
            variable = models.FormulaVariable(
                formula_id=new_formula.formula_id,
                variable_name=var_name  # Store without the $ prefix
            )
            db.add(variable)
    
    await db.refresh(new_formula)
    
    # Fetch variables to include in response
    variables_stmt = select(models.FormulaVariable).where(models.FormulaVariable.formula_id == new_formula.formula_id)
    variables_result = await db.execute(variables_stmt)
    variables = variables_result.scalars().all()
    
    return {**new_formula.__dict__, "variables": [{"variable_id": v.variable_id, "variable_name": v.variable_name} for v in variables]}

# Update an existing formula
@app.put("/api/formulas/{formula_id}")
async def update_formula(formula_id: int, formula: FormulaCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Formulas).where(models.Formulas.formula_id == formula_id))
    existing_formula = result.scalars().first()
    if not existing_formula:
        raise HTTPException(status_code=404, detail="Formula not found")
    
    async with db.begin():
        # Update formula fields
        existing_formula.formula_name = formula.formula_name
        existing_formula.formula_desc = formula.formula_desc
        existing_formula.formula_expression = formula.formula_expression
        
        # Handle variables - first delete all existing
        await db.execute(
            delete(models.FormulaVariable)
            .where(models.FormulaVariable.formula_id == formula_id)
        )
        
        # Extract variables from the updated formula expression
        variable_names = extract_variables(formula.formula_expression)
        
        # Create new variable records
        for var_name in variable_names:
            new_var = models.FormulaVariable(
                formula_id=formula_id,
                variable_name=var_name  # Store without the $ prefix
            )
            db.add(new_var)
    
    # Fetch updated variables to include in response
    variables_stmt = select(models.FormulaVariable).where(models.FormulaVariable.formula_id == formula_id)
    variables_result = await db.execute(variables_stmt)
    variables = variables_result.scalars().all()
    
    return {**existing_formula.__dict__, "variables": [{"variable_id": v.variable_id, "variable_name": v.variable_name} for v in variables]}
# Delete a formula
@app.delete("/api/formulas/{formula_id}")
async def delete_formula(formula_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Formulas).where(models.Formulas.formula_id == formula_id))
    formula = result.scalars().first()
    if not formula:
        raise HTTPException(status_code=404, detail="Formula not found")
    
    await db.delete(formula)
    await db.commit()
    return {"message": "Formula deleted successfully"}

#TENTATIVE, FOR FUTURE USE IN CASE NEEDED
# Evaluate a formula with provided parameters
@app.post("/api/formulas/evaluate")
async def evaluate_formula(request: FormulaEvaluationRequest, db: AsyncSession = Depends(get_db)):
    # Get the formula
    result = await db.execute(select(models.Formulas).where(models.Formulas.formula_id == request.formula_id))
    formula = result.scalars().first()
    if not formula:
        raise HTTPException(status_code=404, detail="Formula not found")
    
    try:
        # Create a safe evaluation environment with only the parameters provided
        eval_env = {**request.parameters}
        
        # Get the formula expression
        expression = formula.formula_expression
        
        # Basic security check to prevent potentially harmful code execution
        if re.search(r'(__|\bimport\b|\beval\b|\bexec\b|\bcompile\b|\bopen\b|\bread\b|\bwrite\b|\bsys\b|\bos\b)', expression):
            raise ValueError("Potentially unsafe formula expression")
        
        # Evaluate the formula with the provided parameters
        result = eval(expression, {"__builtins__": {}}, eval_env)
        return {"formula_id": formula.formula_id, "parameters": request.parameters, "result": result}
    except Exception as e:
        return {"formula_id": formula.formula_id, "parameters": request.parameters, "error": str(e)}
    
# --- Response Model for Subgroup Tags ---
class SubgroupTagResponse(BaseModel):
    subgroup_tag_id: int
    subgroup_tag_name: str
    parent_subgroup_tag_id: Optional[int]
    formula_id: Optional[int]

    class Config:
        orm_mode = True
        
# Get all child tags for a parent tag
@app.get("/api/subgroups/{subgroup_tag_id}/children_tags", response_model=List[SubgroupTagResponse])
async def get_children_tags(subgroup_tag_id: int, db: AsyncSession = Depends(get_db)):
    # First check if the parent tag exists
    parent_result = await db.execute(select(models.SubgroupTag).where(models.SubgroupTag.subgroup_tag_id == subgroup_tag_id))
    parent = parent_result.scalars().first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent tag not found")
    
    # Get children tags (may be empty)
    result = await db.execute(select(models.SubgroupTag).where(models.SubgroupTag.parent_subgroup_tag_id == subgroup_tag_id))
    children_tags = result.scalars().all()
    return children_tags

# Update the formula attached to a subgroup tag
@app.put("/api/subgroups/{subgroup_tag_id}/formula")
async def update_subgroup_tag_formula(
    subgroup_tag_id: int,
    formula_data: dict,
    db: AsyncSession = Depends(get_db)
):
    # Update the formula for a subgroup tag
    async with db.begin():
        # Get the subgroup tag
        stmt = select(models.SubgroupTag).where(models.SubgroupTag.subgroup_tag_id == subgroup_tag_id)
        result = await db.execute(stmt)
        subgroup_tag = result.scalar_one_or_none()
        
        if not subgroup_tag:
            raise HTTPException(status_code=404, detail=f"Subgroup tag with id {subgroup_tag_id} not found")
        
        # Update the formula ID
        subgroup_tag.formula_id = formula_data.get("formula_id")
        await db.commit()
    
    return {"message": "Formula assigned successfully"}

# Export subgroup tag data to Excel
@app.post("/api/subgroups/{subgroup_tag_id}/export")
async def export_subgroup_tag_data(subgroup_tag_id: int, db: AsyncSession = Depends(get_db)):
    # Get the parent tag
    stmt = select(models.SubgroupTag).where(models.SubgroupTag.subgroup_tag_id == subgroup_tag_id)
    result = await db.execute(stmt)
    parent_tag = result.scalar_one_or_none()
    
    if not parent_tag:
        raise HTTPException(status_code=404, detail=f"Subgroup tag with id {subgroup_tag_id} not found")
    
    # Get formula if it exists
    formula = None
    if parent_tag.formula_id:
        formula_stmt = select(models.Formulas).where(models.Formulas.formula_id == parent_tag.formula_id)
        formula_result = await db.execute(formula_stmt)
        formula = formula_result.scalar_one_or_none()
    
    # Get child tags
    child_tags_stmt = select(models.SubgroupTag).where(models.SubgroupTag.parent_subgroup_tag_id == subgroup_tag_id)
    child_tags_result = await db.execute(child_tags_stmt)
    child_tags = child_tags_result.scalars().all()
    
    # Create Excel workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "Subgroup Tag Data"
    
    # Add column headers
    headers = ["Parent Tag Name", "Formula Expression", "Child Tags"]
    for col, header in enumerate(headers, 1):
        ws.cell(row=1, column=col, value=header)
    
    # Add parent tag data
    ws.cell(row=2, column=1, value=parent_tag.subgroup_tag_name)
    ws.cell(row=2, column=2, value=formula.formula_expression if formula else "None")
    
    # Add child tags data
    if child_tags:
        for i, tag in enumerate(child_tags):
            ws.cell(row=i+2, column=3, value=tag.subgroup_tag_name)
    else:
        ws.cell(row=2, column=3, value="None")
    
    # Save to temporary file and return as download
    with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
        wb.save(tmp.name)
        file_path = tmp.name
    
    return FileResponse(
        file_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=f"subgroup_tag_{subgroup_tag_id}_export.xlsx"
    )