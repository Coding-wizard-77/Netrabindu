from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Any, Dict, Optional


@dataclass
class PipelineContext:
    node_id: str
    model_version: str
    source_frame_time: str
    quality_state: str
    inference_tier: str
    escalation_reason: str = ""


@dataclass
class EvidenceRef:
    thumbnail_uri: Optional[str] = None
    clip_uri: Optional[str] = None


@dataclass
class Identifier:
    type: str
    raw: str
    normalized: str
    confidence: float


@dataclass
class Location:
    lat: float
    lon: float


@dataclass
class EdgeEvent:
    event_id: str
    event_type: str
    camera_id: str
    occurred_at: str
    identifier: Identifier
    location: Location
    evidence: EvidenceRef
    pipeline: PipelineContext

    def to_dict(self) -> Dict[str, Any]:
        payload = asdict(self)
        payload["occurred_at"] = self.occurred_at
        return payload


def build_edge_event(
    *,
    event_type: str,
    camera_id: str,
    identifier_type: str,
    raw_identifier: str,
    normalized_identifier: str,
    confidence: float,
    location: tuple[float, float],
    evidence: Optional[EvidenceRef] = None,
    pipeline: Optional[PipelineContext] = None,
) -> EdgeEvent:
    now = datetime.now(timezone.utc).isoformat()
    event = EdgeEvent(
        event_id=f"evt_{int(datetime.now(timezone.utc).timestamp() * 1000)}",
        event_type=event_type,
        camera_id=camera_id,
        occurred_at=now,
        identifier=Identifier(
            type=identifier_type,
            raw=raw_identifier,
            normalized=normalized_identifier,
            confidence=confidence,
        ),
        location=Location(lat=location[0], lon=location[1]),
        evidence=evidence or EvidenceRef(),
        pipeline=pipeline or PipelineContext(
            node_id="edge-default",
            model_version="unknown",
            source_frame_time=now,
            quality_state="Idle",
            inference_tier="economical",
            escalation_reason="",
        ),
    )
    return event
