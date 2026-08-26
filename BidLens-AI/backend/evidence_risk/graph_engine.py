"""
Clause-to-Evidence Compliance Knowledge Graph Engine - Layer 4
Constructs a directed semantic graph mapping:
  Regulatory Rules (GFR 2017 / MSME Orders)
    → RFP Bid Clauses
      → Required Evidence
        → Submitted Vendor Attachments / Excerpts
          → Verified Decisions (PASS / FAIL / EXEMPT)
"""
import networkx as nx


def build_compliance_knowledge_graph(file_info: dict, clause_results: list, govt_verification: dict) -> dict:
    """
    Builds a NetworkX directed graph representing the complete audit chain
    and returns a D3 / Vis.js / React-Flow compatible JSON representation.
    """
    G = nx.DiGraph()
    vendor_name = file_info.get("vendor_name", "Vendor Bid")
    filename = file_info.get("filename", "bid_document")

    # 1. Root Document Node
    doc_node_id = f"doc_{filename}"
    G.add_node(doc_node_id, label=filename, type="document", details=vendor_name)

    # 2. Iterate over each clause result and build the semantic chain
    for idx, clause in enumerate(clause_results):
        clause_id = clause.get("clause_id", f"clause_{idx}")
        clause_name = clause.get("clause_name", "Requirement")
        reg_ref = clause.get("regulation_ref", "GFR 2017")
        status = clause.get("status", "PENDING")
        evidence = clause.get("evidence", "Submitted text")
        
        reg_node_id = f"reg_{clause_id}"
        clause_node_id = f"req_{clause_id}"
        evidence_node_id = f"evi_{clause_id}"
        decision_node_id = f"dec_{clause_id}"

        # Add Nodes with metadata
        G.add_node(reg_node_id, label=reg_ref, type="regulation", color="#1E3A8A")
        G.add_node(clause_node_id, label=clause_name, type="clause", color="#4F46E5")
        G.add_node(evidence_node_id, label=evidence[:60] + ("..." if len(evidence) > 60 else ""), full_evidence=evidence, type="evidence", color="#0284C7")
        
        # Decision color based on status
        status_color = "#16A34A" if status == "PASS" else ("#2563EB" if status == "EXEMPT" else "#DC2626")
        G.add_node(decision_node_id, label=f"{status}: {clause_name}", status=status, type="decision", color=status_color)

        # Add Directed Edges (Semantic flow)
        G.add_edge(reg_node_id, clause_node_id, relation="governs")
        G.add_edge(clause_node_id, evidence_node_id, relation="mandates_evidence")
        G.add_edge(doc_node_id, evidence_node_id, relation="submits")
        G.add_edge(evidence_node_id, decision_node_id, relation="justifies_decision")

    # 3. Add Govt Verification Node
    govt_node_id = "govt_verification_portal"
    govt_status = govt_verification.get("overall_govt_verification", "FLAGGED_FOR_REVIEW")
    govt_color = "#16A34A" if govt_status == "PASS" else "#DC2626"
    G.add_node(govt_node_id, label=f"Govt Verification ({govt_status})", type="govt_check", color=govt_color)
    G.add_edge(doc_node_id, govt_node_id, relation="cross_verified_with_portal")

    # 4. Serialize to clean UI-friendly JSON format
    nodes_list = []
    for node_id, data in G.nodes(data=True):
        nodes_list.append({
            "id": node_id,
            "label": data.get("label", node_id),
            "type": data.get("type", "generic"),
            "color": data.get("color", "#64748B"),
            "status": data.get("status"),
            "details": data.get("details") or data.get("full_evidence")
        })

    edges_list = []
    for u, v, data in G.edges(data=True):
        edges_list.append({
            "source": u,
            "target": v,
            "relation": data.get("relation", "links_to")
        })

    return {
        "summary": {
            "total_nodes": len(nodes_list),
            "total_edges": len(edges_list),
            "is_connected": nx.is_weakly_connected(G)
        },
        "nodes": nodes_list,
        "edges": edges_list
    }
