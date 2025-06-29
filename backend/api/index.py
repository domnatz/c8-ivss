# Vercel serverless function entry point
import sys
import os

# Add the parent directory to Python path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from main import app
    # This is required for Vercel to recognize the app  
    handler = app
except Exception as e:
    print(f"Error importing app: {e}")
    # Create a simple fallback app
    from fastapi import FastAPI
    handler = FastAPI()
    
    @handler.get("/")
    async def fallback():
        return {"error": "Import failed", "message": str(e)}