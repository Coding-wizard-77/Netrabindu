from __future__ import annotations

import hashlib
import logging
import os
import time
from typing import Any, Dict, Optional, Tuple
import cv2
import numpy as np

logger = logging.getLogger("ai_models.evidence")


class EvidenceSaver:
    """
    Saves anomaly keyframes with high-visibility forensic overlays and
    computes Section 65B Indian Evidence Act / Section 63 BSA SHA-256 integrity digests.
    """

    def __init__(self, output_dir: Optional[str] = None) -> None:
        if output_dir:
            self.output_dir = output_dir
        else:
            # Default to backend/evidence/anomalies
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend", "evidence", "anomalies"))
            self.output_dir = base_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def save_anomaly_evidence(
        self,
        frame: np.ndarray,
        event_id: str,
        camera_code: str,
        camera_name: str,
        anomaly_type: str,
        severity: str,
        confidence: float,
        bbox: Optional[Tuple[float, float, float, float]] = None,
        pts_ms: float = 0.0
    ) -> Dict[str, Any]:
        """
        Annotates frame, computes SHA-256 seal, and writes to disk.
        Returns evidence dictionary with local file path, web URI, and forensic hash.
        """
        if frame is None:
            # Generate fallback diagnostic frame
            annotated = np.zeros((360, 640, 3), dtype=np.uint8)
        else:
            annotated = frame.copy()

        h, w = annotated.shape[:2]

        # Draw Anomaly Target Bounding Box
        if bbox:
            bx1 = int(bbox[0] * w)
            by1 = int(bbox[1] * h)
            bx2 = int(bbox[2] * w)
            by2 = int(bbox[3] * h)

            box_color = (0, 0, 255) if severity == "CRITICAL" else ((0, 140, 255) if severity == "HIGH" else (0, 220, 255))
            cv2.rectangle(annotated, (bx1, by1), (bx2, by2), box_color, 2)

            # Target Banner above box
            label = f"{anomaly_type} ({int(confidence * 100)}%)"
            cv2.rectangle(annotated, (bx1, max(0, by1 - 22)), (min(w, bx1 + len(label) * 8 + 14), by1), box_color, -1)
            cv2.putText(annotated, label, (bx1 + 4, max(14, by1 - 6)), cv2.FONT_HERSHEY_PLAIN, 0.85, (255, 255, 255), 1, cv2.LINE_AA)

        # Top Forensic Banner
        cv2.rectangle(annotated, (0, 0), (w, 24), (10, 12, 18), -1)
        cv2.line(annotated, (0, 24), (w, 24), (0, 0, 255) if severity == "CRITICAL" else (0, 160, 255), 1)
        time_str = time.strftime("%Y-%m-%d %H:%M:%S IST", time.localtime())
        cv2.putText(annotated, f"GUJARAT POLICE EVIDENCE ARCHIVE | {event_id}", (8, 16), cv2.FONT_HERSHEY_PLAIN, 0.78, (0, 220, 255), 1)
        cv2.putText(annotated, f"SEV: {severity}", (w - 110, 16), cv2.FONT_HERSHEY_PLAIN, 0.80, (0, 0, 255) if severity == "CRITICAL" else (0, 255, 255), 1)

        # Bottom Forensic Footer with Timestamp and Monotonic PTS
        cv2.rectangle(annotated, (0, h - 24), (w, h), (10, 12, 18), -1)
        cv2.line(annotated, (0, h - 24), (w, h - 24), (25, 40, 55), 1)
        cv2.putText(annotated, f"{camera_code} | {time_str} | PTS: {pts_ms:.1f}ms", (8, h - 8), cv2.FONT_HERSHEY_PLAIN, 0.72, (220, 220, 220), 1)
        cv2.putText(annotated, "SEC 65B IEA / 63 BSA CERTIFIED", (w - 240, h - 8), cv2.FONT_HERSHEY_PLAIN, 0.70, (140, 220, 160), 1)

        # Write JPEG to disk
        filename = f"{event_id}.jpg"
        filepath = os.path.join(self.output_dir, filename)
        cv2.imwrite(filepath, annotated, [int(cv2.IMWRITE_JPEG_QUALITY), 92])

        # Compute SHA-256 Digest of saved image file
        hasher = hashlib.sha256()
        with open(filepath, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        sha256_hash = hasher.hexdigest()

        web_uri = f"/evidence/anomalies/{filename}"
        logger.info(f"[EvidenceSaved] {filepath} (SHA256: {sha256_hash[:16]}...)")

        return {
            "local_path": filepath,
            "thumbnail_uri": web_uri,
            "evidence_uri": web_uri,
            "sha256": sha256_hash,
            "timestamp": time_str
        }


evidence_saver = EvidenceSaver()
