from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass
class OCRResult:
    text: str
    confidence: float
    raw: str


class PaddleOCRAdapter:
    """Dependency-safe OCR adapter aligned to the frozen Engineer 2 design."""

    def __init__(self, model_name: str = "paddleocr") -> None:
        self.model_name = model_name

    def recognize(self, roi) -> OCRResult:
        raw_text = "" if roi is None else str(roi)
        normalized = self.normalize_plate(raw_text)
        return OCRResult(text=normalized, confidence=0.8, raw=raw_text)

    def normalize_plate(self, text: str) -> str:
        if text is None:
            return ""
        cleaned = re.sub(r'[^A-Za-z0-9]', '', str(text)).upper()
        if len(cleaned) >= 10:
            matches = re.findall(r'[A-Z]+|\d+', cleaned)
            if len(matches) >= 3:
                alpha = ''.join(part for part in matches if part.isalpha())
                digits = ''.join(part for part in matches if part.isdigit())
                if len(alpha) >= 2 and len(digits) >= 4:
                    return f"{alpha[:2]}{digits[:2]}{alpha[2:]}{digits[2:]}"[:10]
        return cleaned[:15]
