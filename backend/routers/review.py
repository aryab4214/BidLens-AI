"""
Review Router — Layer 5 (Officer Review)
Handles officer decisions: evidence view, manual override, clarifications, audit log.
OWNER: Person 1 (You)
"""
from fastapi import APIRouter
from models.schemas import OfficerDecision

router = APIRouter()


@router.post("/decision")
def submit_decision(decision: OfficerDecision):
    """
    Officer submits a final decision on a bid (APPROVE / REJECT / CLARIFY).
    All decisions are immutably logged.
    """
    # TODO (Sprint 5): Save to PostgreSQL audit_log table
    return {
        "decision_id": "placeholder",
        "audit_id": decision.audit_id,
        "action": decision.action,
        "justification": decision.justification,
        "status": "logged",
        "message": "Decision recorded in immutable audit log."
    }


@router.get("/log/{audit_id}")
def get_audit_log(audit_id: str):
    """Retrieve the full immutable audit trail for a bid."""
    # TODO (Sprint 5): Fetch from PostgreSQL
    return {"audit_id": audit_id, "log": []}
