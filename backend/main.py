"""
BidLens AI - FastAPI Backend Entry Point
Layer 2 of the teacher-validated architecture.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import document, audit, review
from security.offline_mode import get_system_health_status

tags_metadata = [
    {
        "name": "System",
        "description": "Sovereign edge health metrics, air-gapped readiness, memory consumption, and CERT-In security integrity status.",
    },
    {
        "name": "Document",
        "description": "Tender RFP and vendor bid proposal document ingestion, cryptographic SHA-256 fingerprinting, and digital extraction.",
    },
    {
        "name": "Audit",
        "description": "Automated 3-branch evaluation orchestrating deterministic GFR 2017 rules, cross-document contradiction checks, and risk scoring.",
    },
    {
        "name": "Review",
        "description": "Human-in-the-loop procurement officer review portal, statutory override logs, and certified PDF dossier generation.",
    },
]

app = FastAPI(
    title="BidLens AI — Autonomous GeM Procurement Auditor API",
    description="""
## Smart India Hackathon (SIH) 2026 — Problem Statement ID: 26100

BidLens AI is an intelligent procurement compliance auditor designed for the **Government e-Marketplace (GeM)**.

### Key Architectural Pillars:
* **Deterministic GFR 2017 Rule Engine:** Zero-hallucination compliance audits for Rules 149, 160, 170 and MSME Order 2012.
* **Cross-Document Contradiction Detector:** Detects contradictory PANs, expired GSTINs, and inflated turnover claims across attachments.
* **100% Sovereign Edge Ready:** Operates fully air-gapped with zero external cloud retention.
* **Cryptographic Tamper-Proofing:** Immediate SHA-256 fingerprinting on document receipt.
""",
    version="1.0.0",
    contact={
        "name": "Team Hexagon (SIH26009)",
        "url": "https://bidlens-ai.vercel.app",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    openapi_tags=tags_metadata
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
