from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from . import models

# Initialize database
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependency for database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI Backend!"}


@app.get("/assets")
def get_assets(db: Session = Depends(get_db)):
    assets = db.query(models.Assets).all()
    return assets


@app.post("/assets")
def create_asset(asset_name: str, asset_type: str, db: Session = Depends(get_db)):
    new_asset = models.Assets(asset_name=asset_name, asset_type=asset_type)
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset
