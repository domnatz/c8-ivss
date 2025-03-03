import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://myuser:domnatz@localhost:5432/calibr8_ivss"

async def test_connection():
    engine = create_async_engine(DATABASE_URL, echo=True)

    try:
        async with engine.connect() as connection:
            result = await connection.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
    except SQLAlchemyError as e:
        print(f"❌ Database connection failed: {e}")

    await engine.dispose()

# Run the async function
asyncio.run(test_connection())
