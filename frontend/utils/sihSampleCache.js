/**
 * BidLens AI - SIH 2026 High-Resilience Sovereign Demo Cache
 * Guarantees zero-failure, instant demonstration for PPT evaluators even on flaky Wi-Fi.
 */

export const SAMPLE_TENDER_DATA = {
  filename: "TENDER_sample_tender_gem_computers_Tender_RFP_GeM_Computers.pdf",
  file_type: "PDF",
  page_count: 12,
  tender_id: "GEM/2026/B/892100",
  title: "Supply, Installation, and Commissioning of Desktop Workstations (Quantity: 100 Units)",
  budget_inr: 5000000.0,
  emd_inr: 100000.0,
  min_turnover_cr: 1.5,
  min_local_content_pct: 50,
  warranty_requirement: "3-Year Comprehensive Onsite Warranty",
  raw_summary: "GOVERNMENT OF INDIA — GOVERNMENT E-MARKETPLACE (GeM)\nNOTICE INVITING TENDER (NIT) & BID DOCUMENT\nBid Reference Number: GEM/2026/B/892100 | Dated: 15-January-2026\nProcuring Entity: Ministry of Petroleum & Natural Gas / CPCL Directorate\nItem Description: Supply, Installation, and Commissioning of Desktop Workstations (Quantity: 100 Units)\nEstimated Tender Value: INR 50,00,000 | EMD: INR 1,00,000",
  sha256: "883177cf64912e30592f3c02996d732617d0190f7a6644c19b8ce6bb206a6590",
  tender_file_id: "sample_tender_gem_computers"
};

export const SAMPLE_VENDOR_LIST = [
  {
    file_id: "sample_bid_apexlabs_msme_pdf",
    filename: "Bid_ApexLabs_MSME.pdf",
    file_type: "PDF",
    vendor_name: "APEX LABS MICRO DEVICES LLP",
    quote_inr: 4200000.0,
    status: "Ready for Audit"
  },
  {
    file_id: "sample_bid_megatech_bigbrand_pdf",
    filename: "Bid_MegaTech_BigBrand.pdf",
    file_type: "PDF",
    vendor_name: "MegaTech Solutions International Private Limited",
    quote_inr: 4850000.0,
    status: "Ready for Audit"
  },
  {
    file_id: "sample_bid_globalcorp_ineligible_pdf",
    filename: "Bid_GlobalCorp_Ineligible.pdf",
    file_type: "PDF",
    vendor_name: "GlobalCorp Enterprises Limited",
    quote_inr: 5400000.0,
    status: "Ready for Audit"
  }
];

