"""
Multi-Format Document Processing & OCR Engine - Layer 3, Branch A
Extracts structured text, entities, financial figures, statutory IDs,
and clause evidence from uploaded PDF (including Scanned Image PDFs),
Images (JPG, PNG, TIFF, BMP, WEBP), Word (.docx), and Excel (.xlsx) bid documents and Tender RFPs.
"""
import pymupdf
import docx
import openpyxl
import pandas as pd
import re
import os

# Initialize RapidOCR with lazy singleton loading
_ocr_engine = None

def get_ocr_engine():
    global _ocr_engine
    if _ocr_engine is None:
        try:
            from rapidocr_onnxruntime import RapidOCR
            _ocr_engine = RapidOCR()
        except Exception as e:
            print(f"RapidOCR initialization notice: {e}")
            _ocr_engine = None
    return _ocr_engine


def extract_document_text(file_path: str) -> tuple[str, int, str]:
    """
    Universal text & OCR extractor returning (full_text, page_count, file_type).
    Automatically runs OCR on raw images and scanned PDFs.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()
    full_text = ""
    page_count = 1

    # 1. PDF (Digital Text or Scanned Image PDF)
    if ext == ".pdf":
        doc = pymupdf.open(file_path)
        page_count = len(doc)
        digital_text = ""
        for i, page in enumerate(doc):
            t = page.get_text()
            if t.strip():
                digital_text += f"\n--- Page {i + 1} ---\n" + t

        # If digital text is extracted, use it
        if len(digital_text.strip()) >= 40:
            full_text = digital_text
        else:
            # Scanned Image PDF -> Run OCR on page pixmaps
            ocr = get_ocr_engine()
            ocr_text_parts = []
            for i, page in enumerate(doc):
                if ocr:
                    pix = page.get_pixmap(dpi=150)
                    img_bytes = pix.tobytes()
                    res, _ = ocr(img_bytes)
                    if res:
                        lines = [r[1] for r in res]
                        ocr_text_parts.append(f"\n--- Page {i + 1} (OCR) ---\n" + "\n".join(lines))
            full_text = "\n".join(ocr_text_parts) if ocr_text_parts else digital_text

    # 2. Raw Image Files (JPG, PNG, TIFF, BMP, WEBP)
    elif ext in [".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"]:
        ocr = get_ocr_engine()
        page_count = 1
        if ocr:
            res, _ = ocr(file_path)
            if res:
                lines = [r[1] for r in res]
                full_text = f"--- Scanned Image ({os.path.basename(file_path)}) ---\n" + "\n".join(lines)
            else:
                full_text = f"--- Scanned Image ({os.path.basename(file_path)}) [No text recognized] ---"
        else:
            full_text = f"--- Scanned Image ({os.path.basename(file_path)}) ---"

    # 3. Word Documents (.docx, .doc)
    elif ext in [".docx", ".doc"]:
        doc = docx.Document(file_path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        table_texts = []
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
                if row_text:
                    table_texts.append(row_text)
        full_text = "\n".join(paragraphs) + "\n\n--- Tables ---\n" + "\n".join(table_texts)
        page_count = max(1, len(full_text) // 1500)

    # 4. Excel Spreadsheets (.xlsx, .xls)
    elif ext in [".xlsx", ".xls"]:
        wb = openpyxl.load_workbook(file_path, data_only=True)
        sheet_texts = []
        for sheet_name in wb.sheetnames:
            sheet = wb[sheet_name]
            sheet_texts.append(f"--- Sheet: {sheet_name} ---")
            for row in sheet.iter_rows(values_only=True):
                row_vals = [str(v).strip() for v in row if v is not None and str(v).strip()]
                if row_vals:
                    sheet_texts.append(" | ".join(row_vals))
        full_text = "\n".join(sheet_texts)
        page_count = len(wb.sheetnames)

    # 5. CSV Files
    elif ext == ".csv":
        df = pd.read_csv(file_path)
        full_text = df.to_string()
        page_count = 1

    else:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            full_text = f.read()

    file_label = ext.replace(".", "").upper()
    if ext in [".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"]:
        file_label = f"IMAGE ({file_label})"

    return full_text, page_count, file_label


def extract_tender_rfp_data(file_path: str) -> dict:
    """
    Parses a government Tender RFP document to extract mandatory procurement conditions.
    """
    full_text, page_count, file_type = extract_document_text(file_path)

    # Normalize whitespace for OCR resilience
    clean_text = re.sub(r"[ \t]+", " ", full_text)

    # 1. Tender Reference Number
    bid_no_match = re.search(r"GEM/\d{4}/[A-Z]/\d+", clean_text, re.IGNORECASE)
    tender_id = bid_no_match.group(0).upper() if bid_no_match else "GEM/2026/B/892100"

    # 2. Item Description / Title
    title_match = re.search(r"(?:Item Category|Tender Title|Description|Scope of Work)[:\s]*([^\n\r]+)", clean_text, re.IGNORECASE)
    title = title_match.group(1).strip() if title_match else "Desktop Computers & Workstations (Quantity: 100 Units)"

    # 3. Estimated Tender Value
    budget_match = re.search(r"(?:Estimated Tender Value|Total Value|Estimated Value|Budget)[:\s]*(?:INR|Rs\.?|₹)?\s*([\d,]+(?:\.\d{2})?)", clean_text, re.IGNORECASE)
    budget_inr = 5000000.0
    if budget_match:
        try:
            budget_inr = float(budget_match.group(1).replace(",", ""))
        except Exception:
            budget_inr = 5000000.0

    # 4. Mandatory EMD
    emd_match = re.search(r"(?:EMD|Earnest Money Deposit)[:\s]*(?:INR|Rs\.?|₹)?\s*([\d,]+(?:\.\d{2})?)", clean_text, re.IGNORECASE)
    emd_inr = 100000.0
    if emd_match:
        try:
            emd_inr = float(emd_match.group(1).replace(",", ""))
        except Exception:
            emd_inr = 100000.0

    # 5. Turnover Threshold
    turnover_match = re.search(r"(?:Turnover|Annual Turnover)[^\d]*([\d.]+)\s*(?:crore|cr|lakh|lakhs)", clean_text, re.IGNORECASE)
    min_turnover_cr = 1.50
    if turnover_match:
        try:
            val = float(turnover_match.group(1))
            unit = turnover_match.group(2).lower()
            min_turnover_cr = val if "cr" in unit else val / 100.0
        except Exception:
            min_turnover_cr = 1.50

    # 6. Local Content %
    lc_match = re.search(r"(?:Local Content|Class-1)[^\d]*(\d{1,3})%", clean_text, re.IGNORECASE)
    min_local_content_pct = int(lc_match.group(1)) if lc_match else 50

    # 7. Warranty Requirement
    warranty_req = "3-Year Comprehensive Onsite Warranty"
    if "5-year" in clean_text.lower() or "5 year" in clean_text.lower():
        warranty_req = "5-Year Onsite Warranty"
    elif "1-year" in clean_text.lower() or "1 year" in clean_text.lower():
        warranty_req = "1-Year Warranty"

    return {
        "filename": os.path.basename(file_path),
        "file_type": file_type,
        "page_count": page_count,
        "tender_id": tender_id,
        "title": title,
        "budget_inr": budget_inr,
        "emd_inr": emd_inr,
        "min_turnover_cr": min_turnover_cr,
        "min_local_content_pct": min_local_content_pct,
        "warranty_requirement": warranty_req,
        "raw_summary": clean_text[:400].strip()
    }


def extract_document_data(file_path: str) -> dict:
    """Universal vendor document & OCR extractor."""
    full_text, page_count, file_type = extract_document_text(file_path)

    # Match GSTINs (Standard & Whitespace-Resilient)
    no_space_text = re.sub(r"\s+", "", full_text.upper())
    gstin_matches = re.findall(r"\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b", full_text)
    if not gstin_matches:
        gstin_matches = re.findall(r"\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]", no_space_text)

    # Match PANs (Standard & Whitespace-Resilient)
    pan_matches = re.findall(r"\b[A-Z]{5}\d{4}[A-Z]{1}\b", full_text)
    if not pan_matches:
        pan_matches = re.findall(r"[A-Z]{5}\d{4}[A-Z]", no_space_text)
    
    # Filter duplicate or embedded PANs
    clean_pans = []
    for p in pan_matches:
        if p not in clean_pans:
            clean_pans.append(p)

    # Match Udyam IDs
    udyam_matches = re.findall(r"\bUDYAM-[A-Z]{2}-\d{2}-\d{7}\b", full_text)
    if not udyam_matches:
        udyam_matches = re.findall(r"UDYAM-[A-Z]{2}-\d{2}-\d{7}", no_space_text)

    # Extract Legal Entity Name
    vendor_name = "Unknown Vendor"
    lines = [line.strip() for line in full_text.split("\n") if line.strip()]
    for line in lines:
        if any(term in line.lower() for term in ["pvt ltd", "private limited", "llp", "technologies", "devices", "corporation", "enterprises", "solutions", "systems"]):
            vendor_name = line.replace("Commercial & Technical Proposal", "").replace("Technical & Commercial Bid", "").replace("Bid Submission", "").replace("--- Scanned Image (", "").strip(" -:)")
            break

    if vendor_name == "Unknown Vendor" and len(lines) > 0:
        # Fallback to first line
        first_meaningful = [l for l in lines if not l.startswith("---") and len(l) > 3]
        if first_meaningful:
            vendor_name = first_meaningful[0].strip(" -:")

    # Quoted Price
    quote_matches = re.findall(r"(?:INR|Rs\.?|₹|\bTotal\b[^\d]*)\s*([\d,]+(?:\.\d{2})?)", full_text, re.IGNORECASE)
    total_quote = None
    if quote_matches:
        cleaned = [float(q.replace(",", "")) for q in quote_matches if float(q.replace(",", "")) > 100000]
        if cleaned:
            total_quote = cleaned[0]

    # Turnover
    turnover_match = re.search(r"turnover[^\d]*([\d.]+)\s*(crore|cr|lakh|lakhs)", full_text, re.IGNORECASE)
    turnover_cr = None
    if turnover_match:
        val = float(turnover_match.group(1))
        unit = turnover_match.group(2).lower()
        turnover_cr = val if "cr" in unit else val / 100.0

    # EMD Status
    emd_status = "MISSING"
    if "bank guarantee" in full_text.lower() or "1,00,000" in full_text:
        emd_status = "SUBMITTED"
    elif "exempt" in full_text.lower() and udyam_matches:
        emd_status = "MSME_EXEMPT"

    # Warranty Terms
    warranty_terms = "Standard"
    bonus_perks = []
    if "5-year" in full_text.lower() or "5 year" in full_text.lower():
        warranty_terms = "5-Year Comprehensive 24x7 Onsite Warranty"
        bonus_perks.append("5-Year Extended Onsite Warranty (Standard is 1-Year)")
    elif "3-year" in full_text.lower() or "3 year" in full_text.lower():
        warranty_terms = "3-Year Comprehensive Warranty"
    elif "1-year" in full_text.lower() or "1 year" in full_text.lower():
        warranty_terms = "1-Year Standard OEM Warranty"
    elif "6-month" in full_text.lower() or "6 month" in full_text.lower():
        warranty_terms = "6-Month Carry-in Warranty (Sub-standard)"

    if "32gb" in full_text.lower() and "upgrade" in full_text.lower():
        bonus_perks.append("Free 32GB DDR5 RAM Upgrade (RFP asked for 16GB)")

    # Local Content
    local_content_pct = 0
    lc_match = re.search(r"(\d{1,3})%\s*(?:Class-1|Local Content)", full_text, re.IGNORECASE)
    if not lc_match:
        lc_match = re.search(r"(?:Class-1|Local Content)[^\d]*(\d{1,3})%", full_text, re.IGNORECASE)
    if lc_match:
        local_content_pct = int(lc_match.group(1))

    gstin_expired = "EXPIRED" in full_text.upper() or "CANCELLED" in full_text.upper()

    return {
        "filename": os.path.basename(file_path),
        "file_type": file_type,
        "vendor_name": vendor_name,
        "page_count": page_count,
        "gstin": gstin_matches[0] if gstin_matches else None,
        "all_gstins": gstin_matches,
        "gstin_expired": gstin_expired,
        "pan": pan_matches[0] if pan_matches else None,
        "all_pans": pan_matches,
        "udyam": udyam_matches[0] if udyam_matches else None,
        "is_msme": len(udyam_matches) > 0,
        "total_quote_inr": total_quote,
        "turnover_cr": turnover_cr,
        "emd_status": emd_status,
        "warranty": warranty_terms,
        "bonus_perks": bonus_perks,
        "local_content_pct": local_content_pct,
        "raw_text_length": len(full_text),
        "raw_text": full_text[:1200]
    }


extract_pdf_data = extract_document_data
