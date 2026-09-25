from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Tuple


def _compute_iou(b1: Tuple[float, float, float, float], b2: Tuple[float, float, float, float]) -> float:
    x1 = max(b1[0], b2[0])
    y1 = max(b1[1], b2[1])
    x2 = min(b1[2], b2[2])
    y2 = min(b1[3], b2[3])
    inter = max(0.0, x2 - x1) * max(0.0, y2 - y1)
    a1 = max(0.0, b1[2] - b1[0]) * max(0.0, b1[3] - b1[1])
    a2 = max(0.0, b2[2] - b2[0]) * max(0.0, b2[3] - b2[1])
    denom = a1 + a2 - inter
    return inter / denom if denom > 0 else 0.0


@dataclass
class Track:
    track_id: int
    class_id: int
    bbox: Tuple[float, float, float, float]
    confidence: float
    hits: int = 1
    age: int = 0


class ByteTrackTracker:
    """Production-grade multi-object tracker for Engineer 2 cascaded pipeline.
    Implements IoU spatial-temporal association, track lifecycle management,
    and redundant detection suppression.
    """

    def __init__(self, iou_threshold: float = 0.35, max_lost: int = 30) -> None:
        self.tracks: Dict[int, Track] = {}
        self._next_id = 1
        self.iou_threshold = iou_threshold
        self.max_lost = max_lost

    def update(self, detections: Iterable[Tuple[int, float, float, float, float, float]]) -> List[Track]:
        matched_tracks: List[Track] = []
        unmatched_dets = []
        assigned_track_ids = set()

        # Age all current tracks
        for trk in self.tracks.values():
            trk.age += 1

        # Match incoming detections with active tracks using highest IoU
        for detection in detections:
            class_id, confidence, x1, y1, x2, y2 = detection
            det_bbox = (float(x1), float(y1), float(x2), float(y2))

            best_iou = 0.0
            best_track_id: Optional[int] = None

            for trk_id, trk in self.tracks.items():
                if trk_id in assigned_track_ids:
                    continue
                # Optional class check; tolerate general target tracking
                if trk.class_id == class_id or trk.class_id in (1, 2):
                    iou = _compute_iou(trk.bbox, det_bbox)
                    if iou > best_iou and iou >= self.iou_threshold:
                        best_iou = iou
                        best_track_id = trk_id

            if best_track_id is not None:
                assigned_track_ids.add(best_track_id)
                trk = self.tracks[best_track_id]
                trk.bbox = det_bbox
                trk.confidence = confidence
                trk.hits += 1
                trk.age = 0
                matched_tracks.append(trk)
            else:
                unmatched_dets.append((class_id, confidence, det_bbox))

        # Create new tracks for unmatched detections
        seen_bboxes = set()
        for class_id, confidence, det_bbox in unmatched_dets:
            bbox_key = (round(det_bbox[0], 2), round(det_bbox[1], 2), round(det_bbox[2], 2), round(det_bbox[3], 2))
            if bbox_key in seen_bboxes:
                continue
            seen_bboxes.add(bbox_key)

            new_track = Track(
                track_id=self._next_id,
                class_id=class_id,
                bbox=det_bbox,
                confidence=confidence,
                hits=1,
                age=0,
            )
            self.tracks[new_track.track_id] = new_track
            matched_tracks.append(new_track)
            self._next_id += 1

        # Prune dead tracks that exceeded max_lost frames
        dead_ids = [tid for tid, trk in self.tracks.items() if trk.age > self.max_lost]
        for tid in dead_ids:
            del self.tracks[tid]

        return matched_tracks

    def should_skip_detection(self, bbox: Tuple[float, float, float, float], min_hits: int = 2, iou_thresh: float = 0.40) -> bool:
        """Determines if a candidate ROI is already stably tracked across recent frames.
        Allows edge nodes to skip redundant re-detection passes.
        """
        for trk in self.tracks.values():
            if trk.hits >= min_hits and trk.age == 0:
                if _compute_iou(trk.bbox, bbox) >= iou_thresh:
                    return True
        return False

    def active_tracks(self) -> List[Track]:
        """Returns currently visible and active tracks."""
        return [t for t in self.tracks.values() if t.age == 0]

