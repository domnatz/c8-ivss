from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+asyncpg://postgres.nelomoznvrrkjoyfmvkd:domNATZ02**@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Create asynchronous engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Create a configured "Session" class
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Create a Base class for our models to inherit from
Base = declarative_base()