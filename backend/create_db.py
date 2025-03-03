import asyncio
import logging
from sqlalchemy.exc import SQLAlchemyError
from backend.database import engine, Base
import backend.models  # Import all models here

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

async def create_tables():
    async with engine.begin() as conn:
        try:
            logging.info("Creating tables...")
            await conn.run_sync(Base.metadata.create_all)
            logging.info("Tables created successfully!")
        except SQLAlchemyError as e:
            logging.error(f"Database error: {e}")
        except Exception as e:
            logging.error(f"Unexpected error: {e}")

if __name__ == "__main__":
    asyncio.run(create_tables())