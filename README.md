# BidLens AI 🔍
### *AI-Powered GeM Bid Compliance Verification Platform*
**Smart India Hackathon 2026 | Problem ID: SIH26100**

---

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![GFR 2017 Compliant](https://img.shields.io/badge/GFR%202017-Validated-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![SIH 2026](https://img.shields.io/badge/SIH-2026-orange.svg)]()

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
├── backend/
│   ├── evidence_risk/           # Layer 4: Evidence & Risk Engine
│   │   ├── contradiction.py     # Cross-document inconsistency detection
│   │   ├── graph_engine.py      # NetworkX Clause-to-Evidence Knowledge Graph
│   │   └── risk_scorer.py       # Explainable risk calculation & reporting
│   ├── models/                  # Pydantic Schemas & Data Contracts
│   │   └── schemas.py           # Request/response validation models
│   ├── orchestrator/            # Layer 3: Multi-Branch Verification
│   │   ├── ai_processing.py     # OCR (EasyOCR/PyMuPDF) + spaCy NER + LLM
│   │   ├── govt_verify.py       # Live GSTN & MCA21 verification APIs
│   │   ├── orchestrator.py      # Asynchronous multi-branch dispatcher
│   │   └── rule_engine.py       # Deterministic GFR 2017 & MSME rules
│   ├── routers/                 # Layer 2: API Endpoints
│   │   ├── audit.py             # Audit execution and status endpoints
│   │   ├── document.py          # Document upload, storage & hashing
│   │   └── review.py            # Officer review and decision logging
│   ├── security/                # Anti-tamper & Input sanitization
│   │   └── sha256_audit.py      # SHA-256 fingerprinting & prompt guard
│   ├── utils/                   # Shared utility modules
│   ├── .env.example             # Template for API keys & database URLs
│   ├── main.py                  # FastAPI application entry point
│   └── requirements.txt         # Python dependencies
├── .gitignore
├── LICENSE                      # MIT License
└── README.md
```

---

## 🛠️ Tech Stack

* **Backend Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+) with Uvicorn ASGI
* **Document Extraction:** [PyMuPDF](https://pymupdf.readthedocs.io/) (fitz), [pdfplumber](https://github.com/jsvine/pdfplumber), [EasyOCR](https://github.com/JaidedAI/EasyOCR)
* **NLP & Information Extraction:** [spaCy](https://spacy.io/) (`en_core_web_sm`), RegEx Rule Matchers
* **LLM Engine (Pluggable):** Google Gemini API / Groq API / Ollama (Mistral-7B / Llama 3)
* **Knowledge Graph:** [NetworkX](https://networkx.org/) (Graph modeling & JSON export for visualization)
* **Security & Verification:** SHA-256 Cryptographic Hashes, Prompt Injection Sanitizers, Input Boundaries
* **Database & Storage:** PostgreSQL + `pgvector` (Vector search), Local Object Storage
* **Frontend (In Progress):** Next.js (React 19), TailwindCSS, Lucide Icons

---

## 🚀 Quick Start Guide

### Prerequisites
* Python 3.10 or higher
* Git
* (Optional) Node.js 18+ for frontend development

### 1. Clone the Repository
```bash
git clone https://github.com/aryab4214/BidLens-AI.git
cd BidLens-AI
```

### 2. Configure Backend Environment
```bash
cd backend
cp .env.example .env
```
Edit `.env` to supply your desired LLM key (e.g., `GEMINI_API_KEY`, `GROQ_API_KEY`, or leave default for local `OLLAMA_BASE_URL`).

### 3. Install Dependencies
```bash
# Recommended: create a virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 4. Run the Backend Server
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
The API will be accessible at `http://127.0.0.1:8000`.

### 5. Explore Interactive API Docs
Open your browser and navigate to:
* **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 📡 Core API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/document/upload` | Upload bid PDF; generates unique `file_id` and SHA-256 fingerprint |
| `GET` | `/document/list` | List all uploaded documents in the repository |
| `POST` | `/audit/run` | Queue an asynchronous 3-branch audit on an uploaded bid |
| `GET` | `/audit/status/{audit_id}` | Check processing state and retrieval status of an audit |
| `POST` | `/review/decision` | Submit officer review action (`APPROVE`, `REJECT`, `CLARIFY`) |
| `GET` | `/review/log/{audit_id}` | Retrieve complete, immutable audit trail for a bid |

---

## 🛡️ Security & Compliance Standards

1. **Anti-Tampering Fingerprint:** Every uploaded document is hashed with SHA-256 upon reception. The hash is compared before downstream processing to prevent in-flight modification.
2. **Prompt Injection Sanitization:** Prior to LLM analysis, documents pass through an injection filter scrubbing jailbreak patterns (`ignore previous instructions`, `system prompt:`) and are strictly wrapped inside `<UNTRUSTED_DOCUMENT>` boundaries.
3. **Statutory Non-Hallucination:** Crucial procurement statutes (GFR Rules 149, 160, 170) are processed through deterministic Python functions rather than generative models.
4. **Immutable Decision Trail:** All procurement officer approvals, rejections, and justifications are permanently recorded with timestamp and officer ID.

---

## 👥 Team HexaCore

Developed for **Smart India Hackathon (SIH) 2026** by Team HexaCore (CSE Department).

* **Person 1:** API Gateway & Document Router, Data Models, Security & Anti-Tampering, Officer Review Portal.
* **Person 2:** Central Audit Orchestrator, AI/OCR Extraction Pipeline, GFR 2017 Rule Engine, Contradiction Detector & Knowledge Graph.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
>>>>>>> Stashed changes
