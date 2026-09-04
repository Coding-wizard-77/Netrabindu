from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import List, Optional


@dataclass
class EvidenceSnapshot:
    timestamp: datetime
    uri: Optional[str] = None
    checksum: Optional[str] = None


@dataclass
class RollingEvidenceBuffer:
    max_seconds: int = 30
    pre_event_seconds: int = 10
    post_event_seconds: int = 10
    frames: List[EvidenceSnapshot] = field(default_factory=list)

    def append(
        self,
        uri: Optional[str] = None,
        checksum: Optional[str] = None,
        timestamp: Optional[datetime] = None,
    ) -> EvidenceSnapshot:
        snapshot_time = (timestamp or datetime.now(timezone.utc)).astimezone(timezone.utc)
        snapshot = EvidenceSnapshot(
            timestamp=snapshot_time,
            uri=uri,
            checksum=checksum,
        )
        self.frames.append(snapshot)

        # Keep a bounded in-memory ring so this remains production-safe while still
        # preserving the most recent context for edge evidence windows.
        cutoff = snapshot_time - timedelta(seconds=self.max_seconds)
        self.frames = [frame for frame in self.frames if frame.timestamp >= cutoff]
        return snapshot

    def snapshot_for_event(self, event_time: Optional[datetime] = None) -> List[EvidenceSnapshot]:
        if not self.frames:
            return []

        anchor = (event_time or self.frames[-1].timestamp).astimezone(timezone.utc)
        start = anchor - timedelta(seconds=self.pre_event_seconds)
        end = anchor + timedelta(seconds=self.post_event_seconds)
        return [
            frame for frame in sorted(self.frames, key=lambda item: item.timestamp)
            if start <= frame.timestamp <= end
        ]
