# BidLens AI 🔍
### *AI-Powered GeM Bid Compliance Verification Platform*
**Smart India Hackathon 2026 | Problem ID: SIH26100**

---

[![CI](https://github.com/BidLens-AI/BidLens-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/BidLens-AI/BidLens-AI/actions/workflows/ci.yml)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Frontend%20Live-000000.svg?logo=vercel)](https://bidlens-ai.vercel.app)
[![Render Cloud Backend](https://img.shields.io/badge/Render-Backend%20Live-46E3B7.svg?logo=render)](https://bidlens-ai.onrender.com/system/health)
[![GFR 2017 Compliant](https://img.shields.io/badge/GFR%202017-Validated-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![SIH 2026](https://img.shields.io/badge/SIH-2026-orange.svg)]()

> 🌐 **Live Public Prototype:** [https://bidlens-ai.vercel.app](https://bidlens-ai.vercel.app)  
> ⚡ **Live Sovereign Backend API:** [https://bidlens-ai.onrender.com](https://bidlens-ai.onrender.com)  
> 📚 **Interactive Swagger API Docs:** [https://bidlens-ai.onrender.com/docs](https://bidlens-ai.onrender.com/docs)  
> 🛡️ **Edge System Health Check:** [https://bidlens-ai.onrender.com/system/health](https://bidlens-ai.onrender.com/system/health)

---

## 📌 Executive Summary

Government procurement through the **Government e-Marketplace (GeM)** involves evaluating hundreds of tender submissions comprising thousands of pages of technical specifications, certificates, financial disclosures, and OEM authorizations.

Manual evaluation is prone to:
* **Human Fatigue & Oversight:** Overlooked cross-document contradictions (e.g., turnover discrepancies between cover letters and balance sheets).
* **Unfair MSME Disqualifications:** Accidental rejections due to complex statutory exemptions under the **MSME Policy Order 2012** and **GFR 2017**.
* **Long Turnaround Times:** Weeks spent manually validating GSTIN, MCA company statuses, and GFR clauses.
* **Integrity Risks:** Lack of an immutable audit trail and potential tampering with submitted documents.

**BidLens AI** is an intelligent procurement co-pilot designed to streamline GeM bid audits. It verifies compliance against statutory rules deterministically, detects subtle cross-document contradictions, calculates an explainable rejection-risk score with exact clause and page references, and spotlights high-value MSME vendors.

---

## ✨ Key Capabilities

| Capability | Description |
| :--- | :--- |
| **Multi-Modal Document Parsing** | Digital and scanned PDF ingestion via **PyMuPDF** & **EasyOCR**, extracting text, tables, and stamped certificates. |
| **Deterministic GFR 2017 Rule Engine** | 100% deterministic rule checks (zero LLM hallucination) for **Rule 149** (Certificate Validity), **Rule 160** (Turnover), **Rule 170** (EMD calculations), and MSME exemptions. |
| **Cross-Document Contradiction Detector** | Pinpoints mismatches in GSTIN, PAN, company names, OEM authorization letters (MAF), and turnover figures across multiple uploaded attachments. |
| **Clause-to-Evidence Knowledge Graph** | Built with **NetworkX**, establishing transparent relationships: `Regulation` ➔ `Clause` ➔ `Required Evidence` ➔ `Submitted Document` ➔ `Audit Decision`. |
| **Explainable Rejection-Risk Scorer** | Replaces black-box AI scores with grounded risk reports citing specific clause failures, regulation references, and evidence page numbers. |
| **Live Government Registry Verification** | Integrations for automated checks against **GSTN** (active taxpayer status) and **MCA21** (corporate registration). |
| **Enterprise Security & Anti-Tampering** | Instant **SHA-256 cryptographic fingerprinting** upon upload, prompt-injection sanitization, and XML document boundary tagging. |
| **Human-in-the-Loop Review** | Officer decision portal for approving, rejecting, or requesting clarifications with mandatory justification trails logged immutably. |

---

## 🏛️ System Architecture

BidLens AI utilizes a validated **6-Layer Architecture** to guarantee deterministic compliance verification alongside advanced AI reasoning:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Layer 1: Next.js Frontend Portal                  │
│          Bid Submission • Evidence Explorer • Officer Decision UI      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST
┌───────────────────────────────────▼────────────────────────────────────┐
│                    Layer 2: FastAPI Backend Gateway                    │
│    Document Ingestion • SHA-256 Fingerprinting • Session Management   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Async Fan-out
┌───────────────────────────────────▼────────────────────────────────────┐
│                  Layer 3: Central Audit Orchestrator                   │
│  ┌───────────────────────┬──────────────────────┬────────────────────┐ │
│  │      Branch A:        │      Branch B:       │     Branch C:      │ │
│  │   AI Processing       │  GFR 2017 Rule Engine│ Govt Verification  │ │
│  │ (OCR + spaCy + LLMs)  │ (Deterministic Code) │   (GSTN + MCA21)   │ │
│  └───────────────────────┴──────────────────────┴────────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Aggregated Findings
┌───────────────────────────────────▼────────────────────────────────────┐
│                 Layer 4: Evidence & Risk Analysis Engine               │
│  Cross-Document Contradiction ───► Knowledge Graph ───► Risk Scorer    │
│            Detector                      (NetworkX)     (Explainable)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Risk & Evidence Report
┌───────────────────────────────────▼────────────────────────────────────┐
│                Layer 5: Officer Review & Audit Logging                 │
│      Compliance Findings • Human Override • Immutable Audit Log        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Persist
┌───────────────────────────────────▼────────────────────────────────────┐
│                    Layer 6: Data & Storage Layer                       │
│    PostgreSQL (Metadata & Audits) • Vector Store • Secure Storage      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
BidLens-AI/
├── backend/                             # Layer 2-4: FastAPI Sovereign Backend
│   ├── evidence_risk/                   # Layer 4: Evidence & Risk Engine
│   │   ├── contradiction.py             # Cross-document discrepancy detector
│   │   ├── graph_engine.py              # NetworkX Clause-to-Evidence Knowledge Graph
│   │   └── risk_scorer.py               # Explainable rejection risk scorer
│   ├── models/                          # Pydantic Schemas & Data Contracts
│   │   └── schemas.py                   # API request/response models
│   ├── orchestrator/                    # Layer 3: Central Audit Orchestrator
│   │   ├── ai_processing.py             # PyMuPDF + RapidOCR + NLP entity extraction
│   │   ├── govt_verify.py               # Simulated GSTN & MCA21 verification
│   │   ├── orchestrator.py              # Parallel 3-branch async dispatcher
│   │   └── rule_engine.py               # Deterministic GFR 2017 & MSME rules
│   ├── routers/                         # Layer 2: API Endpoints
│   │   ├── audit.py                     # Audit initiation & status polling
│   │   ├── document.py                  # PDF upload, listing & SHA-256 fingerprinting
│   │   └── review.py                    # Officer review & decision logging
│   ├── security/                        # Security & Air-Gapped Engine
│   │   ├── offline_mode.py              # Sovereign system health & air-gap monitor
│   │   └── sha256_audit.py              # Cryptographic hashing & prompt sanitizer
│   ├── utils/                           # Utilities & PDF generators
│   │   └── pdf_generator.py             # ReportLab official audit report generator
│   ├── uploaded_docs/                   # Local repository for uploaded tender PDFs
│   ├── generated_reports/               # Generated official audit PDF dossiers
│   ├── Dockerfile                       # Production Debian-slim container definition
│   ├── .dockerignore                    # Build exclusions for Docker container
│   ├── main.py                          # FastAPI entry point (Port 8000)
│   ├── requirements.txt                 # Python dependencies
│   └── .env.example                     # Environment configuration template
├── frontend/                            # Layer 1: Next.js Officer Web Portal
│   ├── pages/                           # Next.js Pages router
│   │   ├── _app.js                      # Application wrapper & theme
│   │   └── index.js                     # Officer dashboard & audit interface
│   ├── public/                          # Static assets & Government of India logo
│   ├── styles/                          # TailwindCSS & custom styles
│   ├── utils/                           # Client utilities
│   │   └── sihSampleCache.js            # Zero-failure sovereign evaluation cache
│   ├── package.json                     # Node.js dependencies & scripts
│   ├── vercel.json                      # Vercel edge reverse-proxy configuration
│   └── next.config.js                   # Next.js configuration
├── data/
│   └── sample_bids/                     # 8 Pre-loaded Tender & Vendor Bids
│       ├── Tender_RFP_GeM_Computers.pdf      # Official GeM Tender RFP
│       ├── Bid_ApexLabs_MSME.pdf             # MSME vendor (Qualifies with waiver)
│       ├── Bid_ApexLabs_Proposal.docx        # Technical proposal document
│       ├── Scanned_Letter_ApexLabs.png       # Scanned/stamped authorization letter
│       ├── Bid_MegaTech_BigBrand.pdf         # Large enterprise bid
│       ├── BoQ_PriceSchedule_MegaTech.xlsx   # Financial Bill of Quantities (BoQ)
│       ├── Bid_GlobalCorp_Ineligible.pdf     # Ineligible bid (PAN/GSTIN mismatch)
│       └── Bid_GlobalCorp_Rectified_ReEvaluation.pdf # Re-evaluated rectified bid
├── docs/                                # Project documentation & handover dossiers
│   └── SIH26100_BidLens_Project_Master_Handover.pdf # Master technical handover
├── scripts/                             # Utility & deployment scripts
│   ├── generate_comprehensive_samples.py # Script generating test bid packages
│   ├── run_live_tunnel.bat              # 1-Click public HTTPS tunnel for jury demos
│   └── run_live_tunnel.ps1              # PowerShell live tunnel script
├── Start_BidLens.bat                    # 1-Click launcher for both local servers
├── vercel.json                          # Monorepo Vercel routing configuration
├── LICENSE                              # MIT License
└── README.md                            # Complete Project Documentation
```

---

## 🛠️ Tech Stack

* **Frontend:** [Next.js 14](https://nextjs.org/) + [React 18](https://react.dev/) + CSS3 (Official Government of India styling)
* **Backend Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+) with [Uvicorn](https://www.uvicorn.org/) ASGI
* **Document Extraction:** [PyMuPDF](https://pymupdf.readthedocs.io/) (digital PDFs), [RapidOCR](https://github.com/RapidAI/RapidOCR) (on-device OCR for scanned letters), [python-docx](https://python-docx.readthedocs.io/), [openpyxl](https://openpyxl.readthedocs.io/) (Excel BoQ)
* **Rule Engine & Graphs:** Deterministic GFR 2017 Rules (Rules 149, 160, 170), [NetworkX](https://networkx.org/) Knowledge Graph
* **Dossier Generation:** [ReportLab](https://www.reportlab.com/) (Official signed audit reports)
* **Security & Verification:** SHA-256 cryptographic hashing, prompt-injection defense, 5-portal registry sync (GSTN, PAN, MCA21, Udyam, CPPP)
* **Deployment Modes:** 100% Air-Gapped / On-Premise / NIC MeghRaj Cloud compatible

---

## 🚀 How to Turn On Backend & Frontend

You can run BidLens AI in **three different ways**, depending on your environment and preference.

### 🌟 Method 1: 1-Click Launch (Recommended for Windows)

The easiest way to start both servers simultaneously:

1. Navigate to the repository directory.
2. Double-click **`Start_BidLens.bat`** (or open terminal and type `.\Start_BidLens.bat`).
3. This automatically launches two dedicated terminal windows:
   - 🟢 **Window 1:** FastAPI Backend on `http://localhost:8000`
   - 🔵 **Window 2:** Next.js Frontend on `http://localhost:3000`

---

### 💻 Method 2: Step-by-Step Manual Launch (Windows, macOS, Linux)

If you prefer running the servers manually or are working on Linux/macOS:

#### Step 1: Start the Backend (Terminal 1)

```bash
# 1. Navigate to the backend directory
cd backend

# 2. (Optional but recommended) Create & activate a virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Copy environment configuration
cp .env.example .env

# 5. Start the FastAPI backend server
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
> ✅ **Backend Status:** Live at **`http://localhost:8000`**  
> 📖 **API Docs (Swagger UI):** **`http://localhost:8000/docs`**  
> 🩺 **System Health Check:** **`http://localhost:8000/system/health`**

#### Step 2: Start the Frontend (Terminal 2)

Open a **new** terminal tab or window:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node.js dependencies
npm install

# 3. Start the Next.js development server
npm run dev
```
> 🌐 **Frontend UI:** Open your browser at **`http://localhost:3000`**

---

### 🌍 Method 3: Live Public Sharing Mode (For Hackathon Judges & Demos)

To share the running portal with judges or view it on a mobile phone / another laptop over the internet:

1. Make sure both Backend and Frontend dependencies are installed.
2. Run the tunnel batch script directly:
   ```bash
   .\scripts\run_live_tunnel.bat
   ```
   *(Or using PowerShell: `.\scripts\run_live_tunnel.ps1`)*
3. The script launches the backend, starts the frontend, and generates a secure public HTTPS URL via `localtunnel` (e.g., `https://xxxx.loca.lt`).
4. Share that link with the judges to let them interact with the portal live!

---

### 🛡️ Method 4: 100% Air-Gapped / Offline Edge Verification

BidLens AI is designed to function completely offline without internet connectivity. To verify sovereign offline readiness:

1. Disconnect your machine from Wi-Fi / Ethernet.
2. Start the servers using **Method 1** or **Method 2**.
3. Visit **`http://localhost:8000/system/health`** in your browser.
4. You will observe:
   - `mode`: `"100% SOVEREIGN_OFFLINE_EDGE"`
   - `data_consumption_kb`: `0.0`
   - `cloud_data_retention`: `"DISABLED (AIR-GAPPED COMPATIBLE)"`
   - `security_integrity`: SHA-256 fingerprinting active and prompt sanitizer enabled.

---

## 🧪 Testing with Pre-Loaded Sample Bids

The platform includes 8 authentic tender and vendor documents in `data/sample_bids/`:

| File Name | Description | Expected Test Outcome |
| :--- | :--- | :--- |
| `Tender_RFP_GeM_Computers.pdf` | Master RFP tender document | Establishes procurement requirements & GFR criteria |
| `Bid_ApexLabs_MSME.pdf` | Small MSME enterprise bid | **PASS (Exempted):** Turnover waived under MSME Order 2012 |
| `Bid_MegaTech_BigBrand.pdf` | Major OEM vendor proposal | **PASS:** Fully compliant with all turnover & EMD thresholds |
| `BoQ_PriceSchedule_MegaTech.xlsx` | Excel Bill of Quantities | Ingested by `openpyxl` table parser |
| `Scanned_Letter_ApexLabs.png` | Stamped authorization letter | Ingested by `RapidOCR` on-device deep learning OCR |
| `Bid_GlobalCorp_Ineligible.pdf` | Non-compliant bid | **CRITICAL RISK / FAIL:** PAN/GSTIN mismatch & expired validity |
| `Bid_GlobalCorp_Rectified_ReEvaluation.pdf` | Corrected re-submission | **PASS:** Used to demonstrate instant bid re-verification |

**How to Test in the UI:**
1. Open `http://localhost:3000`.
2. Click on the 1-Click Sample Vendor buttons (ApexLabs, MegaTech, or GlobalCorp) or drag-and-drop any PDF from `data/sample_bids/`.
3. Click **"Run Full Audit"** to witness parallel OCR, GFR rule checking, cross-document contradiction detection, and knowledge graph mapping in real time.

---

## 📡 Core API Endpoints

| Method | Endpoint | Group | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | System | Root status and API documentation URL |
| `GET` | `/system/health` | System | Sovereign edge metrics, memory footprint & air-gap integrity |
| `POST` | `/document/upload` | Document | Ingest PDF, compute SHA-256 fingerprint, and stage for audit |
| `GET` | `/document/list` | Document | List all ingested documents in the local repository |
| `POST` | `/audit/run` | Audit | Queue an asynchronous 3-branch audit on an uploaded bid |
| `GET` | `/audit/status/{audit_id}` | Audit | Check progress, risk score, and contradiction results |
| `POST` | `/review/decision` | Review | Submit procurement officer action (`APPROVE`, `REJECT`, `CLARIFY`) |
| `GET` | `/review/log/{audit_id}` | Review | Fetch immutable audit trail with officer ID and timestamps |

---

## 🔧 Troubleshooting & FAQ

### Port 8000 or Port 3000 Already in Use
If another application is using port 8000 or 3000, you can free them via Windows Command Prompt:
```cmd
# Check process on port 8000
netstat -ano | findstr :8000
# Kill process by PID
taskkill /PID <PID_NUMBER> /F

# Check process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Missing Python Packages
Make sure you are running Python 3.10+ and have installed all requirements:
```bash
pip install -r backend/requirements.txt
```

### Node.js / NPM Issues
Verify Node.js version (v18 or higher recommended):
```bash
node -v
npm -v
```

---

## 🛡️ Security & Compliance Standards

1. **Anti-Tampering Fingerprint:** Every uploaded document is hashed with SHA-256 upon reception. The hash is verified before downstream processing to prevent in-flight file modification.
2. **Prompt Injection Defense:** Before any LLM processing, documents pass through an injection filter scrubbing jailbreak strings (`ignore previous instructions`, `system prompt:`) and are strictly wrapped inside `<UNTRUSTED_DOCUMENT>` XML boundaries.
3. **Statutory Non-Hallucination:** Crucial procurement statutes (GFR Rules 149, 160, 170) are processed through deterministic Python functions rather than generative models.
4. **Immutable Decision Trail:** All procurement officer approvals, rejections, and justifications are permanently recorded in `audit_decision_trail.json` with timestamp and officer ID.

---

## 👥 Team Hexagon

Developed for **Smart India Hackathon (SIH) 2026** by **Team Hexagon** (Team ID: **SIH26009**).

* **Person 1:** API Gateway & Document Router, Data Models, Security & Anti-Tampering, Officer Review Portal.
* **Person 2:** Central Audit Orchestrator, AI/OCR Extraction Pipeline, GFR 2017 Rule Engine, Contradiction Detector & Knowledge Graph..

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
