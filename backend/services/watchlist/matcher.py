from typing import List, Optional, Tuple
from dataclasses import dataclass
from sqlalchemy.orm import Session
from backend.services.camera_registry.models import WatchlistEntity, WatchlistAlias
from backend.services.watchlist.normalizer import normalize_plate

@dataclass
class WatchlistMatchResult:
    matched: bool
    entity: Optional[WatchlistEntity] = None
    similarity_score: float = 0.0
    match_type: str = "NONE" # EXACT, FUZZY, NONE
    requires_review: bool = False
    details: str = ""

def levenshtein_distance(s1: str, s2: str) -> int:
    """Compute standard Levenshtein distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    prev = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        curr = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = prev[j + 1] + 1
            deletions = curr[j] + 1
            substitutions = prev[j] + (c1 != c2)
            curr.append(min(insertions, deletions, substitutions))
        prev = curr
    return prev[-1]

def calculate_similarity(s1: str, s2: str) -> float:
    """Returns normalized similarity score in range [0.0, 1.0]."""
    if not s1 or not s2:
        return 0.0
    max_len = max(len(s1), len(s2))
    dist = levenshtein_distance(s1, s2)
    return max(0.0, 1.0 - (dist / max_len))

class WatchlistMatcher:
    """Correlation engine for exact and bounded fuzzy watchlist matching."""

    def __init__(
        self,
        exact_threshold: float = 1.0,
        fuzzy_high_threshold: float = 0.88,
        fuzzy_review_threshold: float = 0.78,
        min_ocr_confidence: float = 0.65
    ):
        self.exact_threshold = exact_threshold
        self.fuzzy_high_threshold = fuzzy_high_threshold
        self.fuzzy_review_threshold = fuzzy_review_threshold
        self.min_ocr_confidence = min_ocr_confidence

    def match_plate(
        self,
        raw_plate: str,
        ocr_confidence: float,
        db: Session,
        department_id: Optional[str] = None
    ) -> WatchlistMatchResult:
        normalized = normalize_plate(raw_plate)
        if not normalized:
            return WatchlistMatchResult(matched=False, details="Empty identifier after normalization.")

        query = db.query(WatchlistEntity).filter(WatchlistEntity.status == 'ACTIVE')
        if department_id:
            query = query.filter(
                (WatchlistEntity.department_id == department_id) | 
                (WatchlistEntity.department_id == None)
            )

        # 1. Exact Match on normalized identifier
        exact_entity = query.filter(WatchlistEntity.normalized_identifier == normalized).first()
        if exact_entity:
            return WatchlistMatchResult(
                matched=True,
                entity=exact_entity,
                similarity_score=1.0,
                match_type="EXACT",
                requires_review=False,
                details=f"Exact match on watchlist identifier {exact_entity.identifier}"
            )

        # 2. Exact Match on aliases
        alias = db.query(WatchlistAlias).join(WatchlistEntity).filter(
            WatchlistEntity.status == 'ACTIVE',
            WatchlistAlias.alias == normalized
        ).first()
        if alias and alias.entity:
            return WatchlistMatchResult(
                matched=True,
                entity=alias.entity,
                similarity_score=1.0,
                match_type="EXACT",
                requires_review=False,
                details=f"Exact match on registered alias {alias.alias}"
            )

        # If OCR confidence is too low, do not attempt fuzzy alerts
        if ocr_confidence < self.min_ocr_confidence:
            return WatchlistMatchResult(
                matched=False,
                details=f"OCR confidence {ocr_confidence:.2f} below threshold for fuzzy consideration."
            )

        # 3. Bounded Fuzzy Matching across candidates (prefix or similar length)
        candidates = query.all()
        best_candidate: Optional[WatchlistEntity] = None
        highest_score = 0.0

        for cand in candidates:
            # Candidate length pruning: distance > 2 cannot match high threshold
            if abs(len(cand.normalized_identifier) - len(normalized)) > 2:
                continue

            score = calculate_similarity(normalized, cand.normalized_identifier)
            if score > highest_score:
                highest_score = score
                best_candidate = cand

        if best_candidate:
            if highest_score >= self.fuzzy_high_threshold and ocr_confidence >= 0.80:
                return WatchlistMatchResult(
                    matched=True,
                    entity=best_candidate,
                    similarity_score=round(highest_score, 3),
                    match_type="FUZZY",
                    requires_review=False,
                    details=f"High-confidence fuzzy match with {best_candidate.identifier} ({highest_score:.2f})"
                )
            elif highest_score >= self.fuzzy_review_threshold and ocr_confidence >= self.min_ocr_confidence:
                return WatchlistMatchResult(
                    matched=True,
                    entity=best_candidate,
                    similarity_score=round(highest_score, 3),
                    match_type="FUZZY",
                    requires_review=True,
                    details=f"Borderline fuzzy match requiring operator review: {best_candidate.identifier} ({highest_score:.2f})"
                )

        return WatchlistMatchResult(matched=False, similarity_score=highest_score, details="No match found.")

watchlist_matcher = WatchlistMatcher()
