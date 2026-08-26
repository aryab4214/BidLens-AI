"""
Cross-Document Contradiction Engine - Layer 4
Detects inconsistencies, fraudulent discrepancies, and mismatches across
GSTIN certificates, PAN cards, OEM Manufacturer Authorization Forms (MAF),
financial statements, and cover letters.
"""


def detect_cross_document_contradictions(extracted_data: dict, govt_verification: dict) -> list:
    """
    Scans the extracted bid metadata and government verification logs
    to identify internal and cross-attachment contradictions.
    """
    contradictions = []
    filename = extracted_data.get("filename", "Bid Proposal")
    all_pans = extracted_data.get("all_pans", [])
    declared_pan = extracted_data.get("pan")
    gstin = extracted_data.get("gstin")
    gstin_expired = extracted_data.get("gstin_expired", False)

    # ── 1. Multiple Different PANs within same Bid Proposal ───
    unique_pans = list(set(all_pans))
    if len(unique_pans) > 1:
        contradictions.append({
            "contradiction_id": "CONTRA-PAN-01",
            "type": "CROSS_ATTACHMENT_PAN_MISMATCH",
            "severity": "CRITICAL",
            "title": "Conflicting PAN Numbers in Attachments",
            "description": f"Found multiple conflicting PAN numbers ({', '.join(unique_pans)}) between the Bid Cover Letter and the OEM Authorization / Annexure documents.",
            "impact": "High risk of fraudulent or unauthorized third-party proxy bidding.",
            "remedy": "Provide legal affidavit explaining entity relationship and submit unified PAN card."
        })

    # ── 2. PAN inside GSTIN vs Declared PAN Discrepancy ───────
    if not govt_verification.get("pan_gstin_consistent", True):
        note = govt_verification.get("consistency_note", "Discrepancy detected.")
        contradictions.append({
            "contradiction_id": "CONTRA-GST-PAN-02",
            "type": "GSTIN_EMBEDDED_PAN_MISMATCH",
            "severity": "CRITICAL",
            "title": "GSTIN Entity Mismatch with Declared PAN",
            "description": note,
            "impact": "The tax registration does not belong to the legal entity submitting the bid proposal.",
            "remedy": "Submit GSTIN registration certificate issued strictly in the name of the PAN holder."
        })

    # ── 3. Active Status Claim vs Expired / Cancelled GSTIN ────
    if gstin and gstin_expired:
        contradictions.append({
            "contradiction_id": "CONTRA-TAX-STATUS-03",
            "type": "TAX_STATUS_CONTRADICTION",
            "severity": "HIGH",
            "title": "GSTIN Status Inactive / Cancelled",
            "description": f"Bid claims active commercial operations, but GSTIN {gstin} is recorded as EXPIRED or CANCELLED in tax filings.",
            "impact": "Statutory non-compliance with GFR Rule 149 and GeM General Terms.",
            "remedy": "Obtain GSTIN reactivation order from GST portal."
        })

    # ── 4. MSME Status vs High Turnover Threshold Discrepancy ─
    is_msme = extracted_data.get("is_msme", False)
    turnover_cr = extracted_data.get("turnover_cr")
    if not is_msme and turnover_cr is not None and turnover_cr < 1.50:
        contradictions.append({
            "contradiction_id": "CONTRA-ELIGIBILITY-04",
            "type": "NON_MSME_BELOW_THRESHOLD",
            "severity": "HIGH",
            "title": "Ineligible Turnover without MSME Exemption",
            "description": f"Turnover of INR {turnover_cr:.2f} Cr is below the INR 1.50 Cr threshold, and no valid Udyam registration is provided to claim statutory exemption.",
            "impact": "Mandatory technical rejection under GFR Rule 160.",
            "remedy": "Register under MSME Udyam if eligible or submit audited balance sheets meeting minimum turnover."
        })

    return contradictions
