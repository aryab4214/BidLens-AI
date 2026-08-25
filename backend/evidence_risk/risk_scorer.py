"""
Explainable Rejection-Risk Scorer — Layer 4 (Evidence + Risk)
Aggregates all clause results and contradictions into a final risk score.
Provides evidence-grounded reasons, NOT a black-box score.
OWNER: Person 2 (Teammate)
"""


def score(clause_results: list, contradictions: list) -> dict:
    """
    Calculate overall rejection risk from clause results and contradictions.
    Returns a human-readable risk report with specific reasons.
    """
    fail_count    = sum(1 for c in clause_results if c.get("status") == "FAIL")
    pending_count = sum(1 for c in clause_results if c.get("status") == "PENDING")
    high_contradictions = [c for c in contradictions if c.get("severity") == "HIGH"]

    # Calculate risk level
    if fail_count >= 3 or len(high_contradictions) >= 2:
        risk_level = "CRITICAL"
        risk_score = 0.9
    elif fail_count >= 1 or len(high_contradictions) >= 1:
        risk_level = "HIGH"
        risk_score = 0.7
    elif pending_count >= 2:
        risk_level = "MEDIUM"
        risk_score = 0.4
    else:
        risk_level = "LOW"
        risk_score = 0.1

    # Build evidence-grounded top risks list
    top_risks = []
    for clause in clause_results:
        if clause.get("status") == "FAIL":
            top_risks.append({
                "risk": f"FAIL on {clause.get('clause_name')}",
                "regulation": clause.get("regulation_ref"),
                "evidence_page": clause.get("evidence_page"),
                "reason": clause.get("reason", "Required evidence not found or invalid.")
            })
    for contradiction in high_contradictions:
        top_risks.append({
            "risk": f"Contradiction: {contradiction.get('type')}",
            "doc_a": contradiction.get("doc_a"),
            "doc_b": contradiction.get("doc_b"),
            "reason": f"Value mismatch between {contradiction.get('value_a')} and {contradiction.get('value_b')}"
        })

    return {
        "overall_risk": risk_level,
        "risk_score": risk_score,
        "rejection_likely": risk_score >= 0.7,
        "fail_clauses": fail_count,
        "contradictions_found": len(contradictions),
        "top_risks": top_risks,
    }
