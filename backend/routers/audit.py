"""
Audit Router — Layer 2 (FastAPI Backend)
Triggers the full compliance audit pipeline via the Audit Orchestrator.
OWNER: Person 1 (You)
"""
from fastapi import APIRouter, BackgroundTasks
from models.schemas import AuditRequest, AuditResponse

router = APIRouter()


@router.post("/run", response_model=AuditResponse)
async def run_audit(request: AuditRequest, background_tasks: BackgroundTasks):
    """
    Trigger a full compliance audit for a submitted bid.
    Passes the job to the Audit Orchestrator (Layer 3).
    """
    # TODO (Sprint 2): Call orchestrator.run_audit(request)
    return AuditResponse(
        audit_id=request.file_id,
        status="queued",
        message="Audit job queued. Results will be available shortly.",
        results={}
    )


@router.get("/status/{audit_id}")
def get_audit_status(audit_id: str):
    """Check the status of a running audit."""
    # TODO (Sprint 2): Query job status from database
    return {"audit_id": audit_id, "status": "pending"}
