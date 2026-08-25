"""
Knowledge Graph Engine — Layer 4 (Evidence + Risk)
Builds the Clause-to-Evidence Knowledge Graph using NetworkX.
Maps: Regulation → Clause → Required Evidence → Submitted Doc → Decision
OWNER: Person 2 (Teammate)
"""
import networkx as nx


def build_compliance_graph(audit_results: dict) -> nx.DiGraph:
    """
    Constructs the Clause-to-Evidence Knowledge Graph.
    Nodes: Regulations, Clauses, Evidence Requirements, Submitted Docs, Decisions
    Edges: 'requires', 'maps_to', 'satisfied_by', 'results_in'
    """
    G = nx.DiGraph()

    # TODO (Sprint 4): Populate graph from audit results
    # Example node structure:
    # G.add_node("GFR-149", type="regulation", label="GFR 2017 Rule 149")
    # G.add_node("CERT-VALIDITY", type="clause", label="Certificate Validity")
    # G.add_node("GSTIN-CERT", type="evidence", label="GSTIN Certificate")
    # G.add_node("vendor_gstin.pdf", type="document", label="Submitted GSTIN")
    # G.add_node("PASS", type="decision")
    # G.add_edges_from([
    #     ("GFR-149", "CERT-VALIDITY", {"rel": "requires"}),
    #     ("CERT-VALIDITY", "GSTIN-CERT", {"rel": "needs_evidence"}),
    #     ("GSTIN-CERT", "vendor_gstin.pdf", {"rel": "satisfied_by"}),
    #     ("vendor_gstin.pdf", "PASS", {"rel": "results_in"}),
    # ])

    return G


def graph_to_dict(G: nx.DiGraph) -> dict:
    """Convert graph to JSON-serializable dict for frontend visualization."""
    return {
        "nodes": [{"id": n, **G.nodes[n]} for n in G.nodes],
        "edges": [{"source": u, "target": v, **G.edges[u,v]} for u,v in G.edges],
    }
