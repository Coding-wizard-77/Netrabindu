from __future__ import annotations

from math import sqrt
from typing import Sequence


class LightweightReIDAdapter:
    """Simple embedding comparator aligned to the E2 Re-ID contract."""

    def __init__(self, threshold: float = 0.8) -> None:
        self.threshold = threshold

    def _vector(self, embedding: Sequence[float]):
        values = [float(value) for value in embedding]
        if not values:
            return []
        return values

    def compare(self, embedding_a: Sequence[float], embedding_b: Sequence[float]) -> float:
        a = self._vector(embedding_a)
        b = self._vector(embedding_b)
        if not a or not b:
            return 0.0

        length = min(len(a), len(b))
        a_slice = a[:length]
        b_slice = b[:length]
        if len(a_slice) != len(b_slice):
            pad = [0.0] * abs(len(a_slice) - len(b_slice))
            if len(a_slice) < len(b_slice):
                a_slice.extend(pad)
            else:
                b_slice.extend(pad)

        deltas = [abs(x - y) for x, y in zip(a_slice, b_slice)]
        mean_distance = sum(deltas) / len(deltas) if deltas else 0.0
        similarity = 1.0 - min(1.0, mean_distance)
        return max(0.0, min(1.0, similarity))

    def is_match(self, embedding_a: Sequence[float], embedding_b: Sequence[float]) -> bool:
        return self.compare(embedding_a, embedding_b) >= self.threshold
