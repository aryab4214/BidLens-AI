"""
Audit Orchestrator - Layer 3 & Layer 4 Integration
Coordinates:
  1. Branch A: Document & Entity Extraction (PDF, Word, Excel)
  2. Branch B: Compliance Rule Engine (GFR 2017 & MSME Rules)
  3. Branch C: Government Verification (GSTN, PAN, MCA)
  4. Layer 4: Clause-to-Evidence Knowledge Graph
  5. Layer 4: Cross-Document Contradiction Detector
  6. Layer 4: Explainable Rejection-Risk Scorer & Value-for-Money Spotlight
"""
import asyncio
import os
from orchestrator.ai_processing import extract_document_data
from orchestrator.rule_engine import evaluate_compliance
from orchestrator.govt_verify import verify_government_credentials
from evidence_risk.graph_engine import build_compliance_knowledge_graph
from evidence_risk.contradiction import detect_cross_document_contradictions
from evidence_risk.risk_scorer import compute_risk_and_value_intelligence


async def run_full_audit(file_path: str, tender_requirements: dict = None) -> dict:
    """
    Executes the complete end-to-end intelligence audit pipeline.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    # ── 1. Branch A: Document Extraction ───────────────────────
    extracted = await asyncio.to_thread(extract_document_data, file_path)

    # ── 2. Branches B & C: Rule Engine & Govt Checks (Parallel)
    rule_task = asyncio.to_thread(evaluate_compliance, extracted, tender_requirements)
    govt_task = asyncio.to_thread(verify_government_credentials, extracted)

    clause_results, govt_verification = await asyncio.gather(rule_task, govt_task)

    # ── 3. Layer 4: Contradiction Detection ───────────────────
    contradictions = detect_cross_document_contradictions(extracted, govt_verification)

    # ── 4. Layer 4: Risk Scoring & MSME Value Spotlight ───────
    risk_and_value = compute_risk_and_value_intelligence(extracted, clause_results, contradictions)

    # ── 5. Layer 4: Clause-to-Evidence Knowledge Graph ────────
    knowledge_graph = build_compliance_knowledge_graph(extracted, clause_results, govt_verification)

    # ── Summary Metrics ───────────────────────────────────────
    pass_count = sum(1 for c in clause_results if c["status"] == "PASS")
    fail_count = sum(1 for c in clause_results if c["status"] == "FAIL")
    exempt_count = sum(1 for c in clause_results if c["status"] == "EXEMPT")
    is_compliant = not risk_and_value["rejection_risk"]["rejection_likely"]

    return {
        "file_info": {
            "filename": extracted["filename"],
            "file_type": extracted["file_type"],
            "vendor_name": extracted["vendor_name"],
            "page_count": extracted["page_count"],
        },
        "is_compliant": is_compliant,
        "executive_summary": risk_and_value["executive_summary"],
        "compliance_summary": {
            "total_clauses_checked": len(clause_results),
            "passed": pass_count,
            "failed": fail_count,
            "exempt": exempt_count,
            "overall_status": "COMPLIANT" if is_compliant else "NON_COMPLIANT",
            "risk_tier": risk_and_value["rejection_risk"]["risk_tier"]
        },
        "branch_a_extracted_data": extracted,
        "branch_b_clause_results": clause_results,
        "branch_c_govt_verification": govt_verification,
        "rejection_risk_analysis": risk_and_value["rejection_risk"],
        "value_spotlight": risk_and_value["value_spotlight"],
        "contradictions_detected": contradictions,
        "bid_repair_guidance": risk_and_value["bid_repair"],
        "clause_level_decisions": clause_results,
        "government_verification": govt_verification,
        "knowledge_graph": knowledge_graph
    }
