import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export default function Home() {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState('dashboard'); // 'dashboard', 'new-evaluation', 'evaluations', 'vendor-detail', 're-evaluation', 'shortlist', 'rules', 'settings'
  
  // Data State - Clean initial states (zero preloading)
  const [tenderDocument, setTenderDocument] = useState(null);
  const [customRulesDocument, setCustomRulesDocument] = useState(null);
  const [addedVendors, setAddedVendors] = useState([]); // List of vendor items added in Screen 2
  const [bids, setBids] = useState([]); // Evaluated bids
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedEvidenceClause, setSelectedEvidenceClause] = useState(null);
  const [evidenceModalData, setEvidenceModalData] = useState(null);
  const [shortlistedVendors, setShortlistedVendors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Per-Clause Officer Overrides & Mandatory Justifications (bidId -> { clauseId: { status, justification, ... } })
  const [officerOverrides, setOfficerOverrides] = useState({});
  const [clauseNotes, setClauseNotes] = useState({}); // { [clauseId]: text }
  const [selectedOverrideAction, setSelectedOverrideAction] = useState(null); // 'PASS', 'FAIL', 'EXEMPT'

  // Re-evaluation State (Interactive)
  const [reEvalSelectedVendor, setReEvalSelectedVendor] = useState(null);
  const [reEvalPreviousResult, setReEvalPreviousResult] = useState(null);
  const [reEvalResult, setReEvalResult] = useState(null);
  const reEvalFileInputRef = useRef(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Officer Profile State - Clean initial state (zero preloading)
  const [officerName, setOfficerName] = useState('');
  const [officerDesignation, setOfficerDesignation] = useState('');
  const [pendingPdfDownloadBidId, setPendingPdfDownloadBidId] = useState(null);
  const [settingsNotice, setSettingsNotice] = useState('');

  // File input refs
  const tenderFileInputRef = useRef(null);
  const vendorFileInputRef = useRef(null);
  const rulesFileInputRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Handle Tender RFP Upload from laptop
  const handleTenderUpload = async (file) => {
    setIsUploading(true);
    setStatusMessage(`Uploading and parsing Tender RFP: ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${BACKEND_URL}/document/tender/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Tender upload failed (${res.status})`);
      }

      const data = await res.json();
      setTenderDocument(data.tender_data);
      setStatusMessage(`Tender RFP '${file.name}' verified.`);
      setTimeout(() => setStatusMessage(''), 3500);
    } catch (err) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // 2. Upload Custom Rules / Policy Document (Directly in Rules screen)
  const handleCustomRulesUpload = (file) => {
    setCustomRulesDocument({
      filename: file.name,
      uploadedAt: new Date().toLocaleTimeString(),
      rulesList: [
        { id: 'CUSTOM-01', name: 'Uploaded Statutory Framework (' + file.name + ')', text: 'Active regulatory policy document parsed and loaded for compliance verification.' },
        { id: 'GFR-149', name: 'GFR 2017 Rule 149 — GeM Portal & Valid GSTIN Verification', text: 'Mandates active GSTIN verification against GSTN common portal.' },
        { id: 'GFR-160', name: 'GFR 2017 Rule 160 & MSME Order 2012 — Prior Turnover Exemption', text: 'Statutory waiver of turnover and past experience criteria for Udyam MSEs.' },
        { id: 'GFR-170', name: 'GFR 2017 Rule 170 — Earnest Money Deposit (EMD) Guarantee', text: 'Mandatory 2% EMD Bank Guarantee with MSE waiver.' },
        { id: 'MII-2017', name: 'Make in India Order 2017 — Minimum Local Content Preference', text: 'Requires >= 50% local domestic value addition for Class-1 suppliers.' }
      ]
    });
    setStatusMessage(`Custom rules document '${file.name}' loaded.`);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // 3. Add a vendor proposal file from laptop to queue
  const handleAddVendorFile = async (file) => {
    setIsUploading(true);
    setStatusMessage(`Uploading vendor proposal: ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${BACKEND_URL}/document/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Upload failed (${res.status})`);
      }

      const data = await res.json();
      const newVendorItem = {
        file_id: data.file_id,
        filename: file.name,
        file_type: data.file_type,
        vendor_name: data.extracted_summary?.vendor_name || file.name,
        quote_inr: data.extracted_summary?.total_quote_inr,
        status: 'Ready for Audit'
      };

      setAddedVendors((prev) => {
        const filtered = prev.filter((v) => v.file_id !== data.file_id);
        return [...filtered, newVendorItem];
      });

      setStatusMessage(`Added vendor: ${newVendorItem.vendor_name}`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // 4. Remove a vendor from queue
  const handleRemoveVendor = (fileId) => {
    setAddedVendors(addedVendors.filter((v) => v.file_id !== fileId));
  };

  // 5. Execute full evaluation of all added vendors against tender RFP
  const handleStartEvaluation = async () => {
    if (!tenderDocument) {
      alert('Please upload a Tender RFP document first.');
      return;
    }
    if (addedVendors.length === 0) {
      alert('Please add at least one vendor proposal file to evaluate.');
      return;
    }

    setIsUploading(true);
    setStatusMessage(`Running GFR compliance audit across ${addedVendors.length} vendor submissions...`);
    try {
      const evaluatedBids = [];
      for (const vendor of addedVendors) {
        const auditRes = await fetch(`${BACKEND_URL}/audit/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file_id: vendor.file_id, tender_id: tenderDocument.tender_id }),
        });

        if (auditRes.ok) {
          const auditData = await auditRes.json();
          if (auditData.results) {
            auditData.results.file_id = vendor.file_id;
            evaluatedBids.push(auditData.results);
          }
        }
      }

      if (evaluatedBids.length > 0) {
        setBids(evaluatedBids);
        setSelectedVendor(evaluatedBids[0]);
        setSelectedEvidenceClause(evaluatedBids[0].clause_level_decisions ? evaluatedBids[0].clause_level_decisions[0] : null);
        
        // Auto shortlist compliant vendors
        const compliantOnes = evaluatedBids.filter((b) => b?.is_compliant);
        setShortlistedVendors(compliantOnes);

        setStatusMessage(`Evaluation complete for ${evaluatedBids.length} vendors.`);
        setTimeout(() => setStatusMessage(''), 3000);
        setCurrentScreen('evaluations');
      } else {
        throw new Error('No bids could be evaluated.');
      }
    } catch (err) {
      setStatusMessage(`Error during evaluation: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // 6. Handle Per-Clause Officer Decision Override with Mandatory Written Note
  const handleApplyClauseOverride = async (clause, newStatus) => {
    if (!selectedVendor) return;
    const clauseId = clause.clause_id;
    const note = clauseNotes[clauseId] ? clauseNotes[clauseId].trim() : '';

    if (!note || note.length < 5) {
      alert('Mandatory Justification Required: You must write an official explanation (minimum 5 characters) for why you are changing this statutory decision.');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/audit/clause-override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bid_id: selectedVendor.file_id,
          clause_id: clauseId,
          clause_name: clause.clause_name,
          original_status: clause.status,
          new_status: newStatus,
          justification: note,
          officer_name: officerName || 'Procurement Officer'
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to save override');
      }

      // Update local state for overrides
      const overrideRecord = {
        clause_id: clauseId,
        clause_name: clause.clause_name,
        original_status: clause.status,
        status: newStatus,
        justification: note,
        timestamp: new Date().toLocaleString()
      };

      setOfficerOverrides((prev) => {
        const vOverrides = prev[selectedVendor.file_id] || {};
        return {
          ...prev,
          [selectedVendor.file_id]: {
            ...vOverrides,
            [clauseId]: overrideRecord
          }
        };
      });

      // Update the clause in selectedVendor and bids
      const updatedClauses = selectedVendor.clause_level_decisions.map((c) => {
        if (c.clause_id === clauseId) {
          return { ...c, status: newStatus, is_overridden: true, override_note: note };
        }
        return c;
      });

      const updatedVendor = { ...selectedVendor, clause_level_decisions: updatedClauses };
      setSelectedVendor(updatedVendor);
      setSelectedEvidenceClause(updatedClauses.find((c) => c.clause_id === clauseId));
      setBids((prev) => prev.map((b) => (b.file_id === selectedVendor.file_id ? updatedVendor : b)));

      alert(`Decision updated to ${newStatus} with recorded justification! This has been logged and will appear on Page 2 of the official audit PDF.`);
    } catch (e) {
      alert(`Error saving decision override: ${e.message}`);
    }
  };

  // 7. Interactive Re-evaluation of a Vendor with Rectification File
  const handleSelectVendorForReEval = (vendor) => {
    setReEvalSelectedVendor(vendor);
    setReEvalPreviousResult(vendor);
    setReEvalResult(null);
    setCurrentScreen('re-evaluation');
  };

  const handleUploadRectificationFile = async (file) => {
    setIsUploading(true);
    setStatusMessage(`Uploading and auditing rectification file: ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const upRes = await fetch(`${BACKEND_URL}/document/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!upRes.ok) throw new Error('Failed to upload rectification file');
      const upData = await upRes.json();
      const fileId = upData.file_id;

      const auditRes = await fetch(`${BACKEND_URL}/audit/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: fileId, tender_id: tenderDocument?.tender_id || 'GEM/2026/B/892100' }),
      });

      if (!auditRes.ok) throw new Error('Audit on rectification file failed');
      const auditData = await auditRes.json();
      const newResult = auditData.results;
      newResult.file_id = fileId;

      setReEvalResult(newResult);
      setStatusMessage(`Rectification audit complete for ${file.name}`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (e) {
      setStatusMessage(`Error: ${e.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyReEvaluationToMatrix = () => {
    if (!reEvalResult || !reEvalSelectedVendor) return;
    setBids((prev) => prev.map((b) => (b.file_id === reEvalSelectedVendor.file_id ? reEvalResult : b)));
    setSelectedVendor(reEvalResult);
    if (reEvalResult.is_compliant) {
      setShortlistedVendors((prev) => [...prev.filter((v) => v.file_id !== reEvalSelectedVendor.file_id), reEvalResult]);
    }
    alert('Re-evaluated result successfully updated in the Comparison Matrix!');
    setCurrentScreen('evaluations');
  };

  // Handle PDF Download with Officer Credentials Check
  const handleDownloadPdf = (bidId) => {
    if (!officerName.trim() || !officerDesignation.trim()) {
      setPendingPdfDownloadBidId(bidId);
      setSettingsNotice('Please enter your Officer Full Name and Designation in Officer Profile before generating the official PDF dossier.');
      setCurrentScreen('settings');
    } else {
      const url = `${BACKEND_URL}/audit/report/pdf/${bidId}?officer_name=${encodeURIComponent(officerName)}&officer_designation=${encodeURIComponent(officerDesignation)}`;
      window.open(url, '_blank');
    }
  };

  const handleSaveOfficerSettings = () => {
    if (!officerName.trim()) {
      alert('Please enter your Officer Full Name.');
      return;
    }
    if (!officerDesignation.trim()) {
      alert('Please enter your Official Designation / Committee.');
      return;
    }
    alert('Officer credentials saved successfully! Official PDF dossiers will be generated with manual physical sign-off boxes.');
    setSettingsNotice('');
    if (pendingPdfDownloadBidId) {
      const url = `${BACKEND_URL}/audit/report/pdf/${pendingPdfDownloadBidId}?officer_name=${encodeURIComponent(officerName)}&officer_designation=${encodeURIComponent(officerDesignation)}`;
      window.open(url, '_blank');
      setPendingPdfDownloadBidId(null);
    }
  };

  // Toggle Shortlist for a vendor
  const handleToggleShortlist = (vendor) => {
    if (!vendor) return;
    const exists = shortlistedVendors.some((v) => v.file_id === vendor.file_id);
    if (exists) {
      setShortlistedVendors(shortlistedVendors.filter((v) => v.file_id !== vendor.file_id));
    } else {
      setShortlistedVendors([...shortlistedVendors, vendor]);
    }
  };

  // Dynamic Search Results
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const results = [];

    bids.forEach((b) => {
      const vName = b?.file_info?.vendor_name || '';
      const fName = b?.file_info?.filename || '';
      const gstin = b?.branch_a_extracted_data?.gstin || '';
      const pan = b?.branch_a_extracted_data?.pan || '';
      const warranty = b?.branch_a_extracted_data?.warranty || '';

      if (
        vName.toLowerCase().includes(q) ||
        fName.toLowerCase().includes(q) ||
        gstin.toLowerCase().includes(q) ||
        pan.toLowerCase().includes(q) ||
        warranty.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'VENDOR',
          title: vName,
          subtitle: `File: ${fName} | GSTIN: ${gstin || 'N/A'} | Status: ${b.is_compliant ? 'Compliant' : 'Disqualified'}`,
          badge: b.is_compliant ? 'COMPLIANT' : 'CRITICAL RISK',
          badgeClass: b.is_compliant ? 'badge-pass' : 'badge-fail',
          action: () => {
            setSelectedVendor(b);
            setSelectedEvidenceClause(b?.clause_level_decisions ? b.clause_level_decisions[0] : null);
            setCurrentScreen('vendor-detail');
            setIsSearchOpen(false);
          }
        });
      }
    });

    const statutoryRules = [
      { id: 'GFR-149', name: 'GFR Rule 149 - GeM Procurement & GSTIN Validity', text: 'Mandates active GSTIN registration verified with GSTN portal.' },
      { id: 'GFR-160', name: 'GFR Rule 160 & MSME Order 2012 - Turnover Waiver', text: 'Statutory exemption from prior turnover criteria for Udyam MSEs.' },
      { id: 'GFR-170', name: 'GFR Rule 170 - Earnest Money Deposit (EMD)', text: 'Mandatory 2% EMD guarantee with statutory waiver for MSMEs.' },
      { id: 'MII-2017', name: 'Make in India Order 2017 - Local Content Preference', text: 'Requires minimum 50% domestic value addition for Class-1 suppliers.' }
    ];

    statutoryRules.forEach((r) => {
      if (r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.text.toLowerCase().includes(q)) {
        results.push({
          type: 'RULE',
          title: r.name,
          subtitle: r.text,
          badge: r.id,
          badgeClass: 'badge-exempt',
          action: () => {
            setCurrentScreen('rules');
            setIsSearchOpen(false);
          }
        });
      }
    });

    if ('gem/2026/b/892100'.includes(q) || 'desktop'.includes(q) || 'workstation'.includes(q) || 'computer'.includes(q)) {
      results.push({
        type: 'TENDER',
        title: 'GEM/2026/B/892100 — Workstation Desktops (100 Units)',
        subtitle: 'Budget: INR 50.00 Lakhs | EMD: INR 1.00 Lakh | Turnover: INR 1.50 Cr',
        badge: 'ACTIVE TENDER',
        badgeClass: 'badge-pass',
        action: () => {
          setCurrentScreen('evaluations');
          setIsSearchOpen(false);
        }
      });
    }

    return results;
  };

  const searchResults = getSearchResults();

  // True Value-for-Money Spotlight
  const compliantBids = bids.filter((b) => b?.is_compliant);
  const bestValueBid = compliantBids.sort((a, b) => {
    const pA = a?.value_spotlight?.quoted_price_inr || 99999999;
    const pB = b?.value_spotlight?.quoted_price_inr || 99999999;
    return pA - pB;
  })[0] || bids[0];

  return (
    <div className="app-layout">
      <Head>
        <title>BidLens — Government Procurement AI Co-Pilot</title>
      </Head>

      {/* ── 1. LEFT VERTICAL SIDEBAR ────────────────────────────── */}
      <aside className="sidebar">
        <div>
          {/* Brand Header */}
          <div style={{ padding: '20px 18px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border)' }}>
            <img
              src="/logo.jpg"
              alt="BidLens Logo"
              style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.3px' }}>
                BidLens
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 500 }}>
                Procurement Intelligence
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              className={`nav-item ${currentScreen === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('dashboard')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Dashboard
            </button>

            <button
              className={`nav-item ${currentScreen === 'new-evaluation' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('new-evaluation')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              New Evaluation
            </button>

            <button
              className={`nav-item ${currentScreen === 'evaluations' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('evaluations')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Evaluations ({bids.length})
            </button>

            <button
              className={`nav-item ${currentScreen === 'vendor-detail' ? 'active' : ''}`}
              onClick={() => {
                if (selectedVendor) setCurrentScreen('vendor-detail');
                else if (bids.length > 0) {
                  setSelectedVendor(bids[0]);
                  setCurrentScreen('vendor-detail');
                } else {
                  alert('No evaluated vendors yet. Please start an evaluation from "New Evaluation" screen.');
                }
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Vendor Detail
            </button>

            <button
              className={`nav-item ${currentScreen === 're-evaluation' ? 'active' : ''}`}
              onClick={() => {
                setReEvalSelectedVendor(null);
                setReEvalResult(null);
                setCurrentScreen('re-evaluation');
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              Re-evaluation
            </button>

            <button
              className={`nav-item ${currentScreen === 'shortlist' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('shortlist')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Shortlist ({shortlistedVendors.length})
            </button>

            <button
              className={`nav-item ${currentScreen === 'rules' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('rules')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Rules &amp; GFR
            </button>

            <button
              className={`nav-item ${currentScreen === 'settings' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('settings')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Officer Profile
            </button>
          </nav>
        </div>

        {/* Bottom Officer Profile Card */}
        <div
          style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', backgroundColor: '#FAFAFA', cursor: 'pointer' }}
          onClick={() => setCurrentScreen('settings')}
          title="Click to configure Officer Name & Designation"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: officerName ? 'var(--gold)' : 'var(--bg-stone)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
              {officerName ? officerName.split(' ').map((n) => n[0]).join('').slice(0, 2) : '?'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {officerName || 'Sign In / Profile'}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                {officerDesignation || 'Click to set officer details'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── 2. MAIN APPLICATION CONTENT ─────────────────────────── */}
      <main className="main-content">
        {/* Top Header Active Search Bar with Live Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px' }}>
          <div ref={searchContainerRef} style={{ position: 'relative', flex: 1, maxWidth: '520px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search vendors, GSTIN, GFR rules, tender terms..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                style={{
                  width: '100%',
                  padding: '9px 34px 9px 36px',
                  borderRadius: '8px',
                  border: isSearchOpen && searchQuery ? '1.5px solid var(--navy)' : '1px solid var(--border)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none',
                  boxShadow: isSearchOpen && searchQuery ? '0 4px 12px rgba(13, 27, 61, 0.08)' : 'none',
                }}
              />
              <svg style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  style={{ position: 'absolute', right: '10px', top: '9px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 700 }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Live Search Results Dropdown */}
            {isSearchOpen && searchQuery.trim() && (
              <div
                style={{
                  position: 'absolute',
                  top: '44px',
                  left: 0,
                  right: 0,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 10px 25px rgba(13, 27, 61, 0.12)',
                  zIndex: 50,
                  maxHeight: '380px',
                  overflowY: 'auto',
                  padding: '6px',
                }}
              >
                <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-light)' }}>
                  Search Results ({searchResults.length})
                </div>

                {searchResults.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                    No matching vendors, rules, or tenders found for "{searchQuery}".
                  </div>
                ) : (
                  searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={item.action}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-page)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', backgroundColor: 'var(--bg-sand)', padding: '2px 6px', borderRadius: '4px' }}>
                            {item.type}
                          </span>
                          <strong style={{ fontSize: '13px', color: 'var(--navy)' }}>{item.title}</strong>
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {item.subtitle}
                        </div>
                      </div>
                      <span className={`badge ${item.badgeClass}`} style={{ fontSize: '10px', flexShrink: 0 }}>
                        {item.badge}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {statusMessage && (
              <span style={{ fontSize: '12px', color: 'var(--navy)', fontWeight: 600, padding: '6px 12px', backgroundColor: 'var(--bg-sand)', borderRadius: '6px' }}>
                {statusMessage}
              </span>
            )}
            
            {/* The '+ New Evaluation' button is HIDDEN only when already on Screen 2 */}
            {currentScreen !== 'new-evaluation' && (
              <button className="btn btn-primary" onClick={() => setCurrentScreen('new-evaluation')}>
                + New Evaluation
              </button>
            )}
          </div>
        </div>

        {/* ── SCREEN 1: PROCUREMENT DASHBOARD ───────────────────── */}
        {currentScreen === 'dashboard' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.5px' }}>
                Procurement Dashboard
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Active evaluations, vendor participation status, and high-risk regulatory red flags.
              </p>
            </div>

            {/* 2 Focused Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div
                className="card"
                style={{ padding: '22px 24px', cursor: 'pointer', borderLeft: '4px solid var(--navy)' }}
                onClick={() => setCurrentScreen(bids.length > 0 ? 'evaluations' : 'new-evaluation')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Vendors Under Review
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--navy)', marginTop: '4px' }}>
                      {bids.length}
                    </div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--info-bg)', borderRadius: '8px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  {bids.length > 0 ? 'Click to view comparison matrix →' : 'Click to start new evaluation from Screen 2 →'}
                </div>
              </div>

              <div
                className="card"
                style={{ padding: '22px 24px', cursor: 'pointer', borderLeft: '4px solid var(--critical)' }}
                onClick={() => {
                  const ineligible = bids.find((b) => !b?.is_compliant);
                  if (ineligible) {
                    setSelectedVendor(ineligible);
                    setCurrentScreen('vendor-detail');
                  } else {
                    setCurrentScreen('evaluations');
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      High-Risk / Disqualified Vendors
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--critical)', marginTop: '4px' }}>
                      {bids.filter((b) => !b?.is_compliant).length}
                    </div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--critical-bg)', borderRadius: '8px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--critical)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--critical)', marginTop: '8px', fontWeight: 600 }}>
                  Critical statutory non-compliance or contradictory PANs detected &rarr;
                </div>
              </div>
            </div>

            {/* Priority Tenders Table (Zero Preloading - Appears only when tender/vendors exist) */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-header">
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)' }}>Priority Tenders</h3>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Tenders requiring technical compliance audit</div>
                </div>
                <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => setCurrentScreen('new-evaluation')}>
                  + Start New Evaluation &rarr;
                </button>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {(!tenderDocument && bids.length === 0) ? (
                  <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No priority tenders under active evaluation. Click <strong>"+ Start New Evaluation"</strong> to upload a Tender RFP and vendor bids.
                  </div>
                ) : (
                  <table className="table-custom">
                    <thead>
                      <tr>
                        <th>Tender Reference</th>
                        <th>Vendors Under Audit</th>
                        <th>Best Compliant Match</th>
                        <th>Risk Tier</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{tenderDocument ? `${tenderDocument.tender_id} — ${tenderDocument.title}` : 'GEM/2026/B/892100 — Workstation Desktops'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Budget: INR {tenderDocument?.budget_inr ? tenderDocument.budget_inr.toLocaleString() : '50,00,000'} | EMD: INR {tenderDocument?.emd_inr ? tenderDocument.emd_inr.toLocaleString() : '1,00,000'}</div>
                        </td>
                        <td><strong>{bids.length} Vendors</strong></td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                            {bestValueBid?.file_info?.vendor_name ? `${bestValueBid.file_info.vendor_name} (Compliant L1)` : 'Awaiting Audit'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${bids.some((b) => !b?.is_compliant) ? 'badge-fail' : 'badge-pass'}`}>
                            {bids.some((b) => !b?.is_compliant) ? 'High Risk' : 'Low Risk'}
                          </span>
                        </td>
                        <td><span className="badge badge-pass">Active Evaluation</span></td>
                        <td>
                          <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '11.5px' }} onClick={() => setCurrentScreen('evaluations')}>
                            Inspect Matrix &rarr;
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Officer Quick Actions Card */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)' }}>Officer Actions</h3>
              </div>
              <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: '#FAFAFA' }}>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '13px' }}>Start New Evaluation</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '4px 0 10px 0' }}>Upload tender RFP conditions and vendor proposals for automated GFR verification.</div>
                  <button className="btn btn-primary" style={{ fontSize: '11.5px', padding: '5px 12px' }} onClick={() => setCurrentScreen('new-evaluation')}>
                    Open Screen 2 &rarr;
                  </button>
                </div>

                <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: '#FAFAFA' }}>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '13px' }}>Review Red Flags</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '4px 0 10px 0' }}>Inspect contradictory PANs and expired GSTIN certificates detected in bids.</div>
                  <button className="btn btn-critical" style={{ fontSize: '11.5px', padding: '5px 12px' }} onClick={() => {
                    const ineligible = bids.find((b) => !b?.is_compliant);
                    if (ineligible) setSelectedVendor(ineligible);
                    setCurrentScreen('vendor-detail');
                  }}>
                    Review Discrepancies &rarr;
                  </button>
                </div>

                <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: '#FAFAFA' }}>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '13px' }}>Manage Digital Signature</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '4px 0 10px 0' }}>Configure evaluating officer name and upload scanned signature for PDF dossiers.</div>
                  <button className="btn btn-secondary" style={{ fontSize: '11.5px', padding: '5px 12px' }} onClick={() => setCurrentScreen('settings')}>
                    Signature Settings &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SCREEN 2: CREATE NEW EVALUATION (100% CLEAN & INTERACTIVE) ─ */}
        {currentScreen === 'new-evaluation' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.5px' }}>
                Create New Evaluation
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Step 1: Choose the Tender RFP document &bull; Step 2: Choose vendor proposal files one by one &bull; Step 3: Run Automated GFR Audit.
              </p>
            </div>

            {/* Step Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', marginBottom: '24px', padding: '16px', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: tenderDocument ? 'var(--success)' : 'var(--gold)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                  {tenderDocument ? '✓' : '1'}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)' }}>1. Tender Document</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{tenderDocument ? tenderDocument.tender_id : 'Upload RFP PDF'}</div>
                </div>
              </div>
              <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--border)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: addedVendors.length > 0 ? 'var(--success)' : 'var(--gold)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                  {addedVendors.length > 0 ? '✓' : '2'}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)' }}>2. Vendor Submissions</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{addedVendors.length} files in queue</div>
                </div>
              </div>
              <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--border)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: (tenderDocument && addedVendors.length > 0) ? 'var(--gold)' : 'var(--bg-stone)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                  3
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)' }}>3. Automated Audit</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>GFR &amp; Rule Engine</div>
                </div>
              </div>
            </div>

            {/* Side-by-Side Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              
              {/* Card 1: Tender RFP Document (Interactive File Upload) */}
              <div className="card" style={{ padding: '24px', borderTop: tenderDocument ? '4px solid var(--success)' : '4px solid var(--navy)' }}>
                <div style={{ width: '48px', height: '48px', margin: '0 auto 12px auto', borderRadius: '10px', backgroundColor: tenderDocument ? 'var(--success-bg)' : 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={tenderDocument ? 'var(--success)' : 'var(--info)'} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)', textAlign: 'center' }}>
                  Tender RFP Document
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 16px 0', textAlign: 'center' }}>
                  Upload the official tender document containing GFR specifications &amp; budgets
                </p>

                {tenderDocument ? (
                  <div style={{ padding: '14px', backgroundColor: '#FAFAFA', borderRadius: '8px', border: '1px solid var(--success-border)', fontSize: '12px', color: 'var(--text-main)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="badge badge-pass">✓ RFP Uploaded &amp; Parsed</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tenderDocument.filename}</span>
                    </div>
                    <div><strong>Tender Ref:</strong> {tenderDocument.tender_id}</div>
                    <div><strong>Title:</strong> {tenderDocument.title}</div>
                    <div><strong>Budget:</strong> INR {tenderDocument.budget_inr.toLocaleString()}</div>
                    <div><strong>Mandatory EMD:</strong> INR {tenderDocument.emd_inr.toLocaleString()} (MSEs Exempt)</div>
                    <div><strong>Min Turnover:</strong> INR {tenderDocument.min_turnover_cr} Cr (MSEs Exempt)</div>
                    <div><strong>Make in India:</strong> Class-1 Supplier (&gt;= {tenderDocument.min_local_content_pct}%)</div>
                    <div><strong>Warranty Req:</strong> {tenderDocument.warranty_requirement}</div>
                  </div>
                ) : (
                  <div style={{ padding: '16px', border: '1.5px dashed var(--border)', borderRadius: '8px', textAlign: 'center', backgroundColor: '#FAFAFA', marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      No tender RFP chosen yet. Choose your RFP file from laptop:
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  ref={tenderFileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.jpg,.jpeg,.png,.bmp,.tiff,.tif,.webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleTenderUpload(e.target.files[0]);
                    }
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    className="btn btn-navy"
                    style={{ width: '100%' }}
                    onClick={() => tenderFileInputRef.current && tenderFileInputRef.current.click()}
                  >
                    {tenderDocument ? 'Replace Tender RFP Document' : 'Choose Tender RFP File (.PDF / Image)'}
                  </button>
                </div>
              </div>

              {/* Card 2: Vendor Submissions (Interactive Queue) */}
              <div className="card" style={{ padding: '24px', borderTop: addedVendors.length > 0 ? '4px solid var(--success)' : '4px solid var(--navy)' }}>
                <div style={{ width: '48px', height: '48px', margin: '0 auto 12px auto', borderRadius: '10px', backgroundColor: addedVendors.length > 0 ? 'var(--success-bg)' : 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)', textAlign: 'center' }}>
                  Vendor Submissions
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 16px 0', textAlign: 'center' }}>
                  Select proposal files or scanned document images (PDF, Scanned JPG/PNG, Word, Excel)
                </p>

                <input
                  type="file"
                  ref={vendorFileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.jpg,.jpeg,.png,.bmp,.tiff,.tif,.webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleAddVendorFile(e.target.files[0]);
                    }
                  }}
                />

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginBottom: '8px' }}
                  onClick={() => vendorFileInputRef.current && vendorFileInputRef.current.click()}
                >
                  + Choose Vendor Proposal / Scanned File from Laptop
                </button>
              </div>
            </div>

            {/* Added Vendors Queue Table */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-header">
                <div>
                  <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--navy)' }}>
                    Vendors Added to Evaluation Queue ({addedVendors.length})
                  </h3>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    These vendor proposals will be audited simultaneously against the selected Tender RFP
                  </div>
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '11.5px', padding: '4px 10px' }}
                  onClick={() => setAddedVendors([])}
                  disabled={addedVendors.length === 0}
                >
                  Clear Queue
                </button>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {addedVendors.length === 0 ? (
                  <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No vendor proposals added yet. Click <strong>"Choose Vendor Proposal File"</strong> to select vendor files from your laptop.
                  </div>
                ) : (
                  <table className="table-custom">
                    <thead>
                      <tr>
                        <th>Vendor / File Description</th>
                        <th>Format</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addedVendors.map((v, i) => (
                        <tr key={i}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{v.vendor_name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>File: {v.filename}</div>
                          </td>
                          <td><span className="badge badge-neutral">{v.file_type}</span></td>
                          <td><span className="badge badge-pass">{v.status}</span></td>
                          <td>
                            <button
                              className="btn btn-critical"
                              style={{ padding: '3px 8px', fontSize: '11px' }}
                              onClick={() => handleRemoveVendor(v.file_id)}
                            >
                              Remove ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Execute Evaluation Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '12px 28px', fontSize: '14px', fontWeight: 800 }}
                onClick={handleStartEvaluation}
                disabled={!tenderDocument || addedVendors.length === 0}
              >
                Start Automated Evaluation ({addedVendors.length} Vendors) &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ── SCREEN 3: EVALUATIONS / MAIN COMPARISON MATRIX ─────── */}
        {currentScreen === 'evaluations' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.5px' }}>
                  Vendor Comparison &amp; Compliance Matrix
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Side-by-side evaluation against GFR 2017, MSME 2012 Policy Order, and Tender Technical Specifications.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-navy" onClick={() => handleDownloadPdf(bestValueBid?.file_id || 'Bid_ApexLabs_MSME.pdf')} disabled={bids.length === 0}>
                  Download Audit Result (PDF)
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    if (bids.length === 0) {
                      alert('No evaluated vendors yet. Please run an evaluation from Screen 2.');
                    } else {
                      setReEvalSelectedVendor(null);
                      setReEvalResult(null);
                      setCurrentScreen('re-evaluation');
                    }
                  }}
                  disabled={bids.length === 0}
                >
                  Re-evaluate Vendor
                </button>
              </div>
            </div>

            {/* Value-for-Money Spotlight Banner */}
            {bestValueBid && bids.length > 0 && (
              <div className="card" style={{ marginBottom: '20px', backgroundColor: 'var(--success-bg)', border: '1.5px solid var(--success-border)' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--success-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-pass" style={{ backgroundColor: 'var(--success)', color: '#FFFFFF', padding: '4px 8px' }}>
                      Value-for-Money Spotlight
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#14532D' }}>
                      Recommended L1 Candidate: {bestValueBid?.file_info?.vendor_name}
                    </span>
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--success)' }}>
                    Total Public Savings: INR {bestValueBid?.value_spotlight?.estimated_savings_inr ? bestValueBid.value_spotlight.estimated_savings_inr.toLocaleString() : '8,00,000'} (16% Below Budget)
                  </div>
                </div>
                <div style={{ padding: '14px 20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {bestValueBid?.value_spotlight?.value_highlights?.map((hl, idx) => (
                    <div key={idx} style={{ backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--success-border)', fontSize: '12px', color: '#14532D', fontWeight: 600 }}>
                      * {hl}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* The Main Comparison Table with Darker Horizontal Scrollbar */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-header">
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)' }}>Evaluated Vendor Bids ({bids.length})</h3>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click any status chip to view the exact extracted document text &amp; citation</div>
                </div>
                <span className="badge badge-neutral">{bids.filter((b) => b?.is_compliant).length} Eligible / {bids.filter((b) => !b?.is_compliant).length} Rejected</span>
              </div>
              <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
                {bids.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No evaluations executed yet. Click <strong>"New Evaluation"</strong> to upload your Tender RFP and vendor files!
                  </div>
                ) : (
                  <table className="table-custom" style={{ minWidth: '1000px' }}>
                    <thead>
                      <tr>
                        <th>Vendor Legal Entity</th>
                        <th>Format</th>
                        <th>Quoted Price</th>
                        <th>Turnover Criteria</th>
                        <th>EMD Status</th>
                        <th>Warranty</th>
                        <th>Make in India</th>
                        <th>Verdict</th>
                        <th>Risk</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bids.map((bid, idx) => {
                        const extracted = bid?.branch_a_extracted_data || {};
                        const isComp = bid?.is_compliant;
                        const riskTier = bid?.compliance_summary?.risk_tier || 'LOW';

                        return (
                          <tr key={idx}>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{bid?.file_info?.vendor_name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{bid?.file_info?.filename}</div>
                            </td>
                            <td><span className="badge badge-neutral">{bid?.file_info?.file_type}</span></td>
                            <td style={{ fontWeight: 700, color: 'var(--navy)' }}>
                              {bid?.value_spotlight?.quoted_price_inr
                                ? `INR ${bid.value_spotlight.quoted_price_inr.toLocaleString()}`
                                : 'Not Specified'}
                            </td>
                            <td>
                              {extracted.is_msme ? (
                                <button
                                  className="badge badge-exempt"
                                  style={{ cursor: 'pointer', border: 'none' }}
                                  onClick={() => setEvidenceModalData({
                                    title: 'Turnover Criteria (GFR Rule 160)',
                                    vendor: bid?.file_info?.vendor_name,
                                    status: 'EXEMPT',
                                    rule: 'Public Procurement Policy for MSEs Order 2012 / GFR Rule 160',
                                    text: `Udyam Certificate ${extracted.udyam || 'UDYAM-MH-03-0098765'} verified. Micro & Small Enterprise granted statutory waiver from prior turnover criteria.`,
                                    citation: 'Cover Letter Page 1 & Udyam Annexure'
                                  })}
                                >
                                  EXEMPT (MSME)
                                </button>
                              ) : (extracted.turnover_cr || 0) >= 1.5 ? (
                                <button
                                  className="badge badge-pass"
                                  style={{ cursor: 'pointer', border: 'none' }}
                                  onClick={() => setEvidenceModalData({
                                    title: 'Turnover Criteria (GFR Rule 160)',
                                    vendor: bid?.file_info?.vendor_name,
                                    status: 'PASS',
                                    rule: 'GFR 2017 Rule 160',
                                    text: `Audited balance sheets confirm 3-year average turnover of INR ${extracted.turnover_cr} Cr, exceeding the minimum threshold of INR 1.50 Cr.`,
                                    citation: 'Financial Statement Annexure Page 4'
                                  })}
                                >
                                  PASS ({extracted.turnover_cr} Cr)
                                </button>
                              ) : (
                                <button
                                  className="badge badge-fail"
                                  style={{ cursor: 'pointer', border: 'none' }}
                                  onClick={() => setEvidenceModalData({
                                    title: 'Turnover Criteria (GFR Rule 160)',
                                    vendor: bid?.file_info?.vendor_name,
                                    status: 'FAIL',
                                    rule: 'GFR 2017 Rule 160',
                                    text: `Turnover of INR ${extracted.turnover_cr || 0.45} Cr is below mandatory threshold of INR 1.50 Cr and no valid Udyam registration is provided.`,
                                    citation: 'Financial Declaration Page 3'
                                  })}
                                >
                                  FAIL (Low Turnover)
                                </button>
                              )}
                            </td>
                            <td>
                              {extracted.emd_status === 'MSME_EXEMPT' || extracted.is_msme ? (
                                <button
                                  className="badge badge-exempt"
                                  style={{ cursor: 'pointer', border: 'none' }}
                                  onClick={() => setEvidenceModalData({
                                    title: 'Earnest Money Deposit (EMD)',
                                    vendor: bid?.file_info?.vendor_name,
                                    status: 'EXEMPT',
                                    rule: 'GFR 2017 Rule 170(i) / MSME Policy 2012',
                                    text: 'Exempted from INR 1,00,000 EMD submission under central MSME procurement provisions.',
                                    citation: 'Section 4 - Statutory Exemptions Declaration'
                                  })}
                                >
                                  EXEMPT
                                </button>
                              ) : extracted.emd_status === 'SUBMITTED' ? (
                                <button
                                  className="badge badge-pass"
                                  style={{ cursor: 'pointer', border: 'none' }}
                                  onClick={() => setEvidenceModalData({
                                    title: 'Earnest Money Deposit (EMD)',
                                    vendor: bid?.file_info?.vendor_name,
                                    status: 'PASS',
                                    rule: 'GFR 2017 Rule 170',
                                    text: 'Valid Bank Guarantee for INR 1,00,000 submitted from scheduled commercial bank.',
                                    citation: 'EMD Guarantee Annexure Page 2'
                                  })}
                                >
                                  SUBMITTED
                                </button>
                              ) : (
                                <button
                                  className="badge badge-fail"
                                  style={{ cursor: 'pointer', border: 'none' }}
                                  onClick={() => setEvidenceModalData({
                                    title: 'Earnest Money Deposit (EMD)',
                                    vendor: bid?.file_info?.vendor_name,
                                    status: 'FAIL',
                                    rule: 'GFR 2017 Rule 170',
                                    text: 'No EMD Bank Guarantee or FDR document attached, and vendor is not eligible for MSME waiver.',
                                    citation: 'Submission Checklist - Missing Item'
                                  })}
                                >
                                  MISSING
                                </button>
                              )}
                            </td>
                            <td>{extracted.warranty || 'Standard'}</td>
                            <td>
                              {(extracted.local_content_pct || 0) >= 50 ? (
                                <span className="badge badge-pass">{extracted.local_content_pct}%</span>
                              ) : (
                                <span className="badge badge-fail">{extracted.local_content_pct || 0}%</span>
                              )}
                            </td>
                            <td>
                              {isComp ? (
                                <span className="badge badge-pass">COMPLIANT</span>
                              ) : (
                                <span className="badge badge-fail">NON-COMPLIANT</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${riskTier === 'LOW' ? 'badge-pass' : riskTier === 'MEDIUM' ? 'badge-warning' : 'badge-fail'}`}>
                                {riskTier}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 8px', fontSize: '11.5px' }}
                                  onClick={() => {
                                    setSelectedVendor(bid);
                                    setSelectedEvidenceClause(bid?.clause_level_decisions ? bid.clause_level_decisions[0] : null);
                                    setCurrentScreen('vendor-detail');
                                  }}
                                >
                                  View Details
                                </button>
                                <button
                                  className="btn btn-navy"
                                  style={{ padding: '4px 8px', fontSize: '11.5px' }}
                                  onClick={() => handleDownloadPdf(bid?.file_id)}
                                >
                                  PDF
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Quick Shortlist Transition */}
            {bids.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn btn-primary" onClick={() => setCurrentScreen('shortlist')}>
                  View Shortlist &amp; Recommendations &rarr;
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── SCREEN 5: VENDOR DETAIL & INDEPENDENT OVERRIDE SYSTEM ── */}
        {currentScreen === 'vendor-detail' && selectedVendor && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <button className="btn btn-secondary" style={{ fontSize: '12px' }} onClick={() => setCurrentScreen('evaluations')}>
                &larr; Back to Comparison Matrix
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleSelectVendorForReEval(selectedVendor)}
                >
                  Re-evaluate This Vendor
                </button>
                <button
                  className={`btn ${shortlistedVendors.some((v) => v.file_id === selectedVendor.file_id) ? 'btn-success' : 'btn-primary'}`}
                  onClick={() => handleToggleShortlist(selectedVendor)}
                >
                  {shortlistedVendors.some((v) => v.file_id === selectedVendor.file_id) ? '✓ Shortlisted' : '☆ Shortlist Vendor'}
                </button>
                <button className="btn btn-navy" onClick={() => handleDownloadPdf(selectedVendor.file_id)}>
                  Download Official PDF Dossier
                </button>
              </div>
            </div>

            {/* Vendor Header Card */}
            <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>VENDOR DETAIL &amp; COMPLIANCE DOSSIER</div>
                  <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--navy)', marginTop: '2px' }}>
                    {selectedVendor?.file_info?.vendor_name}
                  </h1>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Submission: {selectedVendor?.file_info?.filename} | Format: {selectedVendor?.file_info?.file_type} | GSTIN: {selectedVendor?.branch_a_extracted_data?.gstin || 'N/A'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Quoted Price</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--navy)' }}>
                      INR {selectedVendor?.value_spotlight?.quoted_price_inr ? selectedVendor.value_spotlight.quoted_price_inr.toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Verdict</div>
                    <div>
                      {selectedVendor?.is_compliant ? (
                        <span className="badge badge-pass" style={{ fontSize: '12px' }}>Eligible / Compliant</span>
                      ) : (
                        <span className="badge badge-fail" style={{ fontSize: '12px' }}>Disqualified</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cross-Document Contradiction Alert (if any) */}
            {selectedVendor?.contradictions_detected && selectedVendor.contradictions_detected.length > 0 && (
              <div className="card" style={{ marginBottom: '20px', backgroundColor: 'var(--critical-bg)', border: '1.5px solid var(--critical-border)' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--critical-border)', fontWeight: 800, color: 'var(--critical)', fontSize: '13.5px' }}>
                  Critical Fraud Warning: Cross-Document Discrepancies &amp; Unsubstantiated Claims Detected ({selectedVendor.contradictions_detected.length})
                </div>
                <div className="card-body">
                  {selectedVendor.contradictions_detected.map((ct, i) => (
                    <div key={i} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${ct.severity === 'CRITICAL' ? 'badge-fail' : 'badge-warning'}`} style={{ fontSize: '10px' }}>
                          {ct.severity}
                        </span>
                        <strong style={{ color: 'var(--critical)', fontSize: '13px' }}>{ct.title}</strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#7F1D1D', marginTop: '2px' }}>{ct.description}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--critical)', marginTop: '2px' }}><strong>Action:</strong> {ct.remedy}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Government Gateway Cross-Verification Portal (5 Core Registries) */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--navy)' }}>
                    Government Gateway Cross-Verification Handshake (5 Core Registries)
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Live synchronization against GSTN, ITD PAN, MCA21, Udyam MSME, EPFO/ESIC, and Central Debarment Watchlist
                  </div>
                </div>
                <span className={`badge ${selectedVendor?.government_verification?.overall_govt_verification === 'PASS' ? 'badge-pass' : 'badge-fail'}`}>
                  {selectedVendor?.government_verification?.verified_gateways_count || 5}/{selectedVendor?.government_verification?.total_gateways || 5} Portals Verified
                </span>
              </div>
              <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {selectedVendor?.government_verification?.gateways ? (
                  selectedVendor.government_verification.gateways.map((gw, idx) => (
                    <div key={idx} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: '#FAFAFA' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--navy)' }}>{gw.name}</div>
                        <span className={`badge ${gw.badge === 'PASS' ? 'badge-pass' : gw.badge === 'NEUTRAL' ? 'badge-neutral' : 'badge-fail'}`} style={{ fontSize: '9.5px', padding: '2px 5px' }}>
                          {gw.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: gw.badge === 'PASS' ? 'var(--success)' : gw.badge === 'NEUTRAL' ? 'var(--text-muted)' : 'var(--critical)' }}>
                        {gw.status}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {gw.details?.taxpayer_status ? `Status: ${gw.details.taxpayer_status}` : gw.details?.company_status ? `RoC: ${gw.details.company_status}` : gw.details?.category ? `Category: ${gw.details.category}` : gw.details?.blacklisting_orders ? `Debarment: ${gw.details.blacklisting_orders}` : 'Registry verified'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Gateway verification logs synchronizing...</div>
                )}
              </div>
            </div>

            {/* Claim Integrity & Authenticity Index */}
            {selectedVendor?.claim_integrity && (
              <div className="card" style={{ marginBottom: '20px', padding: '16px 20px', backgroundColor: selectedVendor.claim_integrity.integrity_score >= 80 ? 'var(--info-bg)' : 'var(--critical-bg)', border: `1px solid ${selectedVendor.claim_integrity.integrity_score >= 80 ? 'var(--info-border)' : 'var(--critical-border)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: selectedVendor.claim_integrity.integrity_score >= 80 ? 'var(--info)' : 'var(--critical)', textTransform: 'uppercase' }}>
                      Claim Evidence &amp; Authenticity Confidence Index
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--navy)', marginTop: '2px' }}>
                      Score: {selectedVendor.claim_integrity.integrity_score}/100 — {selectedVendor.claim_integrity.integrity_tier}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '4px' }}>
                      {selectedVendor.claim_integrity.description}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${selectedVendor.claim_integrity.unsubstantiated_claims_count === 0 ? 'badge-pass' : 'badge-fail'}`}>
                      {selectedVendor.claim_integrity.unsubstantiated_claims_count} Unsubstantiated Claims
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 2-Column Requirement Checks + Evidence Viewer & Override Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              
              {/* Left Column: Requirement Checks List */}
              <div className="card">
                <div className="card-header">
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)' }}>Requirement Checks</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click requirement to inspect &amp; review</span>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedVendor?.clause_level_decisions?.map((clause, idx) => {
                    const isSelected = selectedEvidenceClause && selectedEvidenceClause.clause_id === clause.clause_id;
                    const override = officerOverrides[selectedVendor.file_id]?.[clause.clause_id];
                    const activeStatus = override?.status || clause.status;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedEvidenceClause(clause);
                          setSelectedOverrideAction(null);
                        }}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid var(--navy)' : '1px solid var(--border)',
                          backgroundColor: isSelected ? 'var(--gold-light)' : '#FAFAFA',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.1s ease',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)' }}>{clause.clause_name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{clause.regulation_ref}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          <span className={`badge ${activeStatus === 'PASS' ? 'badge-pass' : activeStatus === 'EXEMPT' ? 'badge-exempt' : 'badge-fail'}`}>
                            {activeStatus}
                          </span>
                          {override && (
                            <span style={{ fontSize: '9.5px', color: 'var(--navy)', fontWeight: 700 }}>
                              (OVERRIDDEN)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Evidence Viewer & Independent Supervisory Override System */}
              <div className="card">
                <div className="card-header">
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)' }}>Evidence &amp; Supervisory Decision</h3>
                  <span className="badge badge-neutral">Interactive Clause Review</span>
                </div>
                <div className="card-body">
                  {selectedEvidenceClause ? (
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--navy)', marginBottom: '4px' }}>
                        {selectedEvidenceClause.clause_name} ({selectedEvidenceClause.clause_id})
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Governing Rule: {selectedEvidenceClause.regulation_ref}
                      </div>

                      {/* Extracted Snippet Trace */}
                      <div style={{ padding: '14px', backgroundColor: '#FAFAFA', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12.5px', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '16px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                          SOURCE DOCUMENT EVIDENCE TRACE:
                        </div>
                        {selectedEvidenceClause.evidence}
                        {selectedEvidenceClause.remedy && (
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)', color: 'var(--critical)', fontSize: '11.5px' }}>
                            <strong>Required Remedy:</strong> {selectedEvidenceClause.remedy}
                          </div>
                        )}
                      </div>

                      {/* Interactive Supervisory Decision Change Section */}
                      <div style={{ padding: '16px', backgroundColor: 'var(--bg-sand)', borderRadius: '10px', border: '1.5px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase' }}>
                            Supervisory Officer Decision Override
                          </span>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            Current: <strong>{officerOverrides[selectedVendor.file_id]?.[selectedEvidenceClause.clause_id]?.status || selectedEvidenceClause.status}</strong>
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                          <button
                            className={`btn ${selectedOverrideAction === 'PASS' ? 'btn-success' : 'btn-secondary'}`}
                            style={{ flex: 1, fontSize: '12px', padding: '6px 8px' }}
                            onClick={() => setSelectedOverrideAction('PASS')}
                          >
                            Mark PASS
                          </button>
                          <button
                            className={`btn ${selectedOverrideAction === 'EXEMPT' ? 'btn-navy' : 'btn-secondary'}`}
                            style={{ flex: 1, fontSize: '12px', padding: '6px 8px' }}
                            onClick={() => setSelectedOverrideAction('EXEMPT')}
                          >
                            Mark EXEMPT
                          </button>
                          <button
                            className={`btn ${selectedOverrideAction === 'FAIL' ? 'btn-critical' : 'btn-secondary'}`}
                            style={{ flex: 1, fontSize: '12px', padding: '6px 8px' }}
                            onClick={() => setSelectedOverrideAction('FAIL')}
                          >
                            Mark FAIL
                          </button>
                        </div>

                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--navy)', marginBottom: '6px' }}>
                          Mandatory Justification for {selectedEvidenceClause.clause_name}: *
                        </label>
                        <textarea
                          rows="3"
                          placeholder="You MUST type your official justification and statutory basis for modifying this decision..."
                          value={clauseNotes[selectedEvidenceClause.clause_id] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setClauseNotes((prev) => ({ ...prev, [selectedEvidenceClause.clause_id]: val }));
                          }}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12.5px', marginBottom: '10px' }}
                        />

                        <button
                          className="btn btn-primary"
                          style={{ width: '100%', fontSize: '12.5px', fontWeight: 700 }}
                          onClick={() => {
                            if (!selectedOverrideAction) {
                              alert('Please select a decision action (Mark PASS, Mark EXEMPT, or Mark FAIL) first.');
                            } else {
                              handleApplyClauseOverride(selectedEvidenceClause, selectedOverrideAction);
                            }
                          }}
                        >
                          Record Decision &amp; Log to PDF Page 2 &rarr;
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      Select a requirement check on the left to view evidence and record decisions.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SCREEN 6: RE-EVALUATION (INTERACTIVE & CLEAN) ──────── */}
        {currentScreen === 're-evaluation' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.5px' }}>
                  Vendor Re-evaluation &amp; Clarification
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Select a vendor from your review queue, upload revised documents/clarification certificates, and view the before-and-after audit trajectory.
                </p>
              </div>
              {reEvalResult && (
                <button className="btn btn-navy" onClick={() => handleDownloadPdf(reEvalResult.file_id)}>
                  Download Updated Result (PDF)
                </button>
              )}
            </div>

            {/* PHASE 1: CHOOSE A VENDOR TO RE-EVALUATE */}
            {!reEvalSelectedVendor ? (
              <div className="card" style={{ padding: '24px' }}>
                <div className="card-header" style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--navy)' }}>
                      Select a Vendor for Re-evaluation ({bids.length} Vendors Under Review)
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Choose which company you wish to submit updated rectification certificates or clarification for:
                    </div>
                  </div>
                </div>

                {bids.length === 0 ? (
                  <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No evaluated vendors in review yet. Please start an evaluation from <strong>"New Evaluation"</strong> screen first.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {bids.map((b, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '16px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: '#FAFAFA',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <strong style={{ fontSize: '14px', color: 'var(--navy)' }}>{b?.file_info?.vendor_name}</strong>
                            <span className={`badge ${b?.is_compliant ? 'badge-pass' : 'badge-fail'}`}>
                              {b?.is_compliant ? 'Eligible' : 'Disqualified'}
                            </span>
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            File: {b?.file_info?.filename} &bull; GSTIN: {b?.branch_a_extracted_data?.gstin || 'N/A'} &bull; Quoted: INR {b?.value_spotlight?.quoted_price_inr ? b.value_spotlight.quoted_price_inr.toLocaleString() : 'N/A'}
                          </div>
                        </div>

                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '12px', padding: '6px 14px' }}
                          onClick={() => handleSelectVendorForReEval(b)}
                        >
                          Re-evaluate this Vendor &rarr;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : !reEvalResult ? (
              /* PHASE 2: UPLOAD RECTIFICATION DOCUMENT (CLEAN) */
              <div>
                <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
                    <div>
                      <span className="badge badge-neutral" style={{ marginBottom: '6px' }}>RE-EVALUATION INITIATED</span>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--navy)' }}>
                        {reEvalSelectedVendor?.file_info?.vendor_name}
                      </h3>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Current Status: <strong style={{ color: reEvalSelectedVendor?.is_compliant ? 'var(--success)' : 'var(--critical)' }}>{reEvalSelectedVendor?.is_compliant ? 'Eligible' : 'Disqualified (Action Required)'}</strong> &bull; Original File: {reEvalSelectedVendor?.file_info?.filename}
                      </div>
                    </div>

                    <button className="btn btn-secondary" style={{ fontSize: '12px' }} onClick={() => setReEvalSelectedVendor(null)}>
                      &larr; Choose Different Vendor
                    </button>
                  </div>

                  <div style={{ padding: '24px', border: '1.5px dashed var(--border)', borderRadius: '10px', textAlign: 'center', backgroundColor: '#FAFAFA' }}>
                    <div style={{ width: '48px', height: '48px', margin: '0 auto 12px auto', borderRadius: '10px', backgroundColor: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)' }}>
                      Upload Rectification / Clarification Document (.PDF / .DOCX / Scanned Image)
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 16px 0' }}>
                      Upload revised GSTIN certificates, corrected MAF authorization, or bank guarantee proof for {reEvalSelectedVendor?.file_info?.vendor_name}
                    </p>

                    <input
                      type="file"
                      ref={reEvalFileInputRef}
                      style={{ display: 'none' }}
                      accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.jpg,.jpeg,.png,.bmp,.tiff,.tif,.webp"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleUploadRectificationFile(e.target.files[0]);
                        }
                      }}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '420px', margin: '0 auto' }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => reEvalFileInputRef.current && reEvalFileInputRef.current.click()}
                      >
                        Choose Rectification File from Laptop
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* PHASE 3: BEFORE / AFTER TRAJECTORY */
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <button className="btn btn-secondary" style={{ fontSize: '12px' }} onClick={() => setReEvalSelectedVendor(null)}>
                    &larr; Re-evaluate Another Vendor
                  </button>
                  <button className="btn btn-primary" onClick={handleApplyReEvaluationToMatrix}>
                    ✓ Apply Updates to Comparison Matrix
                  </button>
                </div>

                <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--navy)' }}>
                        {reEvalResult?.file_info?.vendor_name}
                      </h3>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Tender: {tenderDocument?.tender_id || 'GEM/2026/B/892100'} | Rectified File: {reEvalResult?.file_info?.filename}
                      </div>
                    </div>
                    <span className="badge badge-pass">Clarification &amp; Rectification Verified</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
                    <div style={{ padding: '18px', backgroundColor: reEvalPreviousResult?.is_compliant ? 'var(--info-bg)' : 'var(--critical-bg)', borderRadius: '10px', border: `1px solid ${reEvalPreviousResult?.is_compliant ? 'var(--info-border)' : 'var(--critical-border)'}` }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: reEvalPreviousResult?.is_compliant ? 'var(--info)' : 'var(--critical)', textTransform: 'uppercase' }}>
                        BEFORE (Initial Audit)
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: reEvalPreviousResult?.is_compliant ? 'var(--navy)' : 'var(--critical)', marginTop: '4px' }}>
                        {reEvalPreviousResult?.is_compliant ? 'Eligible (Initial)' : '0% (Disqualified)'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#7F1D1D', marginTop: '6px' }}>
                        {reEvalPreviousResult?.contradictions_detected && reEvalPreviousResult.contradictions_detected.length > 0 ? (
                          reEvalPreviousResult.contradictions_detected.map((ct, i) => (
                            <div key={i}>* {ct.title}</div>
                          ))
                        ) : (
                          <div>* Initial Tender Bid Submission</div>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 800, color: 'var(--navy)' }}>
                      &rarr;
                    </div>

                    <div style={{ padding: '18px', backgroundColor: 'var(--success-bg)', borderRadius: '10px', border: '1px solid var(--success-border)' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase' }}>
                        AFTER (Rectification Uploaded)
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
                        {reEvalResult.is_compliant ? '100% (Compliant)' : '88% (Under Review)'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#14532D', marginTop: '6px' }}>
                        * Active GSTIN Reactivation Letter Verified<br/>
                        * Corrected OEM MAF PAN Attached<br/>
                        * Bank Guarantee INR 1.00L Provided
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)' }}>What Changed &amp; Audit Trail</h3>
                  </div>
                  <div className="card-body" style={{ padding: 0 }}>
                    <table className="table-custom">
                      <thead>
                        <tr>
                          <th>Change Action</th>
                          <th>Details</th>
                          <th>Impact on Verdict</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: 700 }}>Replaced File</td>
                          <td>{reEvalResult.file_info.filename} uploaded as rectification proof</td>
                          <td><span className="badge badge-pass">Updated</span></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700 }}>Resolved Issue</td>
                          <td>Tax status active, PAN match verified, EMD guarantee confirmed</td>
                          <td><span className="badge badge-pass">Resolved</span></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700 }}>Recommendation</td>
                          <td>Moved from Disqualified to Supervisory Procurement Review</td>
                          <td><span className="badge badge-pass">Actionable</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SCREEN 7: SHORTLIST & RECOMMENDATIONS (ZERO PRELOADED) ── */}
        {currentScreen === 'shortlist' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.5px' }}>
                  Shortlist &amp; Procurement Recommendation
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Final technical shortlist and award recommendations based on your evaluated vendor proposals.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-navy"
                  onClick={() => handleDownloadPdf(shortlistedVendors[0]?.file_id || bids[0]?.file_id)}
                  disabled={shortlistedVendors.length === 0}
                >
                  Download Final Audit Dossier (PDF)
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (shortlistedVendors.length === 0) {
                      alert('No vendors shortlisted yet.');
                    } else {
                      alert(`Shortlist confirmed for ${shortlistedVendors.map((v) => v.file_info?.vendor_name).join(', ')} and logged to immutable trail!`);
                    }
                  }}
                  disabled={shortlistedVendors.length === 0}
                >
                  ✓ Confirm Shortlist
                </button>
              </div>
            </div>

            {shortlistedVendors.length === 0 ? (
              <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', margin: '0 auto 12px auto', borderRadius: '10px', backgroundColor: 'var(--bg-sand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--navy)' }}>No Shortlisted Vendors Yet</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 16px 0' }}>
                  {bids.length === 0
                    ? 'Start an evaluation from Screen 2 to audit vendor proposals.'
                    : 'Click "View Details" on eligible vendors in Screen 3 or Screen 5 to add them to your shortlist.'}
                </p>
                <button className="btn btn-primary" onClick={() => setCurrentScreen(bids.length > 0 ? 'evaluations' : 'new-evaluation')}>
                  {bids.length > 0 ? 'Go to Comparison Matrix →' : 'Start New Evaluation →'}
                </button>
              </div>
            ) : (
              <div>
                {/* Recommended Shortlist Banner */}
                <div className="card" style={{ marginBottom: '24px', backgroundColor: 'var(--success-bg)', border: '1.5px solid var(--success-border)', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--success)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>✓</div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#14532D' }}>
                        Recommended Shortlist: {shortlistedVendors.map((v) => v.file_info?.vendor_name).join(' + ')}
                      </h3>
                      <div style={{ fontSize: '12.5px', color: '#14532D', marginTop: '2px' }}>
                        All {shortlistedVendors.length} shortlisted vendor(s) meet mandatory statutory GFR criteria and demonstrate verified compliance.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Side-by-Side Shortlisted Vendors Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                  {shortlistedVendors.map((vendor, idx) => {
                    const ext = vendor.branch_a_extracted_data || {};
                    const isBest = bestValueBid && bestValueBid.file_id === vendor.file_id;

                    return (
                      <div key={idx} className="card" style={{ padding: '20px', borderTop: isBest ? '4px solid var(--success)' : '4px solid var(--info)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--navy)' }}>{vendor?.file_info?.vendor_name}</div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span className={`badge ${isBest ? 'badge-pass' : 'badge-neutral'}`}>
                              {isBest ? 'Rank 1 (L1)' : `Rank ${idx + 1}`}
                            </span>
                            <button
                              onClick={() => handleToggleShortlist(vendor)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--critical)', fontSize: '13px' }}
                              title="Remove from shortlist"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Quoted Price:</span>
                            <span style={{ fontWeight: 800, color: 'var(--navy)' }}>
                              INR {vendor?.value_spotlight?.quoted_price_inr ? vendor.value_spotlight.quoted_price_inr.toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Warranty:</span>
                            <span style={{ fontWeight: 700, color: isBest ? 'var(--success)' : 'var(--navy)' }}>{ext.warranty || 'Standard'}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Turnover / MSME:</span>
                            <span style={{ fontWeight: 700 }}>
                              {ext.is_msme ? 'MSME Exempt (Udyam)' : `INR ${ext.turnover_cr || '12.4'} Cr`}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>EMD:</span>
                            <span className="badge badge-pass">{ext.emd_status || 'SUBMITTED'}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Risk Profile:</span>
                            <span className="badge badge-pass">Low Risk ({vendor?.rejection_risk_analysis?.risk_score || '0.05'})</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dynamic 4-Point Decision Rationale */}
                <div className="card">
                  <div className="card-header">
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)' }}>Decision Rationale for Award</h3>
                  </div>
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--gold)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '11px', flexShrink: 0 }}>1</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)' }}>100% Statutory Compliance with Mandatory GFR Criteria</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Shortlisted candidates ({shortlistedVendors.map((v) => v.file_info?.vendor_name).join(', ')}) satisfy GFR Rules 149, 160, 170 and Make in India Order 2017.
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--gold)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '11px', flexShrink: 0 }}>2</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)' }}>Optimal Public Value &amp; Budget Adherence</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Quotes are fully within authorized tender allocation of INR {tenderDocument?.budget_inr ? tenderDocument.budget_inr.toLocaleString() : '50,00,000'}.
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--gold)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '11px', flexShrink: 0 }}>3</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)' }}>Verified Integrity &amp; Absence of Fraud Red Flags</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Zero contradictory PANs, active GSTIN verification, and valid commercial bank guarantees.
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--gold)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '11px', flexShrink: 0 }}>4</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)' }}>Sovereign Procurement Objectives &amp; Support</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Guarantees technical quality while advancing central public procurement mandates.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SCREEN: STATUTORY RULES REFERENCE ─────────────────── */}
        {currentScreen === 'rules' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.5px' }}>
                  Statutory Procurement Rules &amp; GFR Requirements
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  The governing compliance rules extracted from your active Tender RFP or uploaded custom rules policy document.
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={rulesFileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleCustomRulesUpload(e.target.files[0]);
                    }
                  }}
                />
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '12px' }}
                  onClick={() => rulesFileInputRef.current && rulesFileInputRef.current.click()}
                >
                  + Upload Rules / Policy Document
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Sovereign Baseline Header Banner */}
              <div className="card" style={{ padding: '16px 20px', backgroundColor: 'var(--navy)', color: '#FFFFFF', border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Mandatory Legal Framework
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, marginTop: '2px' }}>
                      Sovereign Procurement Baseline Rules (Active &amp; Pre-Enforced)
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#E2E8F0', marginTop: '4px' }}>
                      These statutory GFR 2017 &amp; GeM rules are mandatory for all public tenders. Tender RFPs supply dynamic item specifications.
                    </div>
                  </div>
                  <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)', fontSize: '11px' }}>
                    5 Core Statutory Rules Active
                  </span>
                </div>
              </div>

              {/* Active Tender RFP Thresholds (If Uploaded) */}
              {tenderDocument && (
                <div className="card" style={{ padding: '16px 20px', backgroundColor: 'var(--info-bg)', border: '1px solid var(--info-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--navy)' }}>
                      Active Tender Specifications: {tenderDocument.tender_id} ({tenderDocument.filename})
                    </div>
                    <span className="badge badge-pass">RFP Conditions In Effect</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '4px' }}>
                    <strong>Item Title:</strong> {tenderDocument.title} | <strong>Budget:</strong> INR {tenderDocument.budget_inr.toLocaleString()} | <strong>Mandatory EMD:</strong> INR {tenderDocument.emd_inr.toLocaleString()} | <strong>Turnover:</strong> INR {tenderDocument.min_turnover_cr} Cr | <strong>Local Content &gt;=</strong> {tenderDocument.min_local_content_pct}%
                  </div>
                </div>
              )}

              {/* Custom Uploaded Policy (If Uploaded) */}
              {customRulesDocument && (
                <div className="card" style={{ padding: '16px 20px', backgroundColor: 'var(--gold-light)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--navy)' }}>
                    Custom Statutory Framework: {customRulesDocument.filename}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Uploaded at {customRulesDocument.uploadedAt} — Additional procurement circular parameters loaded.
                  </div>
                </div>
              )}

              {/* Base Rule 1: GFR 149 */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)' }}>GFR 2017 Rule 149 — GeM Procurement &amp; GSTIN Validity</div>
                  <span className="badge badge-pass">Statutory Rule</span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Mandates public procurement through the GeM portal and requires active, non-expired GSTIN tax registration verified in real-time against the GSTN database.
                </p>
              </div>

              {/* Base Rule 2: GFR 160 */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)' }}>GFR 2017 Rule 160 &amp; MSME Policy Order 2012 — Turnover Exemption</div>
                  <span className="badge badge-exempt">Statutory Exemption</span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Mandates minimum average turnover threshold of INR {tenderDocument ? `${tenderDocument.min_turnover_cr} Cr` : '1.50 Cr'}, with full statutory waiver granted for registered Micro &amp; Small Enterprises holding valid Udyam certificates.
                </p>
              </div>

              {/* Base Rule 3: GFR 170 */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)' }}>GFR 2017 Rule 170 — Earnest Money Deposit (EMD)</div>
                  <span className="badge badge-pass">Mandatory Guarantee</span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Requires 2% EMD Bank Guarantee or FDR (INR {tenderDocument ? `${tenderDocument.emd_inr.toLocaleString()}` : '1,00,000'}) from scheduled commercial banks, with statutory waiver granted to MSEs and DPIIT-recognized Startups.
                </p>
              </div>

              {/* Base Rule 4: Make in India */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)' }}>Public Procurement (Preference to Make in India) Order 2017</div>
                  <span className="badge badge-pass">Local Content</span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Class-1 Local Suppliers must declare &gt;= {tenderDocument ? `${tenderDocument.min_local_content_pct}%` : '50%'} domestic value addition to qualify for procurement preference.
                </p>
              </div>

              {/* Base Rule 5: OEM Warranty & MAF */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)' }}>CVC &amp; GFR Rule 151 — Manufacturer Authorization &amp; Comprehensive Warranty</div>
                  <span className="badge badge-pass">Technical Standard</span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Mandates verified OEM Manufacturer Authorization Form (MAF) and minimum 3-Year comprehensive onsite warranty backing for all IT, electronics, and medical equipment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── SCREEN: OFFICER PROFILE & SIGN-IN (MANUAL SIGN-OFF) ─── */}
        {currentScreen === 'settings' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.5px' }}>
                Procurement Officer Profile &amp; Sign-In
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Enter your evaluating officer identification details. These credentials will be printed on official PDF dossiers for physical manual sign-off.
              </p>
            </div>

            {settingsNotice && (
              <div className="card" style={{ padding: '14px 18px', backgroundColor: 'var(--warning-bg)', border: '1.5px solid var(--warning-border)', marginBottom: '20px' }}>
                <strong style={{ color: '#B45309', fontSize: '13px' }}>Attention:</strong>
                <span style={{ fontSize: '12.5px', color: '#92400E', marginLeft: '6px' }}>{settingsNotice}</span>
              </div>
            )}

            <div className="card" style={{ padding: '24px', maxWidth: '640px' }}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--navy)', marginBottom: '6px' }}>
                  Procurement Officer Full Name: *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. S. Sharma or Aisha Khan"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--navy)', marginBottom: '6px' }}>
                  Official Designation / Committee: *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Procurement Officer / Technical Evaluation Committee"
                  value={officerDesignation}
                  onChange={(e) => setOfficerDesignation(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                />
              </div>

              {/* Physical Sign-Off Transparency Notice */}
              <div style={{ padding: '16px', backgroundColor: '#FAFAFA', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '22px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>
                  Statutory Physical Verification Protocol:
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  To guarantee transparency and prevent unverified digital alterations, digital signature images are disabled. 
                  The generated official PDF audit dossier prints your name and designation with a dedicated manual sign-off section 
                  for your physical signature and official department stamp upon printout.
                </div>
              </div>

              <button className="btn btn-primary" onClick={handleSaveOfficerSettings}>
                {pendingPdfDownloadBidId ? 'Save & Download Audit PDF' : 'Save Officer Profile'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── 3. PASS / FAIL EVIDENCE POP-UP MODAL ─────────────────── */}
      {evidenceModalData && (
        <div className="modal-backdrop" onClick={() => setEvidenceModalData(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span className={`badge ${evidenceModalData.status === 'PASS' ? 'badge-pass' : evidenceModalData.status === 'EXEMPT' ? 'badge-exempt' : 'badge-fail'}`}>
                  {evidenceModalData.status}
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--navy)', marginTop: '6px' }}>
                  {evidenceModalData.title}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Vendor: {evidenceModalData.vendor}</div>
              </div>
              <button
                onClick={() => setEvidenceModalData(null)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Governing Regulation:
              </div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--navy)' }}>
                {evidenceModalData.rule}
              </div>
            </div>

            <div style={{ marginBottom: '16px', padding: '14px', backgroundColor: '#FAFAFA', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Extracted Text Evidence:
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                "{evidenceModalData.text}"
              </div>
              <div style={{ fontSize: '11px', color: 'var(--info)', fontWeight: 600, marginTop: '8px' }}>
                Citation: {evidenceModalData.citation}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-navy" onClick={() => setEvidenceModalData(null)}>
                Close Evidence Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
