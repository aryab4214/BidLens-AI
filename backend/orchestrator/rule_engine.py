"""
Compliance Rule Engine — Layer 3, Branch B
DETERMINISTIC Python rules. No LLM involved.
Checks: GFR 2017 rules, MSME exemptions, expiry dates, EMD, turnover.
OWNER: Person 2 (Teammate)
"""
from datetime import date


def check_all(extracted_data: dict) -> dict:
    """Run all compliance checks. Returns list of clause results."""
    results = []
    results.append(check_msme_exemption(extracted_data))
    results.append(check_expiry_date(extracted_data))
    results.append(check_emd_amount(extracted_data))
    results.append(check_turnover_threshold(extracted_data))
    return {"clause_results": results}


def check_msme_exemption(data: dict) -> dict:
    """
    GFR Rule: MSMEs registered under Udyam are exempt from prior
    turnover and experience criteria (MSME Policy Order 2012).
    """
    # TODO (Sprint 3): Extract Udyam registration from data
    # If Udyam cert found → mark turnover/experience as EXEMPT
    return {
        "clause_id": "MSME-001",
        "clause_name": "MSME Udyam Exemption",
        "status": "PENDING",
        "regulation_ref": "MSME Policy Order 2012",
        "note": "TODO: Implement in Sprint 3"
    }


def check_expiry_date(data: dict) -> dict:
    """
    GFR Rule: All certificates must be valid on tender submission date.
    Checks GSTIN, ISO, EMD validity dates.
    """
    # TODO (Sprint 3): Extract dates, compare to today
    # cert_expiry = data.get("gstin_expiry")
    # if cert_expiry < date.today(): return FAIL
    return {
        "clause_id": "GFR-149",
        "clause_name": "Certificate Validity Check",
        "status": "PENDING",
        "regulation_ref": "GFR 2017 Rule 149",
        "note": "TODO: Implement in Sprint 3"
    }


def check_emd_amount(data: dict) -> dict:
    """
    GFR Rule: EMD amount must be >= 2% of estimated tender value.
    """
    # TODO (Sprint 3): Extract EMD from bid, compare to required amount
    return {
        "clause_id": "GFR-170",
        "clause_name": "EMD Amount Verification",
        "status": "PENDING",
        "regulation_ref": "GFR 2017 Rule 170",
        "note": "TODO: Implement in Sprint 3"
    }


def check_turnover_threshold(data: dict) -> dict:
    """
    GFR Rule: Vendor annual turnover must meet minimum threshold
    specified in tender (unless MSME exempt).
    """
    # TODO (Sprint 3): Extract turnover figure from financial statements
    return {
        "clause_id": "GFR-160",
        "clause_name": "Turnover Threshold",
        "status": "PENDING",
        "regulation_ref": "GFR 2017 Rule 160",
        "note": "TODO: Implement in Sprint 3"
    }
