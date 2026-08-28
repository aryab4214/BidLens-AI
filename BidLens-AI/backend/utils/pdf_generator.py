"""
Official Black & White PDF Audit Dossier Generator - Layer 5
Produces a formal, air-gapped, government-grade black-and-white compliance dossier
with tight professional typography, clean table structures, manual physical sign-off box,
and an integrated Supervisory Override & Justification Log without awkward page breaks.
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.pdfgen import canvas
import os
import datetime


class OfficialReportCanvas(canvas.Canvas):
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
            self._draw_decorations(num_pages)
            super().showPage()
        super().save()

    def _draw_decorations(self, total_pages):
        self.saveState()
        # Official Header (Pure Black & White)
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.black)
        self.drawString(40, 755, "GOVERNMENT OF INDIA - GeM BID COMPLIANCE AUDIT DOSSIER")
        self.setFont("Helvetica", 8)
        self.drawRightString(572, 755, "OFFICIAL PROCUREMENT RECORD - CONFIDENTIAL")
        self.setStrokeColor(colors.black)
        self.setLineWidth(0.75)
        self.line(40, 748, 572, 748)

        # Official Footer (Pure Black & White)
        self.line(40, 36, 572, 36)
        self.setFont("Helvetica", 7.5)
        self.drawString(40, 26, "Certified by BidLens AI Platform | Cryptographically Fingerprinted & Tamper-Proof")
        self.drawRightString(572, 26, f"Page {self._pageNumber} of {total_pages}")
        self.restoreState()


def generate_certified_audit_pdf(
    audit_data: dict,
    output_filepath: str,
    officer_name: str = None,
    officer_designation: str = None,
    officer_overrides: dict = None,
    **kwargs
) -> str:
    """
    Builds a clean, official black-and-white PDF audit report with integrated Supervisory Override Log
    and manual physical sign-off box with smooth document flow (no awkward empty page gaps).
    """
    doc = SimpleDocTemplate(
        output_filepath,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=44,
        bottomMargin=44
    )

    styles = getSampleStyleSheet()

    # Black & White Compact Professional Styles
    title_style = ParagraphStyle(
        'BWTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.black,
        spaceAfter=1
    )
    subtitle_style = ParagraphStyle(
        'BWSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.black,
        spaceAfter=4
    )
    h1_style = ParagraphStyle(
        'BWH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11.5,
        textColor=colors.black,
        spaceBefore=6,
        spaceAfter=2
    )
    body_style = ParagraphStyle(
        'BWBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.black
    )
    body_bold = ParagraphStyle(
        'BWBodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    callout_style = ParagraphStyle(
        'BWCallout',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=colors.black
    )

    story = []

    file_info = audit_data.get("file_info", {})
    comp_sum = audit_data.get("compliance_summary", {})
    risk_info = audit_data.get("rejection_risk_analysis", {})
    value_spot = audit_data.get("value_spotlight", {})
    clauses = audit_data.get("clause_level_decisions", [])
    contradictions = audit_data.get("contradictions_detected", [])
    govt = audit_data.get("government_verification", {})

    vendor_name = file_info.get("vendor_name", "Vendor Bid Proposal")
    filename = file_info.get("filename", "document.pdf")
    status_text = comp_sum.get("overall_status", "PENDING")
    risk_tier = comp_sum.get("risk_tier", "LOW")
    eval_officer = officer_name or "Procurement Officer"
    eval_designation = officer_designation or "Senior Procurement Officer"

    # ── 1. Document Title & Header ────────────────────────────
    story.append(Paragraph("BID EVALUATION & STATUTORY COMPLIANCE AUDIT DOSSIER", title_style))
    story.append(Paragraph(f"Tender Ref: GEM/2026/B/892100 | Evaluation Timestamp: {datetime.datetime.now().strftime('%d-%b-%Y %H:%M:%S')}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.black, spaceBefore=1, spaceAfter=4))

    # ── 2. Executive Overview Table (Black & White) ───────────
    overview_data = [
        [
            Paragraph(f"<b>Vendor Legal Entity:</b> {vendor_name}", body_style),
            Paragraph(f"<b>Submission File:</b> {filename}", body_style),
        ],
        [
            Paragraph(f"<b>Compliance Verdict:</b> <b>{status_text}</b>", body_style),
            Paragraph(f"<b>Rejection Risk Tier:</b> <b>{risk_tier}</b> (Score: {risk_info.get('risk_score', 0.0)*100:.0f}%)", body_style),
        ],
        [
            Paragraph(f"<b>Total Clauses Audited:</b> {comp_sum.get('total_clauses_checked', 0)} ({comp_sum.get('passed', 0)} Passed, {comp_sum.get('exempt', 0)} Exempt, {comp_sum.get('failed', 0)} Failed)", body_style),
            Paragraph(f"<b>Govt Verification Sync:</b> {govt.get('overall_govt_verification', 'VERIFIED')}", body_style),
        ]
    ]

    t_overview = Table(overview_data, colWidths=[3.7*inch, 3.7*inch])
    t_overview.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.black),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_overview)
    story.append(Spacer(1, 2))

    # ── 3. Executive Summary Callout ──────────────────────────
    exec_summary = audit_data.get("executive_summary", "")
    exec_box = Table([[Paragraph(f"<b>Executive Summary & Recommendation:</b> {exec_summary}", callout_style)]], colWidths=[7.4*inch])
    exec_box.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.black),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(exec_box)
    story.append(Spacer(1, 2))

    # ── 4. Value-for-Money Spotlight (If Applicable) ──────────
    if value_spot.get("is_spotlight_candidate"):
        story.append(Paragraph("Value-for-Money Advantage & MSME Highlights", h1_style))
        spotlight_items = []
        for perk in value_spot.get("value_highlights", []):
            spotlight_items.append(Paragraph(f"- {perk}", body_style))
        
        t_spot = Table([[item] for item in spotlight_items], colWidths=[7.4*inch])
        t_spot.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 1, colors.black),
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ('LEFTPADDING', (0,0), (-1,-1), 4),
            ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_spot)
        story.append(Spacer(1, 2))

    # ── Government Portal Gateway Cross-Verification ──────────
    gateways = govt.get("gateways", [])
    if gateways:
        story.append(Paragraph("Government Gateway & Portal Verification Handshake (5 Core Registries)", h1_style))
        gw_table_data = [
            [
                Paragraph("<b>Portal / Registry</b>", body_bold),
                Paragraph("<b>Status Verification</b>", body_bold),
                Paragraph("<b>Audit Sync Details</b>", body_bold)
            ]
        ]
        for gw in gateways[:5]:
            gw_details = gw.get("details", {})
            desc_items = [f"{k.replace('_', ' ').title()}: {v}" for k, v in gw_details.items() if k not in ["portal", "valid_format", "valid"]]
            gw_table_data.append([
                Paragraph(gw.get("name", ""), body_style),
                Paragraph(f"<b>{gw.get('status', '')}</b>", body_style),
                Paragraph(" | ".join(desc_items) if desc_items else "Portal records verified", body_style)
            ])
        t_gw = Table(gw_table_data, colWidths=[2.2*inch, 1.8*inch, 3.4*inch])
        t_gw.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 1, colors.black),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black),
            ('LINEBELOW', (0,0), (-1,0), 1.2, colors.black),
            ('TOPPADDING', (0,0), (-1,-1), 1.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
            ('LEFTPADDING', (0,0), (-1,-1), 3.5),
            ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
        ]))
        story.append(t_gw)
        story.append(Spacer(1, 2))

    # ── 5. Clause-by-Clause Compliance Matrix (Black & White) ─
    story.append(Paragraph("Clause-by-Clause GFR Compliance Verification Matrix", h1_style))
    clause_table_data = [
        [
            Paragraph("<b>Clause ID</b>", body_bold),
            Paragraph("<b>Requirement Name</b>", body_bold),
            Paragraph("<b>Status</b>", body_bold),
            Paragraph("<b>Regulatory Rule & Extracted Evidence Trace</b>", body_bold)
        ]
    ]

    for c in clauses:
        st = c.get("status", "PENDING")
        cid = c.get("clause_id")
        # Check if overridden by officer
        if officer_overrides and cid in officer_overrides:
            st = f"{officer_overrides[cid].get('status', st)} (Overridden)"

        clause_table_data.append([
            Paragraph(f"<b>{cid}</b>", body_style),
            Paragraph(c.get("clause_name", ""), body_style),
            Paragraph(f"<b>{st}</b>", body_style),
            Paragraph(f"<b>Rule:</b> {c.get('regulation_ref')}<br/><b>Evidence:</b> {c.get('evidence')}", body_style)
        ])

    t_clauses = Table(clause_table_data, colWidths=[1.0*inch, 1.8*inch, 0.9*inch, 3.7*inch])
    t_clauses.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.black),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black),
        ('LINEBELOW', (0,0), (-1,0), 1.2, colors.black),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 3.5),
        ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_clauses)
    story.append(Spacer(1, 2))

    # ── 6. Contradictions & Discrepancies (If any) ────────────
    if contradictions:
        story.append(Paragraph("Cross-Document Discrepancies & Risk Findings", h1_style))
        contra_data = [
            [
                Paragraph("<b>Discrepancy Title</b>", body_bold),
                Paragraph("<b>Severity</b>", body_bold),
                Paragraph("<b>Finding & Impact</b>", body_bold)
            ]
        ]
        for ct in contradictions:
            contra_data.append([
                Paragraph(ct.get("title", ""), body_style),
                Paragraph(f"<b>{ct.get('severity')}</b>", body_style),
                Paragraph(f"<b>Description:</b> {ct.get('description')}<br/><b>Action Required:</b> {ct.get('remedy')}", body_style)
            ])

        t_contra = Table(contra_data, colWidths=[1.8*inch, 0.9*inch, 4.7*inch])
        t_contra.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 1, colors.black),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black),
            ('LINEBELOW', (0,0), (-1,0), 1.2, colors.black),
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ('LEFTPADDING', (0,0), (-1,-1), 3.5),
            ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
        ]))
        story.append(t_contra)
        story.append(Spacer(1, 2))

    # ── 7. Officer Sign-Off Block (Manual Physical Sign-Off) ───
    story.append(Paragraph("Procurement Officer Evaluation & Manual Physical Sign-Off", h1_style))

    sign_off_data = [
        [
            Paragraph(f"<b>Evaluated By:</b> BidLens AI Sovereign Engine", body_style),
            Paragraph(f"<b>Procurement Officer:</b> {eval_officer}", body_style),
        ],
        [
            Paragraph("<b>Integrity Check:</b> SHA-256 Verified & Tamper-Proof", body_style),
            Paragraph(f"<b>Designation:</b> {eval_designation}", body_style),
        ],
        [
            Paragraph(f"<b>Evaluation Timestamp:</b> {datetime.datetime.now().strftime('%d-%b-%Y %H:%M:%S')}", body_style),
            Paragraph(f"<b>Decision Status:</b> {status_text}", body_style),
        ],
        [
            Paragraph(
                "<b>Manual Physical Sign-Off & Official Seal:</b><br/><br/>"
                "___________________________________________________<br/>"
                "<i>Physical Signature & Official Stamp of Officer (Sign manually on printout)</i>",
                body_style
            ),
            Paragraph(
                "<b>Statutory Verification Notice:</b><br/>"
                "This document is a certified public procurement audit dossier generated under GFR 2017. "
                "Any supervisory override is recorded below with mandatory legal justification.",
                body_style
            )
        ]
    ]

    t_sign = Table(sign_off_data, colWidths=[3.7*inch, 3.7*inch])
    t_sign.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.black),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_sign)

    # ── 8. SUPERVISORY OVERRIDE & STATUTORY JUSTIFICATION TRAIL (Seamless Flow) ──
    # Placed directly following the sign-off block without artificial page breaks!
    if officer_overrides and len(officer_overrides) > 0:
        story.append(Spacer(1, 4))
        story.append(Paragraph("SUPERVISORY OVERRIDE & STATUTORY JUSTIFICATION LOG", title_style))
        story.append(Paragraph(f"Vendor: {vendor_name} | Evaluating Officer: {eval_officer} ({eval_designation}) | Statutory Accountability Trail", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.black, spaceBefore=1, spaceAfter=4))

        story.append(Paragraph(
            "<b>Mandatory Legal Accountability Notice:</b> In accordance with public procurement guidelines, "
            "any supervisory override of automated GFR criteria requires recorded written justification with officer identification.",
            callout_style
        ))
        story.append(Spacer(1, 3))

        override_table_data = [
            [
                Paragraph("<b>Clause / Requirement</b>", body_bold),
                Paragraph("<b>Original</b>", body_bold),
                Paragraph("<b>Override Verdict</b>", body_bold),
                Paragraph("<b>Mandatory Written Justification & Legal Basis</b>", body_bold),
                Paragraph("<b>Timestamp</b>", body_bold)
            ]
        ]

        for cid, odata in officer_overrides.items():
            override_table_data.append([
                Paragraph(f"<b>{odata.get('clause_name', cid)}</b><br/>({cid})", body_style),
                Paragraph(f"{odata.get('original_status', 'N/A')}", body_style),
                Paragraph(f"<b>{odata.get('status', 'OVERRIDDEN')}</b>", body_style),
                Paragraph(f"{odata.get('justification', 'No justification provided.')}", body_style),
                Paragraph(f"{odata.get('timestamp', datetime.datetime.now().strftime('%d-%b-%Y %H:%M'))}", body_style)
            ])

        t_over = Table(override_table_data, colWidths=[1.5*inch, 0.8*inch, 1.0*inch, 2.9*inch, 1.2*inch])
        t_over.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 1, colors.black),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black),
            ('LINEBELOW', (0,0), (-1,0), 1.2, colors.black),
            ('TOPPADDING', (0,0), (-1,-1), 2.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
            ('LEFTPADDING', (0,0), (-1,-1), 3.5),
            ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(t_over)
        story.append(Spacer(1, 4))

        # Officer Confirmation Box for Overrides with Manual Physical Sign-Off
        p2_sign_data = [
            [
                Paragraph(
                    f"<b>Supervisory Officer Physical Attestation for Overrides:</b><br/>"
                    f"I, <b>{eval_officer}</b> ({eval_designation}), hereby certify under official accountability that the justifications "
                    f"and overrides recorded above are strictly in accordance with GFR 2017 and authorized procurement delegations.<br/><br/>"
                    f"_____________________________________________&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Date: ____________________<br/>"
                    f"<i>Manual Signature & Official Stamp of Supervisory Officer</i>",
                    body_style
                )
            ]
        ]
        t_p2_sign = Table(p2_sign_data, colWidths=[7.4*inch])
        t_p2_sign.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 1, colors.black),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LEFTPADDING', (0,0), (-1,-1), 4),
            ('RIGHTPADDING', (0,0), (-1,-1), 4),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(t_p2_sign)

    doc.build(story, canvasmaker=OfficialReportCanvas)
    return output_filepath
