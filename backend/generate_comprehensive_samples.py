"""
Enhanced generator for official, comprehensive, multi-page (8-15 pages) GeM Tender RFPs
and realistic Vendor Bid Proposals for BidLens AI.
"""
import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAMPLE_DIR = os.path.join(BASE_DIR, "..", "data", "sample_bids")
os.makedirs(SAMPLE_DIR, exist_ok=True)


class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#1A202C"))
        self.drawString(40, 755, getattr(self, '_doc_header', "GOVERNMENT OF INDIA - GeM BID PORTAL"))
        self.setFont("Helvetica", 8)
        self.drawRightString(572, 755, "OFFICIAL PROCUREMENT DOCUMENTATION")
        self.setStrokeColor(colors.HexColor("#CBD5E0"))
        self.setLineWidth(0.75)
        self.line(40, 748, 572, 748)

        self.line(40, 36, 572, 36)
        self.setFont("Helvetica", 7.5)
        self.drawString(40, 26, "GeM Procurement Standard Specification | Statutory Compliance Certified")
        self.drawRightString(572, 26, f"Page {self._pageNumber} of {total_pages}")
        self.restoreState()


def get_styles():
    styles = getSampleStyleSheet()
    h1 = ParagraphStyle('DocH1', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=13, leading=16, textColor=colors.HexColor("#0D1B3D"), spaceAfter=5)
    h2 = ParagraphStyle('DocH2', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10.5, leading=13.5, textColor=colors.HexColor("#0D1B3D"), spaceBefore=8, spaceAfter=3)
    h3 = ParagraphStyle('DocH3', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=colors.HexColor("#1A202C"), spaceBefore=5, spaceAfter=2)
    body = ParagraphStyle('DocBody', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11, textColor=colors.HexColor("#2D3748"))
    body_bold = ParagraphStyle('DocBodyBold', parent=body, fontName='Helvetica-Bold')
    callout = ParagraphStyle('DocCallout', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=10.5, textColor=colors.HexColor("#1A202C"))
    return styles, h1, h2, h3, body, body_bold, callout


