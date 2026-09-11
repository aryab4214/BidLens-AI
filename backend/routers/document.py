"""
Document Router - Layer 2 (FastAPI Backend)
Handles multi-format document upload (PDF, Word, Excel, Scanned Images), storage,
SHA-256 fingerprinting, Tender RFP parsing, and pre-packaged 1-click sample document loading.
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
SAMPLE_DIRS = [
    os.path.join(PROJECT_ROOT, "data", "sample_bids"),
    os.path.join(BACKEND_DIR, "data", "sample_bids"),
    os.path.join(BACKEND_DIR, "..", "data", "sample_bids"),
]

def get_sample_dir():
    for d in SAMPLE_DIRS:
        if os.path.exists(d):
            return d
    return SAMPLE_DIRS[0]

SAMPLE_BIDS_DIR = get_sample_dir()
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {
    ".pdf", ".docx", ".doc", ".xlsx", ".xls", ".csv",
    ".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"
}


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a vendor bid document (PDF, Word .docx, Excel .xlsx, CSV, or Image).
    Returns file_id, SHA-256 digital fingerprint, and extracted metadata summary.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{ext}'. Allowed formats: PDF, Word (.docx, .doc), Excel (.xlsx, .xls), Images (.png, .jpg), CSV."
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
    sample_path = os.path.join(get_sample_dir(), "Tender_RFP_GeM_Computers.pdf")
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail="Sample tender RFP not found.")
    
    file_id = "sample_tender_gem_computers"
    save_path = os.path.join(UPLOAD_DIR, f"TENDER_{file_id}_Tender_RFP_GeM_Computers.pdf")
    shutil.copyfile(sample_path, save_path)
    
    tender_data = extract_tender_rfp_data(save_path)
    tender_data["sha256"] = hash_file(save_path)
    tender_data["tender_file_id"] = file_id
    
    return {
        "status": "SUCCESS",
        "message": "Sample Tender RFP (Computers & Workstations) loaded.",
        "tender_data": tender_data
    }


@router.get("/sample/vendor-bids")
def get_sample_vendor_bids():
    """
    Returns all pre-packaged sample vendor bid proposals ready for 1-click evaluation.
    """
    sample_dir = get_sample_dir()
    if not os.path.exists(sample_dir):
        raise HTTPException(status_code=404, detail="Sample bids directory not found.")

    sample_files = [
        "Bid_ApexLabs_MSME.pdf",
        "Bid_MegaTech_BigBrand.pdf",
        "Bid_GlobalCorp_Ineligible.pdf",
        "BoQ_PriceSchedule_MegaTech.xlsx",
        "Bid_ApexLabs_Proposal.docx",
        "Scanned_Letter_ApexLabs.png"
    ]

    loaded_bids = []
    for fname in sample_files:
        src_path = os.path.join(sample_dir, fname)
        if os.path.exists(src_path):
            file_id = f"sample_{fname.replace('.', '_').lower()}"
            dest_path = os.path.join(UPLOAD_DIR, f"{file_id}_{fname}")
            shutil.copyfile(src_path, dest_path)
            extracted = extract_document_data(dest_path)
            loaded_bids.append({
                "file_id": file_id,
                "filename": fname,
                "file_type": extracted["file_type"],
                "sha256": hash_file(dest_path),
                "status": "uploaded",
                "extracted_summary": extracted
            })

    return {
        "status": "SUCCESS",
        "count": len(loaded_bids),
        "vendor_bids": loaded_bids
    }


@router.post("/sample/load/{sample_name}")
def load_single_sample(sample_name: str):
    """
    Loads a specific sample file (e.g. Bid_ApexLabs_MSME.pdf, Bid_GlobalCorp_Rectified_ReEvaluation.pdf).
    """
    sample_dir = get_sample_dir()
    src_path = os.path.join(sample_dir, sample_name)
    if not os.path.exists(src_path):
        raise HTTPException(status_code=404, detail=f"Sample file '{sample_name}' not found.")

    file_id = f"sample_{sample_name.replace('.', '_').lower()}"
    dest_path = os.path.join(UPLOAD_DIR, f"{file_id}_{sample_name}")
    shutil.copyfile(src_path, dest_path)
    extracted = extract_document_data(dest_path)

    return {
        "file_id": file_id,
        "filename": sample_name,
        "file_type": extracted["file_type"],
        "sha256": hash_file(dest_path),
        "status": "uploaded",
        "message": f"Sample file '{sample_name}' loaded successfully.",
        "extracted_summary": extracted
    }


@router.get("/list")
def list_documents():
    """List all uploaded documents."""
    files = os.listdir(UPLOAD_DIR) if os.path.exists(UPLOAD_DIR) else []
    return {"documents": files, "count": len(files)}
