"""
SHA-256 Security Module — Anti-Tampering
Generates and verifies cryptographic fingerprints of uploaded documents.
OWNER: Person 1 (You)
"""
import hashlib


def hash_file(file_path: str) -> str:
    """Generate SHA-256 hash of a file."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def verify_file(file_path: str, expected_hash: str) -> bool:
    """
    Verify a file's integrity against its stored hash.
    Returns True if file is unchanged, False if tampered.
    """
    current_hash = hash_file(file_path)
    return current_hash == expected_hash


def sanitize_prompt_injection(text: str) -> str:
    """
    Scrub common prompt injection phrases from document text
    before sending to LLM. Prevents jailbreak attacks.
    """
    dangerous_phrases = [
        "ignore previous instructions",
        "ignore all instructions",
        "you are now",
        "act as",
        "disregard",
        "forget everything",
        "new instructions:",
        "system prompt:",
    ]
    cleaned = text
    for phrase in dangerous_phrases:
        cleaned = cleaned.lower().replace(phrase, "[REDACTED]")
    return cleaned


def wrap_as_untrusted(text: str) -> str:
    """
    Wraps document text in XML tags to signal to the LLM
    that this content is untrusted user data, not instructions.
    """
    return f"<UNTRUSTED_DOCUMENT>\n{text}\n</UNTRUSTED_DOCUMENT>"
