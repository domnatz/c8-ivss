from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Get database URL from environment variable or use default
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres.nelomoznvrrkjoyfmvkd:domNATZ02**@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres")

# Create asynchronous engine
engine = create_async_engine(
    DATABASE_URL, 
    echo=False,  # Disable echo in production
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,  # Recycle connections every 5 minutes
)

# Create a configured "Session" class
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Create a Base class for our models to inherit from
Base = declarative_base()