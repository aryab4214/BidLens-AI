# Contributing to BidLens AI 🤝

Thank you for contributing to **BidLens AI** (Smart India Hackathon 2026, Problem Statement: SIH26100).

---

## 1. Development Workflow

1. **Clone & Branch:**
   ```bash
   git clone https://github.com/BidLens-AI/BidLens-AI.git
   cd BidLens-AI
   git checkout -b feature/your-feature-name
   ```
2. **Setup Virtual Environment:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. **Run Automated Tests:**
   Ensure all tests pass before committing:
   ```bash
   python -m unittest discover -s backend/tests -v
   ```

---

## 2. Commit Message Standards

We enforce **Conventional Commits**:
* `feat(...)`: A new feature (e.g. `feat(audit): add Make in India Class-2 local content threshold`)
* `fix(...)`: A bug fix (e.g. `fix(audit): correct PAN normalization across annexures`)
* `docs(...)`: Documentation changes (e.g. `docs: update system architecture diagram`)
* `chore(...)`: Routine tasks or maintenance (e.g. `chore: update dependencies`)
* `test(...)`: Adding or updating test cases

---

## 3. Adding New Statutory Rules (GFR / GeM Circulars)

When adding a new procurement rule to `backend/orchestrator/rule_engine.py`:
1. Rule checks must be **100% deterministic** (pure Python functions without probabilistic generative AI).
2. Every rule must cite the exact regulation reference (e.g., `GFR 2017 Rule 160`, `GeM GTC Clause 4.2`).
3. Include an automated test case in `backend/tests/test_core.py` covering both compliant and non-compliant scenarios.

---

## 4. Code of Conduct

We are committed to providing a professional, inclusive, and collaborative environment aligned with Smart India Hackathon standards. Respect all contributors and adhere to the highest engineering and ethical benchmarks.