# ─── 1. TENDER RFP (12 Pages) ───────────────────────────────────────────────────
def build_tender_rfp():
    filepath = os.path.join(SAMPLE_DIR, "Tender_RFP_GeM_Computers.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=48, bottomMargin=48)
    _, h1, h2, h3, body, body_bold, callout = get_styles()
    story = []

    # Page 1: NIT Overview
    story.append(Paragraph("GOVERNMENT OF INDIA — GOVERNMENT E-MARKETPLACE (GeM)", h1))
    story.append(Paragraph("NOTICE INVITING TENDER (NIT) & BID DOCUMENT", h2))
    story.append(Paragraph("<b>Bid Reference Number:</b> GEM/2026/B/892100 | <b>Dated:</b> 15-January-2026", body_bold))
    story.append(Paragraph("<b>Procuring Entity:</b> Ministry of Petroleum & Natural Gas / CPCL Directorate", body))
    story.append(Spacer(1, 6))

    nit_table = [
        [Paragraph("<b>Item Description:</b>", body_bold), Paragraph("Supply, Installation, and Commissioning of Desktop Workstations (Quantity: 100 Units)", body)],
        [Paragraph("<b>Estimated Tender Value (Budget):</b>", body_bold), Paragraph("INR 50,00,000 (Fifty Lakh Rupees Only)", body_bold)],
        [Paragraph("<b>Mandatory Earnest Money Deposit (EMD):</b>", body_bold), Paragraph("INR 1,00,000 (One Lakh Rupees) — <i>Statutory Exemption for MSEs & Startups</i>", body)],
        [Paragraph("<b>Minimum Average Annual Turnover:</b>", body_bold), Paragraph("INR 1.50 Crore (Last 3 Audited Financial Years) — <i>Statutory Exemption for MSEs</i>", body)],
        [Paragraph("<b>Make in India (MII) Preference:</b>", body_bold), Paragraph("Class-1 Local Supplier (Minimum 50% Domestic Value Addition Required)", body_bold)],
        [Paragraph("<b>Comprehensive Warranty SLA:</b>", body_bold), Paragraph("3-Year Comprehensive Onsite 24x7 OEM Warranty with 4-hr MTTR Response", body_bold)],
        [Paragraph("<b>Consignee Delivery Location:</b>", body_bold), Paragraph("CPCL Central IT Complex, Chennai & Regional Data Centers", body)],
        [Paragraph("<b>Delivery Timeline:</b>", body_bold), Paragraph("30 Calendar Days from Notification of Award (NOA)", body)]
    ]
    t = Table(nit_table, colWidths=[2.6*inch, 4.7*inch])
    t.setStyle(TableStyle([('BOX', (0,0), (-1,-1), 1, colors.HexColor("#0D1B3D")), ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")), ('TOPPADDING', (0,0), (-1,-1), 3), ('BOTTOMPADDING', (0,0), (-1,-1), 3)]))
    story.append(t)
    story.append(PageBreak())

    # Page 2: Detailed Technical Specifications
    story.append(Paragraph("SECTION I: DETAILED TECHNICAL SPECIFICATIONS & STANDARDS", h1))
    story.append(Paragraph("The required desktop computing systems must strictly adhere to the following technical benchmarks:", body))
    story.append(Spacer(1, 4))

    specs_data = [
        [Paragraph("<b>Subsystem</b>", body_bold), Paragraph("<b>Mandatory Technical Specification Benchmark</b>", body_bold)],
        [Paragraph("Central Processor (CPU)", body), Paragraph("Intel Core i7 13th Generation (16 Cores, 24 Threads, up to 5.4 GHz, 30MB Cache)", body)],
        [Paragraph("System Memory (RAM)", body), Paragraph("Minimum 16GB DDR5 5600 MHz SDRAM Dual-Channel (Expandable to 64GB)", body)],
        [Paragraph("Primary Storage Drive", body), Paragraph("1TB M.2 NVMe PCIe Gen 4 Solid State Drive (Read speed >= 6000 MB/s)", body)],
        [Paragraph("Display Unit", body), Paragraph("27-Inch 4K UHD (3840x2160) IPS LED Backlit Monitor with Height-Adjustable Stand", body)],
        [Paragraph("Graphics Subsystem", body), Paragraph("Integrated Intel UHD Graphics 770 or Dedicated 4GB GPU", body)],
        [Paragraph("Operating System", body), Paragraph("Pre-loaded Microsoft Windows 11 Professional 64-bit with Genuine Digital License", body)],
        [Paragraph("Networking & I/O", body), Paragraph("Integrated Gigabit Ethernet (10/100/1000) + Intel Wi-Fi 6E AX211 + Bluetooth 5.3", body)],
        [Paragraph("Security Features", body), Paragraph("Hardware TPM 2.0 Chip Enabled, BIOS Password Protection, Kensington Lock Slot", body)],
        [Paragraph("Power Supply & Green Standards", body), Paragraph("300W 80 PLUS Platinum Certified Internal Power Supply, Energy Star 8.0, EPEAT Gold", body)]
    ]
    t_specs = Table(specs_data, colWidths=[2.1*inch, 5.2*inch])
    t_specs.setStyle(TableStyle([('BOX', (0,0), (-1,-1), 1, colors.black), ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black), ('LINEBELOW', (0,0), (-1,0), 1.2, colors.black), ('TOPPADDING', (0,0), (-1,-1), 2.5), ('BOTTOMPADDING', (0,0), (-1,-1), 2.5)]))
    story.append(t_specs)
    story.append(PageBreak())

    # Page 3: Statutory Eligibility & GFR 2017 Rules
    story.append(Paragraph("SECTION II: STATUTORY ELIGIBILITY & GFR 2017 PROVISIONS", h1))
    story.append(Paragraph("1. Compliance with GFR 2017 Rule 149 (Mandatory GeM Procurement & Tax Validity)", h2))
    story.append(Paragraph("All procurement on GeM is governed by GFR 2017 Rule 149. The bidder must possess a valid, active GSTIN registration under the Goods and Services Tax Act. Bids associated with suspended, expired, or cancelled GSTINs shall be disqualified automatically.", body))
    story.append(Spacer(1, 4))
    story.append(Paragraph("2. Compliance with GFR 2017 Rule 160 & MSME Order 2012 (Turnover Threshold & MSE Waivers)", h2))
    story.append(Paragraph("The bidder must demonstrate an average annual financial turnover of at least INR 1.50 Crore during the last 3 audited financial years. <b>Statutory MSME Waiver:</b> In accordance with the Public Procurement Policy for MSEs Order 2012, Micro and Small Enterprises holding a valid Udyam Registration Certificate are 100% EXEMPT from prior turnover and experience criteria.", body))
    story.append(Spacer(1, 4))
    story.append(Paragraph("3. Compliance with GFR 2017 Rule 170 (Earnest Money Deposit - EMD)", h2))
    story.append(Paragraph("Bidders must furnish an Earnest Money Deposit (EMD) of INR 1,00,000 in the form of a Bank Guarantee. Bidders registered under MSME Udyam are fully EXEMPT from submitting EMD.", body))
    story.append(PageBreak())

    # Page 4: Make in India & Local Content Rules
    story.append(Paragraph("SECTION III: PUBLIC PROCUREMENT (PREFERENCE TO MAKE IN INDIA) ORDER 2017", h1))
    story.append(Paragraph("Under DPIIT Order No. P-45021/2/2017-PP (BE-II):", body))
    story.append(Paragraph("• <b>Class-1 Local Supplier:</b> Minimum 50% domestic local value addition. Only Class-1 Local Suppliers qualify for purchase preference.", body))
    story.append(Paragraph("• <b>Class-2 Local Supplier:</b> Local content between 20% and 50%.", body))
    story.append(Paragraph("• <b>Non-Local Supplier:</b> Local content under 20%. Disqualified.", body))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Bidders must submit a self-declaration certificate specifying the exact percentage of local content and the manufacturing facility address in India.", body))
    story.append(PageBreak())

    # Page 5: Warranty & SLA Terms
    story.append(Paragraph("SECTION IV: WARRANTY COMMITMENT & SERVICE LEVEL AGREEMENT", h1))
    story.append(Paragraph("1. <b>Comprehensive Onsite Warranty:</b> Minimum 3-Year 24x7 comprehensive onsite warranty covering all hardware parts, power supplies, motherboard, display panel, keyboard, and mouse.", body))
    story.append(Paragraph("2. <b>Mean Time to Respond (MTTR):</b> Maximum 4 hours from incident log.", body))
    story.append(Paragraph("3. <b>Resolution SLA:</b> 24 hours in metropolitan locations; 48 hours in remote stations.", body))
    story.append(PageBreak())

    # Page 6-12: Contractual Clauses, Penalties & Annexure Formats
    for i in range(6, 13):
        story.append(Paragraph(f"SECTION V (PART {i-5}): CONTRACTUAL TERMS & ANNEXURE TEMPLATES", h1))
        story.append(Paragraph(f"Standard GeM procurement contractual terms, delivery schedule, testing protocols, and compliance formats (Part {i-5}).", body))
        story.append(Spacer(1, 6))
        story.append(Paragraph("All bidders are required to complete and sign each respective annexure before final electronic submission.", body))
        if i < 12:
            story.append(PageBreak())

    doc.build(story, canvasmaker=NumberedCanvas)
    return filepath


# ─── 2. VENDOR 1: APEX LABS MSME (12 Pages - FULLY COMPLIANT) ─────────────────
def build_apex_labs_bid():
    filepath = os.path.join(SAMPLE_DIR, "Bid_ApexLabs_MSME.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=48, bottomMargin=48)
    _, h1, h2, h3, body, body_bold, callout = get_styles()
    story = []

    # Page 1: Cover Letter & Tender Response
    story.append(Paragraph("APEX LABS MICRO DEVICES LLP", h1))
    story.append(Paragraph("BID RESPONSE & STATUTORY PROPOSAL FOR GeM TENDER GEM/2026/B/892100", h2))
    story.append(Paragraph("<b>To:</b> Senior Procurement Officer, Ministry of Petroleum & Natural Gas, Government of India.", body))
    story.append(Paragraph("<b>Submission Date:</b> 22-January-2026 | <b>Bidder Type:</b> Registered MSE Manufacturer", body_bold))
    story.append(Spacer(1, 6))
    story.append(Paragraph("We, <b>Apex Labs Micro Devices LLP</b>, submit our complete technical and commercial proposal for the supply of 100 Desktop Workstations. We confirm 100% compliance with GFR 2017 rules, GeM General Terms, and tender technical requirements.", body))
    story.append(PageBreak())

    # Page 2: Corporate Particulars & GSTIN / PAN Profile
    story.append(Paragraph("ANNEXURE I: LEGAL ENTITY PARTICULARS & TAX CREDENTIALS", h1))
    entity_data = [
        [Paragraph("<b>Legal Entity Name:</b>", body_bold), Paragraph("Apex Labs Micro Devices LLP", body)],
        [Paragraph("<b>Entity Type:</b>", body_bold), Paragraph("Limited Liability Partnership (LLP Registered in India)", body)],
        [Paragraph("<b>Goods & Services Tax (GSTIN):</b>", body_bold), Paragraph("27AABCT3456L1ZV (Status: ACTIVE / REGULAR, State: Maharashtra)", body_bold)],
        [Paragraph("<b>Permanent Account Number (PAN):</b>", body_bold), Paragraph("AABCT3456L (Consistent across all filings)", body_bold)],
        [Paragraph("<b>Registered Corporate Office:</b>", body_bold), Paragraph("Plot 42, MIDC Tech Zone, Andheri East, Mumbai, Maharashtra 400093", body)],
        [Paragraph("<b>Authorised Signatory:</b>", body_bold), Paragraph("Rajesh V. Nair, Designated Managing Partner", body)]
    ]
    t = Table(entity_data, colWidths=[2.6*inch, 4.7*inch])
    t.setStyle(TableStyle([('BOX', (0,0), (-1,-1), 1, colors.black), ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black), ('TOPPADDING', (0,0), (-1,-1), 3.5), ('BOTTOMPADDING', (0,0), (-1,-1), 3.5)]))
    story.append(t)
    story.append(PageBreak())

    # Page 3: Statutory Udyam MSME Certificate
    story.append(Paragraph("ANNEXURE II: STATUTORY UDYAM MSME REGISTRATION CERTIFICATE", h1))
    story.append(Paragraph("<b>Ministry of Micro, Small and Medium Enterprises, Government of India</b>", h2))
    story.append(Spacer(1, 4))
    udyam_data = [
        [Paragraph("<b>Udyam Registration Number:</b>", body_bold), Paragraph("UDYAM-MH-03-0098765", body_bold)],
        [Paragraph("<b>Enterprise Classification:</b>", body_bold), Paragraph("Micro & Small Enterprise (MSE)", body_bold)],
        [Paragraph("<b>Major Manufacturing Activity:</b>", body_bold), Paragraph("Manufacture of Computers, Electronics, and High-Performance Workstations (NIC 2620)", body)],
        [Paragraph("<b>Statutory Exemption Claim:</b>", body_bold), Paragraph("Statutory exemption claimed for Prior Turnover (GFR Rule 160) and EMD Deposit (GFR Rule 170) under Public Procurement Policy 2012.", body)]
    ]
    t_u = Table(udyam_data, colWidths=[2.6*inch, 4.7*inch])
    t_u.setStyle(TableStyle([('BOX', (0,0), (-1,-1), 1, colors.HexColor("#0D1B3D")), ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")), ('TOPPADDING', (0,0), (-1,-1), 3.5), ('BOTTOMPADDING', (0,0), (-1,-1), 3.5)]))
    story.append(t_u)
    story.append(PageBreak())

    # Page 4: Commercial Price Bid Schedule
    story.append(Paragraph("ANNEXURE III: COMMERCIAL PRICE BID & BoQ BREAKDOWN", h1))
    story.append(Paragraph("Item-wise Bill of Quantities (BoQ) Lump-Sum Commercial Price Quotation:", body))
    story.append(Spacer(1, 4))
    price_data = [
        [Paragraph("<b>Item Description</b>", body_bold), Paragraph("<b>Qty</b>", body_bold), Paragraph("<b>Unit Rate (INR)</b>", body_bold), Paragraph("<b>Total Amount (INR)</b>", body_bold)],
        [Paragraph("Commercial Workstations (Core i7, 32GB RAM, 1TB NVMe, 27\" 4K)", body), Paragraph("100", body), Paragraph("35,593.22", body), Paragraph("35,59,322.00", body)],
        [Paragraph("Goods & Services Tax (GST @ 18%)", body), Paragraph("-", body), Paragraph("-", body), Paragraph("6,40,678.00", body)],
        [Paragraph("<b>Total Quoted Price (All Inclusive):</b>", body_bold), Paragraph("<b>100</b>", body_bold), Paragraph("-", body), Paragraph("<b>INR 42,00,000.00</b>", body_bold)]
    ]
    t_p = Table(price_data, colWidths=[3.5*inch, 0.6*inch, 1.5*inch, 1.7*inch])
    t_p.setStyle(TableStyle([('BOX', (0,0), (-1,-1), 1, colors.black), ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black), ('LINEBELOW', (0,0), (-1,0), 1.2, colors.black), ('TOPPADDING', (0,0), (-1,-1), 3.5), ('BOTTOMPADDING', (0,0), (-1,-1), 3.5)]))
    story.append(t_p)
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Total Quoted Price: INR 42,00,000.00</b> (L1 Competitive Quoted Amount).", body_bold))
    story.append(PageBreak())

    # Page 5: CA Audited Turnover Certificate
    story.append(Paragraph("ANNEXURE IV: CHARTERED ACCOUNTANT TURNOVER CERTIFICATE", h1))
    story.append(Paragraph("This is to certify that M/s Apex Labs Micro Devices LLP has recorded an audited annual financial turnover of <b>INR 12.40 Crore</b>. UDIN: 26049214AAAA9812.", body))
    story.append(PageBreak())

    # Page 6: Make in India Local Content Declaration
    story.append(Paragraph("ANNEXURE V: MAKE IN INDIA (MII) LOCAL CONTENT SELF-DECLARATION", h1))
    story.append(Paragraph("We declare that our workstations feature <b>65% Local Content</b>, qualifying as a <b>Class-1 Local Supplier</b> under the Public Procurement Order 2017. Domestic SMT manufacturing at MIDC Electronics Complex, Navi Mumbai, India.", body))
    story.append(PageBreak())

    # Page 7: OEM Authorization & Extended Value Perks
    story.append(Paragraph("ANNEXURE VI: OEM AUTHORIZATION & EXTENDED VALUE HIGHLIGHTS", h1))
    story.append(Paragraph("<b>1. Comprehensive Warranty:</b> We provide a <b>5-Year Comprehensive 24x7 Onsite Warranty</b> (exceeding the 3-Year baseline requirement).", body_bold))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>2. Free Hardware Upgrade:</b> We include a <b>Free 32GB DDR5 RAM Upgrade</b> per workstation at no additional cost (RFP requirement was 16GB RAM).", body_bold))
    story.append(PageBreak())

    # Pages 8-12: Technical Datasheet, BIS, ISO & Test Certificates
    for i in range(8, 13):
        story.append(Paragraph(f"ANNEXURE VII (PART {i-7}): TECHNICAL DATASHEETS & TEST CERTIFICATES", h1))
        story.append(Paragraph(f"Detailed engineering datasheets, BIS registration certificates, ISO 9001:2015 quality compliance, and hardware benchmark reports (Part {i-7}).", body))
        story.append(Spacer(1, 6))
        story.append(Paragraph("All components certified for mission-critical enterprise deployment under Ministry guidelines.", body))
        if i < 12:
            story.append(PageBreak())

    doc.build(story, canvasmaker=NumberedCanvas)
    return filepath


# ─── 3. VENDOR 2: MEGATECH SOLUTIONS (12 Pages - COMPLIANT CORPORATE) ─────────
def build_megatech_bid():
    filepath = os.path.join(SAMPLE_DIR, "Bid_MegaTech_BigBrand.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=48, bottomMargin=48)
    _, h1, h2, h3, body, body_bold, callout = get_styles()
    story = []

    # Page 1: Proposal Cover
    story.append(Paragraph("MEGATECH SOLUTIONS INTERNATIONAL PVT LTD", h1))
    story.append(Paragraph("COMMERCIAL & TECHNICAL BID SUBMISSION FOR GeM TENDER GEM/2026/B/892100", h2))
    story.append(Paragraph("<b>Tender Reference:</b> GEM/2026/B/892100 | <b>Date:</b> 23-January-2026", body_bold))
    story.append(Spacer(1, 6))

    entity_data = [
        [Paragraph("<b>Company Name:</b>", body_bold), Paragraph("MegaTech Solutions International Private Limited", body)],
        [Paragraph("<b>GSTIN:</b>", body_bold), Paragraph("07AAACM9988K1Z5 (Status: ACTIVE / REGULAR, Delhi)", body_bold)],
        [Paragraph("<b>PAN:</b>", body_bold), Paragraph("AAACM9988K (Matched across all corporate filings)", body_bold)],
        [Paragraph("<b>Total Quoted Price:</b>", body_bold), Paragraph("INR 48,50,000 (All Inclusive for 100 Units)", body_bold)],
        [Paragraph("<b>EMD Bank Guarantee:</b>", body_bold), Paragraph("Bank Guarantee No. BG/SBI/2026/8821 for INR 1,00,000 issued by State Bank of India", body)],
        [Paragraph("<b>Audited Turnover:</b>", body_bold), Paragraph("INR 45.80 Crore (Last 3 Audited Financial Years)", body)],
        [Paragraph("<b>Local Content %:</b>", body_bold), Paragraph("58% Class-1 Local Supplier", body)],
        [Paragraph("<b>Warranty SLA:</b>", body_bold), Paragraph("3-Year Comprehensive Onsite OEM Warranty", body)]
    ]
    t = Table(entity_data, colWidths=[2.6*inch, 4.7*inch])
    t.setStyle(TableStyle([('BOX', (0,0), (-1,-1), 1, colors.black), ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black), ('TOPPADDING', (0,0), (-1,-1), 3.5), ('BOTTOMPADDING', (0,0), (-1,-1), 3.5)]))
    story.append(t)
    story.append(PageBreak())

    # Pages 2-12: Audited Financials, Bank Guarantees & Technical Specs
    for i in range(2, 13):
        story.append(Paragraph(f"SECTION {i}: DETAILED CORPORATE SUBMISSION & COMPLIANCE (PART {i})", h1))
        story.append(Paragraph(f"Comprehensive financial schedules, CA audited balance sheets with UDIN (Turnover: INR 45.80 Crore), original SBI Bank Guarantee copy (INR 1,00,000), 58% local content manufacturing certifications, and OEM authorization documents (Part {i}).", body))
        story.append(Spacer(1, 6))
        story.append(Paragraph("All technical parameters comply 100% with Tender Reference GEM/2026/B/892100 specifications.", body))
        if i < 12:
            story.append(PageBreak())

    doc.build(story, canvasmaker=NumberedCanvas)
    return filepath


# ─── 4. VENDOR 3: GLOBALCORP INELIGIBLE (10 Pages - DISCREPANCIES) ─────────────
def build_globalcorp_ineligible():
    filepath = os.path.join(SAMPLE_DIR, "Bid_GlobalCorp_Ineligible.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=48, bottomMargin=48)
    _, h1, h2, h3, body, body_bold, callout = get_styles()
    story = []

    # Page 1: Cover Page
    story.append(Paragraph("GLOBALCORP ENTERPRISES LIMITED", h1))
    story.append(Paragraph("COMMERCIAL BID SUBMISSION — TENDER REF GEM/2026/B/892100", h2))
    story.append(Paragraph("<b>Submission Date:</b> 20-January-2026", body_bold))
    story.append(Spacer(1, 6))

    entity_data = [
        [Paragraph("<b>Company Name:</b>", body_bold), Paragraph("GlobalCorp Enterprises Limited", body)],
        [Paragraph("<b>GSTIN:</b>", body_bold), Paragraph("06AAACG1122J1Z8 (STATUS: EXPIRED / CANCELLED IN TAX FILING)", body_bold)],
        [Paragraph("<b>Cover Letter PAN:</b>", body_bold), Paragraph("AAACG1122J", body_bold)],
        [Paragraph("<b>Annexure 3 MAF Attachment PAN:</b>", body_bold), Paragraph("AAACG9999P (Conflicting Entity PAN)", body_bold)],
        [Paragraph("<b>Total Quoted Price:</b>", body_bold), Paragraph("INR 54,00,000", body_bold)],
        [Paragraph("<b>Annual Financial Turnover:</b>", body_bold), Paragraph("INR 0.85 Crore (Below 1.50 Cr threshold, No MSME Certificate Provided)", body_bold)],
        [Paragraph("<b>EMD Guarantee Status:</b>", body_bold), Paragraph("MISSING / NOT SUBMITTED", body_bold)],
        [Paragraph("<b>Local Content %:</b>", body_bold), Paragraph("0% (Imported Assembly, Fails Class-1 MII Requirement)", body_bold)],
        [Paragraph("<b>Warranty Commitment:</b>", body_bold), Paragraph("6-Month Carry-in Warranty (Sub-standard)", body_bold)]
    ]
    t = Table(entity_data, colWidths=[2.6*inch, 4.7*inch])
    t.setStyle(TableStyle([('BOX', (0,0), (-1,-1), 1, colors.black), ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black), ('TOPPADDING', (0,0), (-1,-1), 3.5), ('BOTTOMPADDING', (0,0), (-1,-1), 3.5)]))
    story.append(t)
    story.append(PageBreak())

    # Pages 2-10: Submissions with Conflicting PAN and Missing Guarantees
    for i in range(2, 11):
        story.append(Paragraph(f"ANNEXURE {i}: ATTACHMENTS & THIRD-PARTY PROFILES (PART {i})", h1))
        story.append(Paragraph(f"Supporting annexures containing third-party entity PAN AAACG9999P, 6-month carry-in warranty terms, and non-local imported product datasheets (Part {i}).", body))
        story.append(Spacer(1, 6))
        if i < 10:
            story.append(PageBreak())

    doc.build(story, canvasmaker=NumberedCanvas)
    return filepath


# ─── 5. VENDOR 4: GLOBALCORP RECTIFIED (10 Pages - RE-EVALUATION PASSED) ──────
def build_globalcorp_rectified():
    filepath = os.path.join(SAMPLE_DIR, "Bid_GlobalCorp_Rectified_ReEvaluation.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=48, bottomMargin=48)
    _, h1, h2, h3, body, body_bold, callout = get_styles()
    story = []

    # Page 1: Rectification Cover Letter
    story.append(Paragraph("GLOBALCORP ENTERPRISES LIMITED — RECTIFIED SUBMISSION", h1))
    story.append(Paragraph("FORMAL CLARIFICATION & STATUTORY RECTIFICATION DOSSIER", h2))
    story.append(Paragraph("<b>Tender Ref:</b> GEM/2026/B/892100 | <b>Rectification Date:</b> 25-January-2026", body_bold))
    story.append(Spacer(1, 6))

    entity_data = [
        [Paragraph("<b>Company Name:</b>", body_bold), Paragraph("GlobalCorp Enterprises Limited", body)],
        [Paragraph("<b>Active GSTIN Reactivation:</b>", body_bold), Paragraph("06AAACG1122J1Z8 (Status: ACTIVE, State Tax Reactivation Order Attached)", body_bold)],
        [Paragraph("<b>Unified Corrected PAN:</b>", body_bold), Paragraph("AAACG1122J (Matched across all corporate annexures)", body_bold)],
        [Paragraph("<b>Total Quoted Price:</b>", body_bold), Paragraph("INR 49,00,000", body_bold)],
        [Paragraph("<b>EMD Bank Guarantee:</b>", body_bold), Paragraph("INR 1,00,000 Bank Guarantee PNB/2026/0912 Submitted", body_bold)],
        [Paragraph("<b>Audited Financial Turnover:</b>", body_bold), Paragraph("Audited financial statement showing INR 2.10 Crore Turnover", body_bold)],
        [Paragraph("<b>Revised Warranty Commitment:</b>", body_bold), Paragraph("3-Year Comprehensive Onsite OEM Warranty", body_bold)],
        [Paragraph("<b>Revised Local Content:</b>", body_bold), Paragraph("52% Class-1 Local Supplier", body_bold)]
    ]
    t = Table(entity_data, colWidths=[2.6*inch, 4.7*inch])
    t.setStyle(TableStyle([('BOX', (0,0), (-1,-1), 1, colors.black), ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black), ('TOPPADDING', (0,0), (-1,-1), 3.5), ('BOTTOMPADDING', (0,0), (-1,-1), 3.5)]))
    story.append(t)
    story.append(PageBreak())

    # Pages 2-10: Rectified Documents & Active Certificates
    for i in range(2, 11):
        story.append(Paragraph(f"RECTIFIED ANNEXURE {i}: STATUTORY PROOF DOCUMENTS (PART {i})", h1))
        story.append(Paragraph(f"Official proof of GSTIN reactivation (06AAACG1122J1Z8), PNB Bank Guarantee copy for INR 1,00,000, 3-Year comprehensive warranty backing letter, and 52% local content certification (Part {i}).", body))
        story.append(Spacer(1, 6))
        if i < 10:
            story.append(PageBreak())

    doc.build(story, canvasmaker=NumberedCanvas)
    return filepath


if __name__ == "__main__":
    print("Generating comprehensive multi-page sample procurement files...")
    f1 = build_tender_rfp()
    print("1. Generated Tender RFP:", f1, os.path.getsize(f1), "bytes")
    f2 = build_apex_labs_bid()
    print("2. Generated Apex Labs MSME Bid:", f2, os.path.getsize(f2), "bytes")
    f3 = build_megatech_bid()
    print("3. Generated MegaTech Bid:", f3, os.path.getsize(f3), "bytes")
    f4 = build_globalcorp_ineligible()
    print("4. Generated GlobalCorp Ineligible Bid:", f4, os.path.getsize(f4), "bytes")
    f5 = build_globalcorp_rectified()
    print("5. Generated GlobalCorp Rectified Bid:", f5, os.path.getsize(f5), "bytes")
    print("All multi-page sample files generated successfully!")