export const SAMPLE_AUDIT_RESULTS = [
  {
    file_id: "sample_bid_apexlabs_msme_pdf",
    is_compliant: true,
    compliance_score: 1.0,
    disqualification_reasons: [],
    file_info: {
      filename: "Bid_ApexLabs_MSME.pdf",
      file_type: "PDF",
      vendor_name: "APEX LABS MICRO DEVICES LLP",
      page_count: 12,
      gstin: "27AABCT3456L1ZV",
      all_gstins: ["27AABCT3456L1ZV"],
      gstin_expired: false,
      pan: "AABCT3456L",
      all_pans: ["AABCT3456L"],
      udyam: "UDYAM-MH-03-0098765",
      is_msme: true,
      total_quote_inr: 4200000.0,
      turnover_cr: 12.4,
      emd_status: "MSME_EXEMPT",
      warranty: "5-Year Comprehensive 24x7 Onsite Warranty",
      bonus_perks: ["5-Year Extended Onsite Warranty (Standard is 1-Year)", "Free 32GB DDR5 RAM Upgrade (RFP asked for 16GB)"],
      local_content_pct: 65
    },
    branch_b_clause_results: [
      { clause_id: "GFR-149-GST", clause_name: "GSTIN Registration & Validity", status: "PASS", regulation_ref: "GFR 2017 Rule 149", evidence: "Active GSTIN 27AABCT3456L1ZV verified.", remedy: null },
      { clause_id: "GFR-160-MSME", clause_name: "Annual Financial Turnover Requirement", status: "EXEMPT", regulation_ref: "Public Procurement Policy for MSEs Order 2012 / GFR Rule 160", evidence: "Registered Micro/Small Enterprise (UDYAM-MH-03-0098765). Statutory exemption granted from prior turnover criteria.", remedy: null },
      { clause_id: "GFR-170-EMD", clause_name: "Earnest Money Deposit (EMD)", status: "EXEMPT", regulation_ref: "GFR 2017 Rule 170(i) / MSME Policy 2012", evidence: "Exempted from EMD submission under Central Government MSME provisions.", remedy: null },
      { clause_id: "MII-2017-LC", clause_name: "Make in India Local Content Preference", status: "PASS", regulation_ref: "Public Procurement (Make in India) Order 2017", evidence: "Local content of 65% qualifies as Class-1 Local Supplier (Threshold >= 50%).", remedy: null },
      { clause_id: "SPEC-WARRANTY", clause_name: "Comprehensive Onsite Warranty", status: "PASS", regulation_ref: "Tender Technical Specifications", evidence: "Offers 5-Year Comprehensive 24x7 Onsite Warranty (Exceeds 3-year baseline preference).", remedy: null }
    ],
    clause_level_decisions: [
      { clause_id: "GFR-149-GST", clause_name: "GSTIN Registration & Validity", status: "PASS", regulation_ref: "GFR 2017 Rule 149", evidence: "Active GSTIN 27AABCT3456L1ZV verified.", remedy: null },
      { clause_id: "GFR-160-MSME", clause_name: "Annual Financial Turnover Requirement", status: "EXEMPT", regulation_ref: "Public Procurement Policy for MSEs Order 2012 / GFR Rule 160", evidence: "Registered Micro/Small Enterprise (UDYAM-MH-03-0098765). Statutory exemption granted from prior turnover criteria.", remedy: null },
      { clause_id: "GFR-170-EMD", clause_name: "Earnest Money Deposit (EMD)", status: "EXEMPT", regulation_ref: "GFR 2017 Rule 170(i) / MSME Policy 2012", evidence: "Exempted from EMD submission under Central Government MSME provisions.", remedy: null },
      { clause_id: "MII-2017-LC", clause_name: "Make in India Local Content Preference", status: "PASS", regulation_ref: "Public Procurement (Make in India) Order 2017", evidence: "Local content of 65% qualifies as Class-1 Local Supplier (Threshold >= 50%).", remedy: null },
      { clause_id: "SPEC-WARRANTY", clause_name: "Comprehensive Onsite Warranty", status: "PASS", regulation_ref: "Tender Technical Specifications", evidence: "Offers 5-Year Comprehensive 24x7 Onsite Warranty (Exceeds 3-year baseline preference).", remedy: null }
    ],
    branch_c_govt_verification: {
      overall_govt_verification: "PASS",
      verified_gateways_count: 6,
      total_gateways: 6,
      pan_gstin_consistent: true,
      gateways: [
        { name: "GSTN Common Portal", status: "ACTIVE & FILED (VERIFIED)", badge: "PASS" },
        { name: "ITD PAN Registry", status: "VALID & OPERATIVE (ITD SYNC)", badge: "PASS" },
        { name: "MCA21 Corporate Affairs", status: "ACTIVE ENTITY (MCA21)", badge: "PASS" },
        { name: "Udyam MSME Portal", status: "VERIFIED ACTIVE MSME", badge: "PASS" },
        { name: "EPFO & ESIC Labour Compliance", status: "COMPLIANT (EPFO/ESIC)", badge: "PASS" },
        { name: "CPPP Central Debarment Watchlist", status: "CLEAN / NOT BLACKLISTED", badge: "PASS" }
      ]
    },
    government_verification: {
      overall_govt_verification: "PASS",
      verified_gateways_count: 6,
      total_gateways: 6,
      pan_gstin_consistent: true,
      gateways: [
        { name: "GSTN Common Portal", status: "ACTIVE & FILED (VERIFIED)", badge: "PASS" },
        { name: "ITD PAN Registry", status: "VALID & OPERATIVE (ITD SYNC)", badge: "PASS" },
        { name: "MCA21 Corporate Affairs", status: "ACTIVE ENTITY (MCA21)", badge: "PASS" },
        { name: "Udyam MSME Portal", status: "VERIFIED ACTIVE MSME", badge: "PASS" },
        { name: "EPFO & ESIC Labour Compliance", status: "COMPLIANT (EPFO/ESIC)", badge: "PASS" },
        { name: "CPPP Central Debarment Watchlist", status: "CLEAN / NOT BLACKLISTED", badge: "PASS" }
      ]
    },
    rejection_risk_analysis: { risk_tier: "LOW", risk_score: 0.05, rejection_likely: false, reasons: [] },
    value_spotlight: {
      is_spotlight_candidate: true,
      vendor_type: "Micro & Small Enterprise (MSME)",
      quoted_price_inr: 4200000.0,
      estimated_savings_inr: 800000.0,
      value_highlights: [
        "Cost Savings: Quoted INR 4,200,000 (Saves INR 800,000 / 16.0% below tender budget).",
        "Extended Service: 5-Year Comprehensive Onsite Warranty (Standard market baseline is 1 Year).",
        "Hardware Value-Add: Free 32GB DDR5 RAM Upgrade (RFP asked for 16GB).",
        "Sovereign MSME Support: Complies with Public Procurement Policy Order 2012 MSE quota."
      ]
    },
    contradictions_detected: [],
    claim_integrity: { integrity_score: 100, integrity_tier: "HIGH INTEGRITY" }
  },
  {
    file_id: "sample_bid_megatech_bigbrand_pdf",
    is_compliant: true,
    compliance_score: 1.0,
    disqualification_reasons: [],
    file_info: {
      filename: "Bid_MegaTech_BigBrand.pdf",
      file_type: "PDF",
      vendor_name: "MegaTech Solutions International Private Limited",
      page_count: 12,
      gstin: "07AAACM9988K1Z5",
      all_gstins: ["07AAACM9988K1Z5"],
      gstin_expired: false,
      pan: "AAACM9988K",
      all_pans: ["AAACM9988K"],
      udyam: null,
      is_msme: false,
      total_quote_inr: 4850000.0,
      turnover_cr: 45.8,
      emd_status: "SUBMITTED",
      warranty: "3-Year Comprehensive Warranty",
      bonus_perks: [],
      local_content_pct: 58
    },
    branch_b_clause_results: [
      { clause_id: "GFR-149-GST", clause_name: "GSTIN Registration & Validity", status: "PASS", regulation_ref: "GFR 2017 Rule 149", evidence: "Active GSTIN 07AAACM9988K1Z5 verified.", remedy: null },
      { clause_id: "GFR-160-TO", clause_name: "Annual Financial Turnover Requirement", status: "PASS", regulation_ref: "GFR 2017 Rule 160 (Turnover Criteria)", evidence: "Average turnover of INR 45.80 Cr meets minimum threshold of INR 1.50 Cr.", remedy: null },
      { clause_id: "GFR-170-EMD", clause_name: "Earnest Money Deposit (EMD)", status: "PASS", regulation_ref: "GFR 2017 Rule 170", evidence: "Valid EMD Bank Guarantee / FDR submitted as per tender terms.", remedy: null },
      { clause_id: "MII-2017-LC", clause_name: "Make in India Local Content Preference", status: "PASS", regulation_ref: "Public Procurement (Make in India) Order 2017", evidence: "Local content of 58% qualifies as Class-1 Local Supplier (Threshold >= 50%).", remedy: null },
      { clause_id: "SPEC-WARRANTY", clause_name: "Comprehensive Onsite Warranty", status: "PASS", regulation_ref: "Tender Technical Specifications", evidence: "Offers 3-Year Comprehensive Warranty.", remedy: null }
    ],
    clause_level_decisions: [
      { clause_id: "GFR-149-GST", clause_name: "GSTIN Registration & Validity", status: "PASS", regulation_ref: "GFR 2017 Rule 149", evidence: "Active GSTIN 07AAACM9988K1Z5 verified.", remedy: null },
      { clause_id: "GFR-160-TO", clause_name: "Annual Financial Turnover Requirement", status: "PASS", regulation_ref: "GFR 2017 Rule 160 (Turnover Criteria)", evidence: "Average turnover of INR 45.80 Cr meets minimum threshold of INR 1.50 Cr.", remedy: null },
      { clause_id: "GFR-170-EMD", clause_name: "Earnest Money Deposit (EMD)", status: "PASS", regulation_ref: "GFR 2017 Rule 170", evidence: "Valid EMD Bank Guarantee / FDR submitted as per tender terms.", remedy: null },
      { clause_id: "MII-2017-LC", clause_name: "Make in India Local Content Preference", status: "PASS", regulation_ref: "Public Procurement (Make in India) Order 2017", evidence: "Local content of 58% qualifies as Class-1 Local Supplier (Threshold >= 50%).", remedy: null },
      { clause_id: "SPEC-WARRANTY", clause_name: "Comprehensive Onsite Warranty", status: "PASS", regulation_ref: "Tender Technical Specifications", evidence: "Offers 3-Year Comprehensive Warranty.", remedy: null }
    ],
    branch_c_govt_verification: {
      overall_govt_verification: "PASS",
      verified_gateways_count: 5,
      total_gateways: 5,
      pan_gstin_consistent: true,
      gateways: [
        { name: "GSTN Common Portal", status: "ACTIVE & FILED (VERIFIED)", badge: "PASS" },
        { name: "ITD PAN Registry", status: "VALID & OPERATIVE (ITD SYNC)", badge: "PASS" },
        { name: "MCA21 Corporate Affairs", status: "ACTIVE ENTITY (MCA21)", badge: "PASS" },
        { name: "Udyam MSME Portal", status: "NOT_APPLICABLE", badge: "NEUTRAL" },
        { name: "EPFO & ESIC Labour Compliance", status: "COMPLIANT (EPFO/ESIC)", badge: "PASS" },
        { name: "CPPP Central Debarment Watchlist", status: "CLEAN / NOT BLACKLISTED", badge: "PASS" }
      ]
    },
    government_verification: {
      overall_govt_verification: "PASS",
      verified_gateways_count: 5,
      total_gateways: 5,
      pan_gstin_consistent: true,
      gateways: [
        { name: "GSTN Common Portal", status: "ACTIVE & FILED (VERIFIED)", badge: "PASS" },
        { name: "ITD PAN Registry", status: "VALID & OPERATIVE (ITD SYNC)", badge: "PASS" },
        { name: "MCA21 Corporate Affairs", status: "ACTIVE ENTITY (MCA21)", badge: "PASS" },
        { name: "Udyam MSME Portal", status: "NOT_APPLICABLE", badge: "NEUTRAL" },
        { name: "EPFO & ESIC Labour Compliance", status: "COMPLIANT (EPFO/ESIC)", badge: "PASS" },
        { name: "CPPP Central Debarment Watchlist", status: "CLEAN / NOT BLACKLISTED", badge: "PASS" }
      ]
    },
    rejection_risk_analysis: { risk_tier: "LOW", risk_score: 0.05, rejection_likely: false, reasons: [] },
    value_spotlight: {
      is_spotlight_candidate: true,
      vendor_type: "Standard Enterprise",
      quoted_price_inr: 4850000.0,
      estimated_savings_inr: 150000.0,
      value_highlights: ["Cost Savings: Quoted INR 4,850,000 (Saves INR 150,000 / 3.0% below tender budget)."]
    },
    contradictions_detected: [],
    claim_integrity: { integrity_score: 100, integrity_tier: "HIGH INTEGRITY" }
  },
  {
    file_id: "sample_bid_globalcorp_ineligible_pdf",
    is_compliant: false,
    compliance_score: 0.4,
    disqualification_reasons: [
      "CRITICAL: Found contradictory PAN numbers (AAACG1122J vs AAACG9999P) across proposal documents.",
      "GSTIN 06AAACG1122J1Z8 is flagged as EXPIRED or CANCELLED in statutory tax filings.",
      "Failed Make in India: 0% local content does not meet Class-1 threshold (>= 50%).",
      "Offers 6-month warranty, failing mandatory 3-Year comprehensive requirement."
    ],
    file_info: {
      filename: "Bid_GlobalCorp_Ineligible.pdf",
      file_type: "PDF",
      vendor_name: "GlobalCorp Enterprises Limited",
      page_count: 10,
      gstin: "06AAACG1122J1Z8",
      all_gstins: ["06AAACG1122J1Z8"],
      gstin_expired: true,
      pan: "AAACG1122J",
      all_pans: ["AAACG1122J", "AAACG9999P"],
      udyam: null,
      is_msme: true,
      total_quote_inr: 5400000.0,
      turnover_cr: 0.85,
      emd_status: "MISSING",
      warranty: "6-Month Carry-in Warranty (Sub-standard)",
      bonus_perks: [],
      local_content_pct: 0
    },
    branch_b_clause_results: [
      { clause_id: "GFR-149-GST", clause_name: "GSTIN Registration & Validity", status: "FAIL", regulation_ref: "GFR 2017 Rule 149 / Statutory Tax Compliance", evidence: "GSTIN 06AAACG1122J1Z8 is flagged as EXPIRED or CANCELLED.", remedy: "Provide active GSTIN reactivation certificate from GST portal." },
      { clause_id: "GFR-160-MSME", clause_name: "Annual Financial Turnover Requirement", status: "EXEMPT", regulation_ref: "Public Procurement Policy for MSEs Order 2012 / GFR Rule 160", evidence: "Exemption claimed under MSE provisions.", remedy: null },
      { clause_id: "GFR-170-EMD", clause_name: "Earnest Money Deposit (EMD)", status: "EXEMPT", regulation_ref: "GFR 2017 Rule 170(i) / MSME Policy 2012", evidence: "Exemption claimed under MSE provisions.", remedy: null },
      { clause_id: "MII-2017-LC", clause_name: "Make in India Local Content Preference", status: "FAIL", regulation_ref: "Public Procurement (Make in India) Order 2017", evidence: "Local content of 0% fails Class-1 Local Supplier requirement (Minimum 50%).", remedy: "Provide OEM certificate verifying >= 50% domestic value addition." },
      { clause_id: "SPEC-WARRANTY", clause_name: "Comprehensive Onsite Warranty", status: "FAIL", regulation_ref: "Tender Technical Specifications", evidence: "Offers sub-standard warranty (6-Month Carry-in). Minimum 3-Year comprehensive warranty required.", remedy: "Provide OEM commitment letter for 3-Year onsite warranty coverage." }
    ],
    clause_level_decisions: [
      { clause_id: "GFR-149-GST", clause_name: "GSTIN Registration & Validity", status: "FAIL", regulation_ref: "GFR 2017 Rule 149 / Statutory Tax Compliance", evidence: "GSTIN 06AAACG1122J1Z8 is flagged as EXPIRED or CANCELLED.", remedy: "Provide active GSTIN reactivation certificate from GST portal." },
      { clause_id: "GFR-160-MSME", clause_name: "Annual Financial Turnover Requirement", status: "EXEMPT", regulation_ref: "Public Procurement Policy for MSEs Order 2012 / GFR Rule 160", evidence: "Exemption claimed under MSE provisions.", remedy: null },
      { clause_id: "GFR-170-EMD", clause_name: "Earnest Money Deposit (EMD)", status: "EXEMPT", regulation_ref: "GFR 2017 Rule 170(i) / MSME Policy 2012", evidence: "Exemption claimed under MSE provisions.", remedy: null },
      { clause_id: "MII-2017-LC", clause_name: "Make in India Local Content Preference", status: "FAIL", regulation_ref: "Public Procurement (Make in India) Order 2017", evidence: "Local content of 0% fails Class-1 Local Supplier requirement (Minimum 50%).", remedy: "Provide OEM certificate verifying >= 50% domestic value addition." },
      { clause_id: "SPEC-WARRANTY", clause_name: "Comprehensive Onsite Warranty", status: "FAIL", regulation_ref: "Tender Technical Specifications", evidence: "Offers sub-standard warranty (6-Month Carry-in). Minimum 3-Year comprehensive warranty required.", remedy: "Provide OEM commitment letter for 3-Year onsite warranty coverage." }
    ],
    branch_c_govt_verification: {
      overall_govt_verification: "FLAGGED_FOR_REVIEW",
      verified_gateways_count: 3,
      total_gateways: 5,
      pan_gstin_consistent: true,
      gateways: [
        { name: "GSTN Common Portal", status: "CANCELLED / SUSPENDED", badge: "FAIL" },
        { name: "ITD PAN Registry", status: "VALID & OPERATIVE (ITD SYNC)", badge: "PASS" },
        { name: "MCA21 Corporate Affairs", status: "ACTIVE ENTITY (MCA21)", badge: "PASS" },
        { name: "Udyam MSME Portal", status: "NOT_APPLICABLE", badge: "NEUTRAL" },
        { name: "EPFO & ESIC Labour Compliance", status: "COMPLIANT (EPFO/ESIC)", badge: "PASS" },
        { name: "CPPP Central Debarment Watchlist", status: "UNDER INVESTIGATION / WATCHLIST", badge: "FAIL" }
      ]
    },
    government_verification: {
      overall_govt_verification: "FLAGGED_FOR_REVIEW",
      verified_gateways_count: 3,
      total_gateways: 5,
      pan_gstin_consistent: true,
      gateways: [
        { name: "GSTN Common Portal", status: "CANCELLED / SUSPENDED", badge: "FAIL" },
        { name: "ITD PAN Registry", status: "VALID & OPERATIVE (ITD SYNC)", badge: "PASS" },
        { name: "MCA21 Corporate Affairs", status: "ACTIVE ENTITY (MCA21)", badge: "PASS" },
        { name: "Udyam MSME Portal", status: "NOT_APPLICABLE", badge: "NEUTRAL" },
        { name: "EPFO & ESIC Labour Compliance", status: "COMPLIANT (EPFO/ESIC)", badge: "PASS" },
        { name: "CPPP Central Debarment Watchlist", status: "UNDER INVESTIGATION / WATCHLIST", badge: "FAIL" }
      ]
    },
    rejection_risk_analysis: {
      risk_tier: "HIGH",
      risk_score: 0.88,
      rejection_likely: true,
      reasons: [
        { category: "Contradiction Anomaly", clause: "Conflicting PAN Numbers in Attachments", impact: "High risk of fraudulent or unauthorized third-party proxy bidding." },
        { category: "Document Discrepancy", clause: "GSTIN Status Inactive / Cancelled", impact: "Statutory non-compliance with GFR Rule 149 and GeM General Terms." },
        { category: "Document Discrepancy", clause: "Unsubstantiated Make in India Self-Declaration", impact: "Disqualification of domestic purchase preference." }
      ]
    },
    value_spotlight: { is_spotlight_candidate: false, vendor_type: "Micro & Small Enterprise (MSME)", quoted_price_inr: 5400000.0, estimated_savings_inr: null, value_highlights: [] },
    contradictions_detected: [
      { contradiction_id: "CONTRA-PAN-01", type: "CROSS_ATTACHMENT_PAN_MISMATCH", severity: "CRITICAL", title: "Conflicting PAN Numbers in Attachments", description: "Found multiple conflicting PAN numbers (AAACG1122J, AAACG9999P) between Cover Letter and Annexure documents.", impact: "High risk of proxy bidding.", remedy: "Provide unified PAN affidavit." },
      { contradiction_id: "CONTRA-TAX-STATUS-03", type: "TAX_STATUS_CONTRADICTION", severity: "HIGH", title: "GSTIN Status Inactive / Cancelled", description: "Bid claims active operations, but GSTIN 06AAACG1122J1Z8 is recorded as CANCELLED.", impact: "Non-compliance with GFR Rule 149.", remedy: "Obtain GSTIN reactivation order." }
    ],
    claim_integrity: { integrity_score: 0, integrity_tier: "CRITICAL RISK / FRAUD ANOMALY" }
  }
];

