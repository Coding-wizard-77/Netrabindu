#!/usr/bin/env python3
"""Continuously fetch snapshots from the backend and run YOLO detections.

Usage: 
  PYTHONPATH=/path/to/Netrabindu /path/to/python scripts/live_detection_client.py CAM_CODE [--interval 1.0] [--count 0]

Examples:
  # run 5 iterations at 1s interval
  PYTHONPATH=/home/atul-ravi/Desktop/GujHack/Netrabindu /home/atul-ravi/Desktop/GujHack/.venv/bin/python scripts/live_detection_client.py GJ-PAN-CAM-34 --interval 1.0 --count 5

The script prints one JSON object per detection cycle to stdout.
"""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import time
import argparse
import json
import os
import hashlib
import uuid
from urllib.parse import urljoin

import requests
import numpy as np
import cv2

from ai_models.models.yolo_detector import yolo_detector

BASE = "http://127.0.0.1:8000"


def fetch_snapshot_bytes(camera_code: str, timeout: int = 10) -> bytes:
    ts = int(time.time() * 1000)
    url = f"{BASE}/stream/{camera_code}/snapshot?t={ts}"
    r = requests.get(url, timeout=timeout)
    r.raise_for_status()
    return r.content


def bytes_to_bgr(img_bytes: bytes):
    arr = np.frombuffer(img_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    return img


def sha256_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


def save_crop_and_frame(img_bytes: bytes, crop_coords, save_dir: str):
    img = bytes_to_bgr(img_bytes)
    x1, y1, x2, y2 = crop_coords
    h, w = img.shape[:2]
    x1 = max(0, int(x1))
    y1 = max(0, int(y1))
    x2 = min(w, int(x2))
    y2 = min(h, int(y2))
    crop = img[y1:y2, x1:x2]

    uid = uuid.uuid4().hex
    frame_path = os.path.join(save_dir, f"frame_{uid}.jpg")
    crop_path = os.path.join(save_dir, f"crop_{uid}.jpg")
    annot_path = os.path.join(save_dir, f"frame_annot_{uid}.jpg")
    meta_path = os.path.join(save_dir, f"meta_{uid}.json")

    # save full frame (original bytes)
    with open(frame_path, "wb") as f:
        f.write(img_bytes)

    # draw bbox on a copy for annotation
    try:
        img_annot = img.copy()
        cv2.rectangle(img_annot, (x1, y1), (x2, y2), (0, 0, 255), 2)
        cv2.putText(img_annot, "ANOMALY", (x1, max(12, y1 - 6)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
        cv2.imwrite(annot_path, img_annot)
    except Exception:
        annot_path = None

    # save crop if non-empty and compute sha256s
    crop_sha = None
    frame_sha = None
    crop_saved = None
    try:
        # compute frame sha from original bytes
        frame_sha = sha256_bytes(img_bytes)
    except Exception:
        frame_sha = None

    try:
        if crop is not None and crop.size > 0:
            ok, enc = cv2.imencode('.jpg', crop)
            if ok:
                crop_bytes = enc.tobytes()
                with open(crop_path, 'wb') as f:
                    f.write(crop_bytes)
                crop_sha = sha256_bytes(crop_bytes)
                crop_saved = crop_path
    except Exception:
        crop_saved = None

    # write metadata
    meta = {
        "uid": uid,
        "frame_path": frame_path,
        "annotated_frame_path": annot_path,
        "crop_path": crop_saved,
        "frame_sha256": frame_sha,
        "crop_sha256": crop_sha,
        "bbox": [x1, y1, x2, y2],
        "timestamp_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    try:
        with open(meta_path, 'w') as f:
            json.dump(meta, f)
    except Exception:
        pass

    return frame_path, crop_saved


def run_live(camera_code: str, interval: float = 1.0, count: int = 0, *, publish: bool = False, save_dir: str = None, threshold: float = 0.8):
    i = 0
    if save_dir:
        ensure_dir(save_dir)
    camera_id_for_publish = None
    if publish:
        # resolve camera id from ingest catalogue
        try:
            cats = requests.get(urljoin(BASE, "/api/ingest"), timeout=10).json().get("catalogue", [])
            for c in cats:
                if c.get("camera_code") == camera_code or c.get("id") == camera_code:
                    camera_id_for_publish = c.get("id")
                    break
        except Exception:
            camera_id_for_publish = None
    while True:
        before = time.time()
        try:
            img_bytes = fetch_snapshot_bytes(camera_code)
            detections = yolo_detector.detect_objects(img_bytes)

            out = {
                "ts": int(before * 1000),
                "camera": camera_code,
                "detections": detections,
            }

            # Check for anomaly: any detection with confidence >= threshold
            is_anomaly = False
            max_conf = 0.0
            for d in detections:
                conf = float(d.get("confidence", 0.0))
                if conf > max_conf:
                    max_conf = conf
                if conf >= threshold:
                    is_anomaly = True

            # Save evidence locally if requested and anomaly found
            evidence = {}
            if is_anomaly and save_dir:
                # attempt to save first detection crop if available
                first = detections[0]
                crop_coords = first.get("plate_crop_coords") or first.get("bbox")
                if crop_coords:
                    frame_path, crop_path = save_crop_and_frame(img_bytes, crop_coords, save_dir)
                    evidence = {"frame_path": frame_path, "crop_path": crop_path}

            # Optionally publish to backend /api/events
            if is_anomaly and publish:
                event = {
                    "event_id": uuid.uuid4().hex,
                    "event_type": "ANPR",
                    "camera_id": camera_id_for_publish or camera_code,
                    "occurred_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(before)),
                    "identifier": {
                        "raw": detections[0].get("label") if detections else "",
                        "normalized": detections[0].get("label") if detections else "",
                        "confidence": max_conf,
                    },
                    "evidence": evidence,
                    "pipeline": {"detections": detections},
                    "confidence": max_conf,
                }
                try:
                    r = requests.post(urljoin(BASE, "/api/events"), json=event, timeout=10)
                    r.raise_for_status()
                    out["published"] = True
                    out["publish_response"] = r.json()
                except Exception as e:
                    out["published"] = False
                    out["publish_error"] = str(e)

            print(json.dumps(out, ensure_ascii=False))

        except Exception as e:
            err = {"ts": int(time.time() * 1000), "camera": camera_code, "error": str(e)}
            print(json.dumps(err, ensure_ascii=False))

        i += 1
        if count and i >= count:
            break
        elapsed = time.time() - before
        wait = max(0.0, interval - elapsed)
        time.sleep(wait)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("camera_code")
    p.add_argument("--interval", type=float, default=1.0, help="Seconds between snapshots")
    p.add_argument("--count", type=int, default=0, help="Number of iterations (0 = forever)")
    p.add_argument("--save-dir", type=str, default=None, help="Directory to save evidence when anomaly detected")
    p.add_argument("--publish", action="store_true", help="POST anomaly events to backend /api/events")
    p.add_argument("--threshold", type=float, default=0.8, help="Confidence threshold to treat detection as anomaly")
    args = p.parse_args()

    print(json.dumps({"started": True, "camera": args.camera_code, "interval": args.interval}))
    run_live(args.camera_code, args.interval, args.count, publish=args.publish, save_dir=args.save_dir, threshold=args.threshold)


if __name__ == "__main__":
    main()
