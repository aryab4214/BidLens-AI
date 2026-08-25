"""
Pydantic Data Models (Schemas) for BidLens AI
These define the shape of all API request/response bodies.
OWNER: Person 1 (You)
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any


# ── Document ──────────────────────────────────────────────
class DocumentUploadResponse(BaseModel):
    file_id: str
    filename: str
    sha256: str
    status: str
    message: str


# ── Audit ─────────────────────────────────────────────────
class AuditRequest(BaseModel):
    file_id: str
    tender_id: Optional[str] = None
    vendor_name: Optional[str] = None


class AuditResponse(BaseModel):
    audit_id: str
    status: str
    message: str
    results: Dict[str, Any]


# ── Compliance Result (from Rule Engine) ──────────────────
class ClauseResult(BaseModel):
    clause_id: str
    clause_name: str
    status: str            # "PASS", "FAIL", "EXEMPT", "PENDING"
    evidence_page: Optional[int] = None
    regulation_ref: Optional[str] = None
    reason: Optional[str] = None


# ── Risk ──────────────────────────────────────────────────
class RiskScore(BaseModel):
    overall_risk: str      # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    risk_score: float      # 0.0 to 1.0
    top_risks: list
    rejection_likely: bool


# ── Officer Review ────────────────────────────────────────
class OfficerDecision(BaseModel):
    audit_id: str
    action: str            # "APPROVE", "REJECT", "CLARIFY"
    justification: str     # Mandatory reason (immutably logged)
    officer_id: Optional[str] = None
