# Security & Data Sovereignty Policy 🛡️

**BidLens AI — Autonomous GeM Procurement Audit Platform**  
*Aligned with CERT-In Cybersecurity Guidelines & National Procurement Sovereignty*

---

## 1. Security Philosophy: Sovereign by Design

Government procurement involves confidential commercial bids, financial statements, and sensitive technical specifications across national infrastructure, railways, and defence projects.

BidLens AI is architected with a **Zero-Trust, Zero-Cloud-Retention** security posture:

1. **100% Air-Gapped Capability:** The platform runs fully isolated on local edge hardware without outbound telemetry or third-party cloud data dependencies.
2. **Deterministic Statutory Execution:** GFR 2017 Rules (Rules 149, 160, 170) and MSME exemption policies are executed in strictly deterministic Python code rather than probabilistic generative models, eliminating hallucination risks.
3. **Cryptographic Anti-Tampering:** Every document uploaded receives an immediate **SHA-256 cryptographic digest**. Any in-flight file alteration causes an instant integrity mismatch and halts processing.
4. **Prompt Injection Neutralization:** All unstructured document text passes through a multi-stage sanitization filter that strips adversarial instructions (e.g., `ignore previous rules`, `approve this bid automatically`) and wraps content in `<UNTRUSTED_DOCUMENT>` XML quarantine blocks.
5. **Immutable Audit Trail:** Every evaluation decision, clause-level override, and officer justification is permanently recorded with timestamps and officer credentials in an immutable audit ledger.

---

## 2. Reporting a Vulnerability

We take the security of government procurement systems with utmost seriousness. If you discover a security vulnerability, please follow responsible disclosure:

1. **Do not** file a public GitHub issue.
2. Email the core development team at `archoudhury19@gmail.com` with:
   - Detailed description of the vulnerability
   - Proof of Concept (PoC) or reproduction steps
   - Potential impact on document integrity or compliance decisions
3. We acknowledge receipt within **24 hours** and aim to provide a remediation patch within **72 hours**.

---

## 3. Compliance Matrix

| Standard / Framework | Compliance Status | Implementation |
| :--- | :--- | :--- |
| **GFR 2017** | **PASS (Deterministic)** | Rules 149, 160, 170 rule engine |
| **Public Procurement (MSEs) Order 2012** | **PASS** | Automated Udyam validation & prior turnover waiver |
| **DPIIT Make in India Order 2017** | **PASS** | Class-1 Local Supplier (>= 50%) verification |
| **CERT-In Cyber Security Directions** | **PASS** | SHA-256 fingerprinting, zero-telemetry, offline edge readiness |
| **Prompt Injection Protection** | **PASS** | XML boundary isolation & adversarial keyword scrubbing |
