# Minimal test FastAPI app for debugging
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello from test app"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# For Vercel
handler = app