from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import upload, documents, deposit, chat, rent, maintenance

app = FastAPI(
    title="LeaseGuard API",
    description="AI Tenant Protection Platform Backend",
    version="0.1.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api/v1", tags=["Lease Analysis"])
app.include_router(documents.router, prefix="/api/v1", tags=["Document Generation"])
app.include_router(deposit.router, prefix="/api/v1", tags=["Deposit Defender"])
app.include_router(chat.router, prefix="/api/v1", tags=["Voice Chat"])
app.include_router(rent.router, prefix="/api/v1", tags=["Rent Radar"])
app.include_router(maintenance.router, prefix="/api/v1", tags=["Maintenance & TTS"])

@app.get("/")
async def root():
    return {"message": "Welcome to LeaseGuard API", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