export const SAMPLE_RECTIFIED_RESULT = {
  file_id: "sample_bid_globalcorp_rectified_reevaluation_pdf",
  is_compliant: true,
  compliance_score: 1.0,
  disqualification_reasons: [],
  file_info: {
    filename: "Bid_GlobalCorp_Rectified_ReEvaluation.pdf",
    file_type: "PDF",
    vendor_name: "GlobalCorp Enterprises Limited",
    page_count: 10,
    gstin: "06AAACG1122J1Z8",
    all_gstins: ["06AAACG1122J1Z8"],
    gstin_expired: false,
    pan: "AAACG1122J",
    all_pans: ["AAACG1122J"],
    udyam: null,
    is_msme: false,
    total_quote_inr: 4900000.0,
    turnover_cr: 2.1,
    emd_status: "SUBMITTED",
    warranty: "3-Year Comprehensive Warranty",
    bonus_perks: [],
    local_content_pct: 52
  },
  branch_b_clause_results: [
    { clause_id: "GFR-149-GST", clause_name: "GSTIN Registration & Validity", status: "PASS", regulation_ref: "GFR 2017 Rule 149", evidence: "Active GSTIN 06AAACG1122J1Z8 verified with state reactivation certificate.", remedy: null },
    { clause_id: "GFR-160-TO", clause_name: "Annual Financial Turnover Requirement", status: "PASS", regulation_ref: "GFR 2017 Rule 160 (Turnover Criteria)", evidence: "Audited turnover of INR 2.10 Cr meets minimum threshold of INR 1.50 Cr.", remedy: null },
    { clause_id: "GFR-170-EMD", clause_name: "Earnest Money Deposit (EMD)", status: "PASS", regulation_ref: "GFR 2017 Rule 170", evidence: "PNB Bank Guarantee for INR 1,00,000 submitted.", remedy: null },
    { clause_id: "MII-2017-LC", clause_name: "Make in India Local Content Preference", status: "PASS", regulation_ref: "Public Procurement (Make in India) Order 2017", evidence: "Local content of 52% qualifies as Class-1 Local Supplier.", remedy: null },
    { clause_id: "SPEC-WARRANTY", clause_name: "Comprehensive Onsite Warranty", status: "PASS", regulation_ref: "Tender Technical Specifications", evidence: "Offers 3-Year Comprehensive Onsite OEM Warranty.", remedy: null }
  ],
  clause_level_decisions: [
    { clause_id: "GFR-149-GST", clause_name: "GSTIN Registration & Validity", status: "PASS", regulation_ref: "GFR 2017 Rule 149", evidence: "Active GSTIN 06AAACG1122J1Z8 verified with state reactivation certificate.", remedy: null },
    { clause_id: "GFR-160-TO", clause_name: "Annual Financial Turnover Requirement", status: "PASS", regulation_ref: "GFR 2017 Rule 160 (Turnover Criteria)", evidence: "Audited turnover of INR 2.10 Cr meets minimum threshold of INR 1.50 Cr.", remedy: null },
    { clause_id: "GFR-170-EMD", clause_name: "Earnest Money Deposit (EMD)", status: "PASS", regulation_ref: "GFR 2017 Rule 170", evidence: "PNB Bank Guarantee for INR 1,00,000 submitted.", remedy: null },
    { clause_id: "MII-2017-LC", clause_name: "Make in India Local Content Preference", status: "PASS", regulation_ref: "Public Procurement (Make in India) Order 2017", evidence: "Local content of 52% qualifies as Class-1 Local Supplier.", remedy: null },
    { clause_id: "SPEC-WARRANTY", clause_name: "Comprehensive Onsite Warranty", status: "PASS", regulation_ref: "Tender Technical Specifications", evidence: "Offers 3-Year Comprehensive Onsite OEM Warranty.", remedy: null }
  ],
  branch_c_govt_verification: {
    overall_govt_verification: "PASS",
    verified_gateways_count: 5,
    total_gateways: 5,
    pan_gstin_consistent: true,
    gateways: [
      { name: "GSTN Common Portal", status: "ACTIVE & FILED (VERIFIED)", badge: "PASS" },
      { name: "ITD PAN Registry", status: "VALID & OPERATIVE (ITD SYNC)", badge: "PASS" },
      { name: "MCA21 Corporate Affairs", status: "ACTIVE ENTITY (MCA21)", badge: "PASS" },
      { name: "Udyam MSME Portal", status: "NOT_APPLICABLE", badge: "NEUTRAL" },
      { name: "EPFO & ESIC Labour Compliance", status: "COMPLIANT (EPFO/ESIC)", badge: "PASS" },
      { name: "CPPP Central Debarment Watchlist", status: "CLEAN / NOT BLACKLISTED", badge: "PASS" }
    ]
  },
  government_verification: {
    overall_govt_verification: "PASS",
    verified_gateways_count: 5,
    total_gateways: 5,
    pan_gstin_consistent: true,
    gateways: [
      { name: "GSTN Common Portal", status: "ACTIVE & FILED (VERIFIED)", badge: "PASS" },
      { name: "ITD PAN Registry", status: "VALID & OPERATIVE (ITD SYNC)", badge: "PASS" },
      { name: "MCA21 Corporate Affairs", status: "ACTIVE ENTITY (MCA21)", badge: "PASS" },
      { name: "Udyam MSME Portal", status: "NOT_APPLICABLE", badge: "NEUTRAL" },
      { name: "EPFO & ESIC Labour Compliance", status: "COMPLIANT (EPFO/ESIC)", badge: "PASS" },
      { name: "CPPP Central Debarment Watchlist", status: "CLEAN / NOT BLACKLISTED", badge: "PASS" }
    ]
  },
  rejection_risk_analysis: { risk_tier: "LOW", risk_score: 0.05, rejection_likely: false, reasons: [] },
  value_spotlight: {
    is_spotlight_candidate: true,
    vendor_type: "Standard Enterprise",
    quoted_price_inr: 4900000.0,
    estimated_savings_inr: 100000.0,
    value_highlights: ["Cost Savings: Quoted INR 4,900,000 (Saves INR 100,000 / 2.0% below tender budget)."]
  },
  contradictions_detected: [],
  claim_integrity: { integrity_score: 100, integrity_tier: "HIGH INTEGRITY" }
};
