# Netrabindu: High-Level Architecture Design (HLD)

## 1. System Overview
Netrabindu is a hybrid, edge-first, federation-routed CCTV intelligence and command platform tailored for the Gujarat Police CCTV infrastructure (~80,000 camera scale capability across 26 fragmented departmental silos).

```
   +-------------------------------------------------------------+
   |                  CAMERA / DEPARTMENT NETWORK                |
   |   [Direct RTSP/ONVIF]    [Hikvision/Milestone VMS Systems]  |
   +------------------------------+------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                     REGIONAL EDGE NODE                      |
   |  - MediaMTX Stream Gateway (WebRTC/HLS/RTSP Relay)          |
   |  - Adaptive Sentinel (Always-on low compute)                |
   |  - Adaptive Quality / Dynamic FPS Controller                |
   |  - Cascaded AI: Vehicle -> ROI -> Plate -> CRNN OCR        |
   |  - Rolling Pre/Post Event Evidence Circular Buffer          |
   +------------------------------+------------------------------+
                                  |
                 [Redpanda / Kafka Event Bus]
                                  |
                                  v
   +-------------------------------------------------------------+
   |                       STATE CORE (E1)                       |
   |  - FastAPI Control Plane (Auth, RBAC, Scoped Registry)      |
   |  - PostgreSQL + PostGIS (Spatial Registry, Event Index)     |
   |  - Watchlist & Fuzzy Correlation Engine                     |
   |  - Real-time Alerting & WebSocket Gateway                   |
   |  - Vehicle Route Reconstruction Engine (Gap-aware)          |
   |  - Health Monitor & Tamper-Evident Audit Logging            |
   +------------------------------+------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                 REACT COMMAND CENTER (E3)                   |
   |  - Real-time GIS Mapping (Leaflet)                          |
   |  - Low-latency WebRTC Stream Viewer                         |
   |  - Live Alert Feed & Investigation Workspace                |
   +-------------------------------------------------------------+
```

## 2. Core Architectural Pillars
1. **Registry-Anchored Control Plane**: The database is the authoritative state of truth for camera identity (UUID), geometry (PostGIS Point SRID 4326), ownership, credentials, and telemetry. Raw video never traverses the central API.
2. **Heterogeneous Federation**: Standalone IP cameras connect directly via RTSP/ONVIF; legacy departmental systems connect via pluggable `VMSAdapter` interfaces.
3. **Adaptive Video & AI**: Edge nodes run always-on sentinels, escalating stream profile and model complexity only when activity or high-value targets are spotted, drastically reducing WAN traffic.
4. **Resilient Event Plane**: Redpanda/Kafka topics decouple edge inference from central correlation. Application-level idempotency prevents duplicate alerts.
5. **Observed-Only GIS Routes**: Vehicle trajectories are composed strictly of verified camera sightings; unobserved corridors are explicitly rendered as gaps rather than fabricated lines.
