"""
BidLens AI — FastAPI Backend Entry Point
Layer 2 of the teacher-validated architecture.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import document, audit, review

app = FastAPI(
    title="BidLens AI",
    description="AI-Powered GeM Bid Compliance Verification Platform — SIH 2026",
    version="1.0.0"
)

# Allow frontend (Next.js on port 3000) to talk to backend (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
        "service": "BidLens AI Backend",
        "version": "1.0.0",
        "status": "running",
        "docs": "http://localhost:8000/docs"
    }


# Run with: uvicorn main:app --reload
# Then open: http://localhost:8000/docs
