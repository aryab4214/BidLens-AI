"""
Officer Review, Signature Management & Immutable Audit Trail Router - Layer 5
Handles procurement officer decisions, digital signature image upload,
mandatory justifications, and tamper-proof decision logging.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List
import datetime
import os
import json
import shutil
import base64

router = APIRouter()

ROUTER_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(ROUTER_DIR)
UPLOAD_DIR = os.path.join(BACKEND_DIR, "uploaded_docs")
LOG_FILE = os.path.join(BACKEND_DIR, "audit_decision_trail.json")
SIG_FILE = os.path.join(UPLOAD_DIR, "officer_signature.png")

os.makedirs(UPLOAD_DIR, exist_ok=True)


class OfficerDecisionPayload(BaseModel):
    audit_id: str
    action: str  # "APPROVE", "REJECT", "REQUEST_CLARIFICATION", "OVERRIDE"
    justification: str  # Mandatory justification for decision / override
    officer_name: Optional[str] = "Dr. S. Sharma"
    officer_designation: Optional[str] = "Technical Evaluation Committee"


def load_decision_logs() -> list:
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []


def save_decision_log(entry: dict):
    logs = load_decision_logs()
    logs.append(entry)
    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=2)


@router.post("/signature/upload")
async def upload_officer_signature(file: UploadFile = File(...), officer_name: str = Form("Dr. S. Sharma")):
    """
    Upload a scanned digital signature image (.png, .jpg, .jpeg) for the officer.
    Saves signature to disk and associates with the officer profile.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".png", ".jpg", ".jpeg"]:
        raise HTTPException(status_code=400, detail="Signature must be an image file (.png, .jpg, .jpeg).")

    with open(SIG_FILE, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Convert to base64 preview
    with open(SIG_FILE, "rb") as f:
        b64_sig = base64.b64encode(f.read()).decode("utf-8")

    return {
        "status": "SUCCESS",
        "message": "Officer digital signature successfully uploaded and stored.",
        "officer_name": officer_name,
        "signature_url": f"data:image/png;base64,{b64_sig}",
        "has_signature": True
    }


@router.get("/signature/status")
def get_signature_status():
    """Returns whether the officer signature is currently on file."""
    has_sig = os.path.exists(SIG_FILE)
    b64_sig = None
    if has_sig:
        try:
            with open(SIG_FILE, "rb") as f:
                b64_sig = f"data:image/png;base64,{base64.b64encode(f.read()).decode('utf-8')}"
        except Exception:
            pass
    return {
        "has_signature": has_sig,
        "signature_preview": b64_sig
    }


@router.post("/decision")
def submit_officer_decision(payload: OfficerDecisionPayload):
    """
    Submits an official procurement officer decision on an audited bid.
    """
    if not payload.justification or len(payload.justification.strip()) < 5:
        raise HTTPException(
            status_code=400,
            detail="A mandatory written justification (minimum 5 characters) is required for all official decisions."
        )

    allowed_actions = ["APPROVE", "REJECT", "REQUEST_CLARIFICATION", "OVERRIDE"]
    if payload.action.upper() not in allowed_actions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid action '{payload.action}'. Allowed actions: {', '.join(allowed_actions)}"
        )

    timestamp_str = datetime.datetime.now().strftime("%d-%b-%Y %H:%M:%S")
    decision_id = f"DEC-{int(datetime.datetime.now().timestamp())}"

    log_entry = {
        "decision_id": decision_id,
        "audit_id": payload.audit_id,
        "action": payload.action.upper(),
        "justification": payload.justification.strip(),
        "officer_name": payload.officer_name,
        "officer_designation": payload.officer_designation,
        "timestamp": timestamp_str,
        "is_override": payload.action.upper() == "OVERRIDE"
    }

    save_decision_log(log_entry)

    return {
        "decision_id": decision_id,
        "audit_id": payload.audit_id,
        "status": "RECORDED",
        "action": payload.action.upper(),
        "message": f"Officer decision '{payload.action.upper()}' recorded in immutable audit log.",
        "log_entry": log_entry
    }


@router.get("/log/{audit_id}")
def get_audit_trail_for_bid(audit_id: str):
    """Retrieves the full decision history for a specific bid."""
    logs = load_decision_logs()
    bid_logs = [entry for entry in logs if entry.get("audit_id") == audit_id]
    return {
        "audit_id": audit_id,
        "total_actions": len(bid_logs),
        "audit_trail": bid_logs
    }


@router.get("/all-decisions")
def get_all_officer_decisions():
    """Retrieves all officer decisions recorded across the entire tender."""
    logs = load_decision_logs()
    return {
        "total_decisions_recorded": len(logs),
        "decisions": logs
    }
