"""
Govt Verification Branch — Layer 3, Branch C
Checks: GSTN API (GST validity) + MCA21 API (company status)
OWNER: Person 2 (Teammate)
"""


def verify(extracted_data: dict) -> dict:
    """
    Live government database verification.
    Checks GSTIN validity and MCA company registration status.
    """
    results = {}
    results["gstn"] = verify_gstin(extracted_data.get("gstin", ""))
    results["mca"]  = verify_mca(extracted_data.get("cin", ""))
    return results


def verify_gstin(gstin: str) -> dict:
    """
    Call GSTN API to verify GST registration is active.
    API: https://api.gst.gov.in/commonapi/v1.1/taxpayerDetails/{gstin}
    """
    # TODO (Sprint 3): Make HTTP call to GSTN API
    # import httpx
    # response = httpx.get(f"https://api.gst.gov.in/...")
    if not gstin:
        return {"status": "MISSING", "detail": "No GSTIN found in document"}
    return {
        "gstin": gstin,
        "status": "PENDING",
        "active": None,
        "legal_name": None,
        "note": "TODO: Connect to GSTN API in Sprint 3"
    }


def verify_mca(cin: str) -> dict:
    """
    Check MCA21 for company incorporation status.
    API: MCA21 V3 REST API
    """
    # TODO (Sprint 3): Call MCA21 API
    if not cin:
        return {"status": "MISSING", "detail": "No CIN found in document"}
    return {
        "cin": cin,
        "status": "PENDING",
        "company_status": None,
        "note": "TODO: Connect to MCA21 API in Sprint 3"
    }
