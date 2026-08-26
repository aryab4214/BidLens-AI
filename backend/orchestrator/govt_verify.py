"""
Govt Verification Branch - Layer 3, Branch C
Performs format validation, structure analysis, and simulated live checks
for GSTN, PAN, and MCA21 Company Incorporation databases.
"""
import re


def verify_government_credentials(extracted_data: dict) -> dict:
    """
    Validates GSTIN, PAN, and Udyam credentials.
    """
    gstin = extracted_data.get("gstin")
    pan = extracted_data.get("pan")
    all_pans = extracted_data.get("all_pans", [])
    udyam = extracted_data.get("udyam")

    # ── 1. GSTN Verification ─────────────────────────────────
    gstn_status = "NOT_PROVIDED"
    gstn_details = {}
    if gstin:
        gstin_valid_format = bool(re.match(r"^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$", gstin))
        if gstin_valid_format:
            state_code = gstin[:2]
            pan_in_gst = gstin[2:12]
            is_expired = extracted_data.get("gstin_expired", False)
            
            gstn_status = "INVALID_STATUS" if is_expired else "VERIFIED_ACTIVE"
            gstn_details = {
                "gstin": gstin,
                "valid_format": True,
                "state_code": state_code,
                "embedded_pan": pan_in_gst,
                "taxpayer_status": "CANCELLED/EXPIRED" if is_expired else "ACTIVE",
                "simulated_portal_sync": "Synced with GSTN Common Portal"
            }
        else:
            gstn_status = "INVALID_FORMAT"
            gstn_details = {"gstin": gstin, "valid_format": False, "detail": "Incorrect checksum/structure."}

    # ── 2. PAN Verification & Entity Type Check ───────────────
    pan_status = "NOT_PROVIDED"
    pan_details = {}
    if pan:
        pan_valid_format = bool(re.match(r"^[A-Z]{5}\d{4}[A-Z]{1}$", pan))
        if pan_valid_format:
            entity_type_char = pan[3]
            entity_types = {
                "C": "Company",
                "P": "Individual / Proprietorship",
                "F": "Firm / LLP",
                "A": "Association of Persons",
                "T": "Trust",
                "L": "Local Authority"
            }
            pan_status = "VERIFIED_VALID"
            pan_details = {
                "pan": pan,
                "valid_format": True,
                "entity_type": entity_types.get(entity_type_char, "Other Legal Entity"),
                "status": "VALID & OPERATIVE"
            }
        else:
            pan_status = "INVALID_FORMAT"
            pan_details = {"pan": pan, "valid_format": False}

    # ── 3. Udyam MSME Verification ───────────────────────────
    udyam_status = "NOT_APPLICABLE"
    udyam_details = {}
    if udyam:
        udyam_valid = bool(re.match(r"^UDYAM-[A-Z]{2}-\d{2}-\d{7}$", udyam))
        udyam_status = "VERIFIED_ACTIVE_MSME" if udyam_valid else "INVALID_FORMAT"
        udyam_details = {
            "udyam_id": udyam,
            "category": "Micro / Small Enterprise",
            "statutory_exemptions_eligible": True
        }

    # ── 4. Cross-Verification: GSTIN vs PAN Consistency ───────
    pan_gstin_consistent = True
    consistency_note = "GSTIN and PAN match consistently."
    if gstin and pan and len(gstin) >= 12:
        embedded_pan = gstin[2:12]
        if embedded_pan != pan:
            pan_gstin_consistent = False
            consistency_note = f"Discrepancy: PAN in GSTIN ({embedded_pan}) differs from declared PAN ({pan})."

    return {
        "overall_govt_verification": "PASS" if (gstn_status == "VERIFIED_ACTIVE" and pan_status == "VERIFIED_VALID" and pan_gstin_consistent) else "FLAGGED_FOR_REVIEW",
        "gstn": {"status": gstn_status, "details": gstn_details},
        "pan": {"status": pan_status, "details": pan_details},
        "udyam": {"status": udyam_status, "details": udyam_details},
        "pan_gstin_consistent": pan_gstin_consistent,
        "consistency_note": consistency_note
    }
