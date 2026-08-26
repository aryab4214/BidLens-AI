"""
BidLens AI - FastAPI Backend Entry Point
Layer 2 of the teacher-validated architecture.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import document, audit, review
from security.offline_mode import get_system_health_status

app = FastAPI(
    title="BidLens AI",
    description="AI-Powered GeM Bid Compliance Verification Platform - SIH 2026",
    version="1.0.0"
)

# Allow frontend (Next.js on port 3000) and any local client to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all route groups
app.include_router(document.router, prefix="/document", tags=["Document"])
app.include_router(audit.router,    prefix="/audit",    tags=["Audit"])
app.include_router(review.router,   prefix="/review",   tags=["Review"])


@app.get("/")
def root():
    return {
        "service": "BidLens AI Sovereign Backend",
        "version": "1.0.0",
        "status": "OPERATIONAL",
        "mode": "OFFLINE_EDGE_READY",
        "docs": "http://localhost:8000/docs"
    }


@app.get("/system/health", tags=["System"])
def system_health():
    """Returns sovereign system status, offline metrics, and security integrity."""
    return get_system_health_status()
