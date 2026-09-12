"""
BidLens AI - Automated Unit & Integration Tests
Verifies core system health, GFR 2017 deterministic rule checks, and statutory exemptions.
"""
import unittest
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from security.offline_mode import get_system_health_status
from orchestrator.rule_engine import evaluate_compliance


class TestBidLensCore(unittest.TestCase):

    def test_system_health_sovereign_mode(self):
        """Verify edge sovereignty health check reports 100% operational."""
        health = get_system_health_status()
        self.assertEqual(health["system_status"], "OPERATIONAL")
        self.assertIn("SOVEREIGN", health["mode"])
        self.assertEqual(health["data_consumption_kb"], 0.0)
        self.assertEqual(health["security_integrity"]["cert_in_compliance"], "PASS")

    def test_msme_turnover_waiver_exemption(self):
        """Verify GFR Rule 160 & MSME Order 2012 prior turnover waiver."""
        tender_rules = {
            "min_turnover_cr": 1.5,
            "emd_required_inr": 100000.0,
            "min_local_content_pct": 50,
            "min_warranty_years": 3,
        }
        # MSME bidder with turnover below 1.5 Cr should be EXEMPT, not FAIL
        msme_bid = {
            "vendor_name": "Apex Labs Micro Devices LLP",
            "is_msme": True,
            "udyam": "UDYAM-MH-03-0098765",
            "turnover_cr": 0.5,
            "emd_status": "MSME_EXEMPT",
            "local_content_pct": 65,
            "warranty": "5-Year Comprehensive Onsite Warranty",
            "total_quote_inr": 4200000.0,
            "gstin": "27AABCT3456L1ZV",
            "gstin_expired": False
        }
        results = evaluate_compliance(msme_bid, tender_rules)
        clauses = {r["clause_id"]: r["status"] for r in results}
        
        self.assertEqual(clauses.get("GFR-160-MSME"), "EXEMPT")
        self.assertEqual(clauses.get("GFR-170-EMD"), "EXEMPT")
        self.assertEqual(clauses.get("MII-2017-LC"), "PASS")

    def test_disqualification_on_expired_gstin(self):
        """Verify GFR Rule 149 triggers FAIL on expired/cancelled tax credentials."""
        tender_rules = {
            "min_turnover_cr": 1.5,
            "emd_required_inr": 100000.0,
            "min_local_content_pct": 50,
            "min_warranty_years": 3,
        }
        ineligible_bid = {
            "vendor_name": "NonCompliant Corp",
            "is_msme": False,
            "udyam": None,
            "turnover_cr": 2.0,
            "emd_status": "SUBMITTED",
            "local_content_pct": 60,
            "warranty": "3-Year",
            "total_quote_inr": 4900000.0,
            "gstin": "06AAACG1122J1Z8",
            "gstin_expired": True
        }
        results = evaluate_compliance(ineligible_bid, tender_rules)
        clauses = {r["clause_id"]: r["status"] for r in results}
        self.assertEqual(clauses.get("GFR-149-GST"), "FAIL")


if __name__ == '__main__':
    unittest.main()
