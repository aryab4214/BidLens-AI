"""
Compliance Rule Engine - Layer 3, Branch B
DETERMINISTIC Python rules. No LLM involved.
Evaluates GFR 2017 statutory procurement rules, MSME 2012 Exemption Orders,
and Public Procurement (Make in India) Orders.
"""


def evaluate_compliance(extracted_data: dict, tender_requirements: dict = None) -> list:
    """
    Evaluates extracted bid data against GFR rules and tender requirements.
    Returns a structured list of clause-level decisions (PASS, FAIL, EXEMPT).
    """
    if tender_requirements is None:
        tender_requirements = {
            "min_turnover_cr": 1.50,
            "emd_required_inr": 100000.0,
            "min_local_content_pct": 50,
            "min_warranty_years": 3,
        }

    results = []

    # ── 1. GFR Rule 149 & GSTIN Validity ─────────────────────
    gstin = extracted_data.get("gstin")
    gstin_expired = extracted_data.get("gstin_expired", False)
    if not gstin:
        results.append({
            "clause_id": "GFR-149-GST",
            "clause_name": "GSTIN Registration & Validity",
            "status": "FAIL",
            "regulation_ref": "GFR 2017 Rule 149 / GeM General Terms",
            "evidence": "No valid GSTIN certificate found in submission.",
            "remedy": "Submit active GSTIN certificate with current filing status."
        })
    elif gstin_expired:
        results.append({
            "clause_id": "GFR-149-GST",
            "clause_name": "GSTIN Registration & Validity",
            "status": "FAIL",
            "regulation_ref": "GFR 2017 Rule 149 / Statutory Tax Compliance",
            "evidence": f"GSTIN {gstin} is flagged as EXPIRED or CANCELLED.",
            "remedy": "Provide active GSTIN reactivation certificate from GST portal."
        })
    else:
        results.append({
            "clause_id": "GFR-149-GST",
            "clause_name": "GSTIN Registration & Validity",
            "status": "PASS",
            "regulation_ref": "GFR 2017 Rule 149",
            "evidence": f"Active GSTIN {gstin} verified.",
            "remedy": None
        })

    # ── 2. GFR Rule 160 & MSME Order 2012 Turnover Exemption ─
    is_msme = extracted_data.get("is_msme", False)
    turnover_cr = extracted_data.get("turnover_cr")
    min_turnover = tender_requirements["min_turnover_cr"]

    if is_msme:
        udyam = extracted_data.get("udyam")
        results.append({
            "clause_id": "GFR-160-MSME",
            "clause_name": "Annual Financial Turnover Requirement",
            "status": "EXEMPT",
            "regulation_ref": "Public Procurement Policy for MSEs Order 2012 / GFR Rule 160",
            "evidence": f"Registered Micro/Small Enterprise ({udyam}). Statutory exemption granted from prior turnover criteria.",
            "remedy": None
        })
    elif turnover_cr is not None:
        if turnover_cr >= min_turnover:
            results.append({
                "clause_id": "GFR-160-TO",
                "clause_name": "Annual Financial Turnover Requirement",
                "status": "PASS",
                "regulation_ref": "GFR 2017 Rule 160 (Turnover Criteria)",
                "evidence": f"Average turnover of INR {turnover_cr:.2f} Cr meets minimum threshold of INR {min_turnover:.2f} Cr.",
                "remedy": None
            })
        else:
            results.append({
                "clause_id": "GFR-160-TO",
                "clause_name": "Annual Financial Turnover Requirement",
                "status": "FAIL",
                "regulation_ref": "GFR 2017 Rule 160",
                "evidence": f"Turnover of INR {turnover_cr:.2f} Cr is below mandatory threshold of INR {min_turnover:.2f} Cr (Non-MSME).",
                "remedy": "Provide audited financial statements meeting minimum turnover or valid Udyam certificate."
            })
    else:
        results.append({
            "clause_id": "GFR-160-TO",
            "clause_name": "Annual Financial Turnover Requirement",
            "status": "FAIL",
            "regulation_ref": "GFR 2017 Rule 160",
            "evidence": "No turnover documentation or MSME Udyam registration provided.",
            "remedy": "Upload last 3 years CA-audited balance sheets with UDIN."
        })

    # ── 3. GFR Rule 170 (Earnest Money Deposit - EMD) ─────────
    emd_status = extracted_data.get("emd_status")
    if emd_status == "MSME_EXEMPT" or is_msme:
        results.append({
            "clause_id": "GFR-170-EMD",
            "clause_name": "Earnest Money Deposit (EMD)",
            "status": "EXEMPT",
            "regulation_ref": "GFR 2017 Rule 170(i) / MSME Policy 2012",
            "evidence": "Exempted from EMD submission under Central Government MSME provisions.",
            "remedy": None
        })
    elif emd_status == "SUBMITTED":
        results.append({
            "clause_id": "GFR-170-EMD",
            "clause_name": "Earnest Money Deposit (EMD)",
            "status": "PASS",
            "regulation_ref": "GFR 2017 Rule 170",
            "evidence": "Valid EMD Bank Guarantee / FDR submitted as per tender terms.",
            "remedy": None
        })
    else:
        results.append({
            "clause_id": "GFR-170-EMD",
            "clause_name": "Earnest Money Deposit (EMD)",
            "status": "FAIL",
            "regulation_ref": "GFR 2017 Rule 170",
            "evidence": "EMD Bank Guarantee missing and vendor not eligible for MSME waiver.",
            "remedy": "Submit EMD Bank Guarantee for INR 1,00,000 or valid Udyam registration."
        })

    # ── 4. Public Procurement (Make in India) Local Content ───
    local_pct = extracted_data.get("local_content_pct", 0)
    min_local = tender_requirements["min_local_content_pct"]
    if local_pct >= min_local:
        results.append({
            "clause_id": "MII-2017-LC",
            "clause_name": "Make in India Local Content Preference",
            "status": "PASS",
            "regulation_ref": "Public Procurement (Make in India) Order 2017",
            "evidence": f"Local content of {local_pct}% qualifies as Class-1 Local Supplier (Threshold >= {min_local}%).",
            "remedy": None
        })
    else:
        results.append({
            "clause_id": "MII-2017-LC",
            "clause_name": "Make in India Local Content Preference",
            "status": "FAIL",
            "regulation_ref": "Public Procurement (Make in India) Order 2017",
            "evidence": f"Local content of {local_pct}% fails Class-1 Local Supplier requirement (Minimum {min_local}%).",
            "remedy": "Provide OEM certificate verifying >= 50% domestic value addition."
        })

    # ── 5. Warranty & Service Level Compliance ────────────────
    warranty = extracted_data.get("warranty", "")
    if "5-year" in warranty.lower():
        results.append({
            "clause_id": "SPEC-WARRANTY",
            "clause_name": "Comprehensive Onsite Warranty",
            "status": "PASS",
            "regulation_ref": "Tender Technical Specifications",
            "evidence": f"Offers {warranty} (Exceeds 3-year baseline preference).",
            "remedy": None
        })
    elif "3-year" in warranty.lower() or "1-year" in warranty.lower():
        results.append({
            "clause_id": "SPEC-WARRANTY",
            "clause_name": "Comprehensive Onsite Warranty",
            "status": "PASS",
            "regulation_ref": "Tender Technical Specifications",
            "evidence": f"Offers {warranty}.",
            "remedy": None
        })
    else:
        results.append({
            "clause_id": "SPEC-WARRANTY",
            "clause_name": "Comprehensive Onsite Warranty",
            "status": "FAIL",
            "regulation_ref": "Tender Technical Specifications",
            "evidence": f"Offers sub-standard warranty ({warranty}). Minimum 3-Year comprehensive warranty required.",
            "remedy": "Provide OEM commitment letter for 3-Year onsite warranty coverage."
        })

    return results
