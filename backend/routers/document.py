"""
Document Router — Layer 2 (FastAPI Backend)
Handles PDF upload, storage, SHA-256 fingerprinting.
OWNER: Person 1 (You)
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import DocumentUploadResponse
import hashlib, shutil, os, uuid

router = APIRouter()

UPLOAD_DIR = "uploaded_docs"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a bid PDF document.
    Returns a file_id and SHA-256 hash for integrity verification.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    file_id = str(uuid.uuid4())
    save_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

    # Save file to disk
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # SHA-256 fingerprint (anti-tampering)
    sha256 = hashlib.sha256()
    with open(save_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)

    return DocumentUploadResponse(
        file_id=file_id,
        filename=file.filename,
        sha256=sha256.hexdigest(),
        status="uploaded",
        message="Document received and fingerprinted successfully."
    )


@router.get("/list")
def list_documents():
    """List all uploaded documents."""
    files = os.listdir(UPLOAD_DIR) if os.path.exists(UPLOAD_DIR) else []
    return {"documents": files, "count": len(files)}
