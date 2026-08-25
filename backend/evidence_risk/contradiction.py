"""
Cross-Document Contradiction Detector — Layer 4 (Evidence + Risk)
Detects inconsistencies across: GSTIN, PAN, company name, turnover figures,
OEM MAF, financial statements, self-declarations.
OWNER: Person 2 (Teammate)
"""


def detect_contradictions(documents: list[dict]) -> list[dict]:
    """
    Compare extracted entities across all bid attachments.
    Returns list of detected contradictions.
    Each document dict should have keys like:
    {filename, gstin, pan, company_name, turnover, signatory, ...}
    """
    contradictions = []

    # TODO (Sprint 4): Compare each field across all documents
    # Example checks:
    # - company_name in GSTIN cert != company_name in OEM MAF → CONTRADICTION
    # - turnover in cover letter != turnover in financial statement → CONTRADICTION
    # - PAN in declaration != PAN in GSTIN cert → CONTRADICTION

    # Skeleton example:
    if len(documents) >= 2:
        for i in range(len(documents)):
            for j in range(i + 1, len(documents)):
                doc_a = documents[i]
                doc_b = documents[j]
                # Compare company names
                if doc_a.get("company_name") and doc_b.get("company_name"):
                    if doc_a["company_name"].lower() != doc_b["company_name"].lower():
                        contradictions.append({
                            "type": "COMPANY_NAME_MISMATCH",
                            "doc_a": doc_a["filename"],
                            "doc_b": doc_b["filename"],
                            "value_a": doc_a["company_name"],
                            "value_b": doc_b["company_name"],
                            "severity": "HIGH"
                        })

    return contradictions
