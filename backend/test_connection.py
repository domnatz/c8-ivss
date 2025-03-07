import asyncio
import asyncpg

DATABASE_URL = "postgresql://postgres.nelomoznvrrkjoyfmvkd:domNATZ02**@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def test_connection():
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Connected successfully!")
        await conn.close()
    except Exception as e:
        print(f"❌ Connection failed: {e}")

asyncio.run(test_connection())