from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, List, Tuple


@dataclass
class Track:
    track_id: int
    class_id: int
    bbox: Tuple[float, float, float, float]
    confidence: float


class ByteTrackTracker:
    """Tracker compatibility layer for the Engineer 2 pipeline."""

    def __init__(self) -> None:
        self.tracks: Dict[int, Track] = {}
        self._next_id = 1

    def update(self, detections: Iterable[Tuple[int, float, float, float, float, float]]) -> List[Track]:
        tracks: List[Track] = []
        seen_bboxes = set()
        for idx, detection in enumerate(detections):
            class_id, confidence, x1, y1, x2, y2 = detection
            bbox_key = (round(float(x1), 2), round(float(y1), 2), round(float(x2), 2), round(float(y2), 2))
            if bbox_key in seen_bboxes:
                continue
            seen_bboxes.add(bbox_key)
            track = Track(
                track_id=self._next_id + idx,
                class_id=class_id,
                bbox=(x1, y1, x2, y2),
                confidence=confidence,
            )
            self.tracks[track.track_id] = track
            tracks.append(track)
        self._next_id += max(1, len(tracks))
        return tracks

    def active_tracks(self) -> List[Track]:
        return list(self.tracks.values())
