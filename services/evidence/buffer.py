from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional


@dataclass
class EvidenceSnapshot:
    timestamp: str
    uri: Optional[str] = None
    checksum: Optional[str] = None


@dataclass
class RollingEvidenceBuffer:
    max_seconds: int = 30
    pre_event_seconds: int = 10
    post_event_seconds: int = 10
    frames: List[EvidenceSnapshot] = field(default_factory=list)

    def append(self, uri: Optional[str] = None, checksum: Optional[str] = None) -> EvidenceSnapshot:
        snapshot = EvidenceSnapshot(
            timestamp=datetime.now(timezone.utc).isoformat(),
            uri=uri,
            checksum=checksum,
        )
        self.frames.append(snapshot)
        if len(self.frames) > self.max_seconds:
            self.frames.pop(0)
        return snapshot

    def snapshot_for_event(self) -> List[EvidenceSnapshot]:
        return list(self.frames)
