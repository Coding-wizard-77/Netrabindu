#!/usr/bin/env python3
"""Quick test runner: fetch a snapshot from the ingest snapshot endpoint,
call the YOLO detector, and print JSON detections.

Usage: python scripts/test_feed_detection.py [camera_code]
If camera_code omitted, uses the first camera from /api/ingest catalog.
"""

import sys
import time
import json
from urllib.parse import urljoin

import requests

# Import the project's yolo detector
from ai_models.models.yolo_detector import yolo_detector

BASE = "http://127.0.0.1:8000"


def get_catalogue():
    r = requests.get(urljoin(BASE, "/api/ingest"), timeout=15)
    r.raise_for_status()
    data = r.json()
    return data.get("catalogue", [])


def fetch_snapshot(camera_code: str) -> bytes:
    ts = int(time.time() * 1000)
    url = f"{BASE}/stream/{camera_code}/snapshot?t={ts}"
    r = requests.get(url, timeout=20)
    r.raise_for_status()
    return r.content


def main():
    cam = None
    if len(sys.argv) > 1:
        cam = sys.argv[1]
    else:
        cats = get_catalogue()
        if not cats:
            print("no cameras found in /api/ingest/catalogue", file=sys.stderr)
            sys.exit(2)
        cam = cats[0].get("camera_code") or cats[0].get("id")

    print(f"Using camera: {cam}")

    img_bytes = fetch_snapshot(cam)
    # Detector accepts bytes or numpy array; pass bytes from HTTP response.
    detections = yolo_detector.detect_objects(img_bytes)

    print(json.dumps({"camera": cam, "detections": detections}, indent=2))


if __name__ == "__main__":
    main()
