"""
Document Router - Layer 2 (FastAPI Backend)
Handles multi-format document upload (PDF, Word, Excel), storage,
SHA-256 fingerprinting, Tender RFP parsing, and automatic intelligence extraction.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from orchestrator.ai_processing import extract_document_data, extract_tender_rfp_data
from security.sha256_audit import hash_file
import shutil, os, uuid

router = APIRouter()

ROUTER_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(ROUTER_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

UPLOAD_DIR = os.path.join(BACKEND_DIR, "uploaded_docs")
SAMPLE_BIDS_DIR = os.path.join(PROJECT_ROOT, "data", "sample_bids")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".xlsx", ".xls", ".csv"}


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a vendor bid document (PDF, Word .docx, Excel .xlsx, CSV).
    Returns file_id, SHA-256 digital fingerprint, and extracted metadata summary.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{ext}'. Allowed formats: PDF, Word (.docx, .doc), Excel (.xlsx, .xls), CSV."
        )

    file_id = str(uuid.uuid4())
    save_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    sha256_hash = hash_file(save_path)
    extracted = extract_document_data(save_path)

    return {
        "file_id": file_id,
        "filename": file.filename,
        "file_type": extracted["file_type"],
        "sha256": sha256_hash,
        "status": "uploaded",
        "message": f"Document ({extracted['file_type']}) received and parsed successfully.",
        "extracted_summary": extracted
    }


@router.post("/tender/upload")
async def upload_tender_rfp(file: UploadFile = File(...)):
    """
    Upload a Tender RFP Document to extract procurement terms, budget, EMD, turnover, and Make in India thresholds.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported format '{ext}'.")

    file_id = str(uuid.uuid4())
    save_path = os.path.join(UPLOAD_DIR, f"TENDER_{file_id}_{file.filename}")

    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    sha256_hash = hash_file(save_path)
    tender_data = extract_tender_rfp_data(save_path)
    tender_data["sha256"] = sha256_hash
    tender_data["tender_file_id"] = file_id

    return {
        "status": "SUCCESS",
        "message": "Tender RFP Document uploaded and conditions parsed.",
        "tender_data": tender_data
    }


@router.get("/tender/sample")
def get_sample_tender_rfp():
    """Returns parsed conditions from the pre-packaged sample tender RFP."""
    sample_path = os.path.join(SAMPLE_BIDS_DIR, "Tender_RFP_GeM_Computers.pdf")
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail="Sample tender RFP not found.")
    
    tender_data = extract_tender_rfp_data(sample_path)
    return {
        "status": "SUCCESS",
        "tender_data": tender_data
    }


@router.get("/list")
def list_documents():
    """List all uploaded documents."""
    files = os.listdir(UPLOAD_DIR) if os.path.exists(UPLOAD_DIR) else []
    return {"documents": files, "count": len(files)}
