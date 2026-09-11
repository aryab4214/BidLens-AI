"""
Explainable Rejection-Risk Scorer & Value-for-Money Spotlight - Layer 4
Calculates evidence-grounded rejection risk, highlights MSME value advantages,
and generates actionable Bid Repair guidance.
"""


def compute_risk_and_value_intelligence(extracted_data: dict, clause_results: list, contradictions: list) -> dict:
    """
    Computes an explainable rejection-risk profile, MSME value advantages,
    and corrective bid repair actions.
    """
    fail_clauses = [c for c in clause_results if c.get("status") == "FAIL"]
    exempt_clauses = [c for c in clause_results if c.get("status") == "EXEMPT"]
    pass_clauses = [c for c in clause_results if c.get("status") == "PASS"]
    critical_contradictions = [c for c in contradictions if c.get("severity") in ["CRITICAL", "HIGH"]]

    # ── 1. Rejection Risk Calculation ─────────────────────────
    if len(fail_clauses) >= 2 or len(critical_contradictions) >= 2:
        risk_tier = "CRITICAL"
        risk_score = 0.95
        rejection_likely = True
    elif len(fail_clauses) == 1 or len(critical_contradictions) == 1:
        risk_tier = "HIGH"
        risk_score = 0.70
        rejection_likely = True
    elif any(c.get("status") == "PENDING" for c in clause_results):
        risk_tier = "MEDIUM"
        risk_score = 0.40
        rejection_likely = False
    else:
        risk_tier = "LOW"
        risk_score = 0.05
        rejection_likely = False

    # ── 2. Explainable Rejection Grounds ──────────────────────
    risk_explanations = []
    for f in fail_clauses:
        risk_explanations.append({
            "category": "Regulatory Non-Compliance",
            "clause": f.get("clause_name"),
            "regulation": f.get("regulation_ref"),
            "reason": f.get("evidence"),
            "impact": "Grounds for mandatory technical disqualification."
        })

    for c in critical_contradictions:
        risk_explanations.append({
            "category": "Document Discrepancy",
            "clause": c.get("title"),
            "regulation": "GeM Fraud Prevention Guidelines",
            "reason": c.get("description"),
            "impact": c.get("impact")
        })

    # ── 3. Value-for-Money Advantage Spotlight ────────────────
    is_msme = extracted_data.get("is_msme", False)
    quote = extracted_data.get("total_quote_inr")
    bonus_perks = extracted_data.get("bonus_perks", [])
    warranty = extracted_data.get("warranty", "")
    
    value_spotlight_active = False
    spotlight_highlights = []
    savings_inr = None

    budget_inr = 5000000.0  # ₹50 Lakhs estimated budget
    if quote and quote < budget_inr:
        savings_inr = budget_inr - quote
        spotlight_highlights.append(f"Cost Savings: Quoted INR {quote:,.0f} (Saves INR {savings_inr:,.0f} / {savings_inr/budget_inr*100:.1f}% below tender budget).")

    if "5-year" in warranty.lower() or "5 year" in warranty.lower():
        spotlight_highlights.append("Extended Service: 5-Year Comprehensive Onsite Warranty (Standard market baseline is 1 Year).")

    for perk in bonus_perks:
        if perk not in spotlight_highlights:
            spotlight_highlights.append(f"Hardware Value-Add: {perk}")

    if is_msme:
        spotlight_highlights.append("Sovereign MSME Support: Complies with Public Procurement Policy Order 2012 MSE quota.")

    if not rejection_likely and (len(spotlight_highlights) >= 2 or (savings_inr and savings_inr > 0)):
        value_spotlight_active = True

    # ── 4. Bid Repair & Corrective Guidance ───────────────────
    bid_repair_actions = []
    for f in fail_clauses:
        if f.get("remedy"):
            bid_repair_actions.append({
                "issue": f.get("clause_name"),
                "action_required": f.get("remedy")
            })

    for c in contradictions:
        if c.get("remedy"):
            bid_repair_actions.append({
                "issue": c.get("title"),
                "action_required": c.get("remedy")
            })

    # ── 5. Executive Officer Recommendation ───────────────────
    if rejection_likely:
        executive_summary = f"REJECT / CLARIFY: High rejection risk detected ({len(fail_clauses)} failed statutory clauses and {len(critical_contradictions)} critical discrepancies). Recommend issuing clarification letter before final disqualification."
    elif value_spotlight_active:
        executive_summary = f"RECOMMENDED (VALUE-FOR-MONEY SPOTLIGHT): Fully compliant proposal with INR {savings_inr:,.0f} cost savings and superior warranty/hardware terms compared to standard bids."
    else:
        executive_summary = "COMPLIANT: Bid meets all mandatory GFR requirements and technical specifications."

    return {
        "rejection_risk": {
            "risk_tier": risk_tier,
            "risk_score": risk_score,
            "rejection_likely": rejection_likely,
            "total_flaws_found": len(fail_clauses) + len(critical_contradictions),
            "reasons": risk_explanations
        },
        "value_spotlight": {
            "is_spotlight_candidate": value_spotlight_active,
            "vendor_type": "Micro & Small Enterprise (MSME)" if is_msme else "Standard Enterprise",
            "quoted_price_inr": quote,
            "estimated_savings_inr": savings_inr,
            "value_highlights": spotlight_highlights
        },
        "bid_repair": {
            "repair_needed": len(bid_repair_actions) > 0,
            "recommended_actions": bid_repair_actions
        },
        "executive_summary": executive_summary
    }
