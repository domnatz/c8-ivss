# Simple entry point for Vercel
from main import app

# Export for Vercel
def handler(request):
    return app(request)