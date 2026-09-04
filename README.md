# NetraBindu — Hybrid Edge-First CCTV Intelligence Platform

> Gujarat Police Innovation Challenge 2026

## 1. Project Overview

NetraBindu is a hybrid, edge-first CCTV intelligence platform designed to integrate heterogeneous IP cameras, NVRs and departmental VMS systems into a unified command and investigation platform.

The system combines:

- Heterogeneous camera/VMS integration
- Regional/departmental edge processing
- Adaptive video quality and inference
- AI-powered video analytics
- ANPR and OCR
- Person, vehicle and object detection
- Multi-object tracking
- Person and vehicle re-identification
- Watchlist correlation
- Real-time alerts
- Vehicle movement timelines
- GIS-based observed-route visualization
- Evidence capture and investigation
- Centralized monitoring and audit
- Architecture capable of scaling toward approximately 80,000 cameras

The key architectural innovation is that the platform does **not** treat every camera as a permanently high-bandwidth, high-compute stream.

Instead, intelligence is pushed toward the edge and the system dynamically allocates:

- bandwidth
- video quality
- frame rate
- inference compute
- storage

according to actual scene activity, task relevance and AI confidence.

---

# 2. Core Architecture

```text
                         ┌───────────────────────────┐
                         │     Cameras / NVRs / VMS   │
                         │  RTSP / ONVIF / Vendor API │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │       Regional Edge        │
                         │                           │
                         │  Media / Decode            │
                         │  Activity Sentinel         │
                         │  Adaptive Quality          │
                         │  Adaptive FPS              │
                         │  Adaptive Inference        │
                         │  ROI Extraction            │
                         │                           │
                         │  ┌─────────────────────┐  │
                         │  │     AI Pipeline     │  │
                         │  │                     │  │
                         │  │ Vehicle Detection   │  │
                         │  │ Plate Detection     │  │
                         │  │ OCR / ANPR          │  │
                         │  │ Person Detection    │  │
                         │  │ Object Detection    │  │
                         │  │ Tracking             │  │
                         │  │ Person Re-ID         │  │
                         │  │ Vehicle Re-ID        │  │
                         │  └─────────────────────┘  │
                         │                           │
                         │  Rolling Evidence Buffer  │
                         └─────────────┬─────────────┘
                                       │
                         Events / Metadata / Evidence
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │     Event Bus              │
                         │     Redpanda / Kafka       │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
              ┌─────────────────────────────────────────────┐
              │             Central Platform                │
              │                                             │
              │ Camera Registry                              │
              │ VMS Federation                              │
              │ Event Processing                             │
              │ Watchlist Correlation                        │
              │ Alert Management                             │
              │ Vehicle Route Engine                         │
              │ PostgreSQL / PostGIS                         │
              │ Redis                                        │
              │ Object Storage                               │
              │ Authentication / RBAC                        │
              │ Audit / Health Monitoring                    │
              └──────────────────────┬──────────────────────┘
                                     │
                                     ▼
                         ┌───────────────────────────┐
                         │      React Command        │
                         │         Center            │
                         │                           │
                         │ Dashboard                 │
                         │ Camera Registry           │
                         │ Live View                 │
                         │ Alerts                    │
                         │ Watchlists                │
                         │ Investigation              │
                         │ GIS                       │
                         │ Evidence                  │
                         │ Health / Audit             │
                         └───────────────────────────┘
```

---

# 3. Main Innovation

## Adaptive Edge Video Intelligence

The system continuously evaluates camera activity using a lightweight sentinel.

When a scene is inactive, the camera operates in an economical processing state.

When meaningful activity is detected, the system progressively increases the required video quality and AI processing.

```text
                 LOW ACTIVITY
                      │
                      ▼
                  IDLE STATE
                      │
             Sentinel detects activity
                      │
                      ▼
                NORMAL STATE
                      │
             Relevant target detected
                      │
                      ▼
                ACTIVE STATE
                      │
       High-value / uncertain event
                      │
                      ▼
               CRITICAL STATE
```

The controller can adapt:

- resolution
- frame rate
- bitrate
- inference frequency
- model complexity
- ROI processing
- evidence preservation

The exact camera capabilities determine which controls can actually be applied.

---

# 4. Cascaded AI Processing

The system avoids running expensive AI models unnecessarily.

## ANPR

```text
Camera
  ↓
Activity Sentinel
  ↓
Vehicle Detection
  ↓
Vehicle ROI
  ↓
Plate Detection
  ↓
Plate ROI
  ↓
OCR
  ↓
Plate Normalization
  ↓
Temporal Confidence Fusion
  ↓
ANPR Event
  ↓
Watchlist Correlation
  ↓
Alert
```

## Person Intelligence

```text
Camera
  ↓
Activity Sentinel
  ↓
Person Detection
  ↓
Person ROI
  ↓
Person Re-ID Embedding
  ↓
Watchlist Candidate Retrieval
  ↓
Match Decision
  ↓
Alert / Investigation Event
```

## General Object Intelligence

```text
Camera
  ↓
Activity Sentinel
  ↓
Object / Person / Vehicle Detection
  ↓
ROI Extraction
  ↓
Tracking
  ↓
Task-Specific Analytics
  ↓
Event
```

---

# 5. Repository Structure

This is a **single shared repository**.

The three engineers do not build three independent applications.

```text
NetraBindu/
│
├── README.md
├── TEAM_COORDINATION_MANIFEST.docx
│
├── docs/
│   ├── MASTER_IMPLEMENTATION_GUIDE.docx
│   ├── Engineer_1_Platform_Backend_Integration.docx
│   ├── Engineer_2_Edge_AI_Adaptive_Intelligence.docx
│   ├── Engineer_3_Frontend_Command_Center_GIS.docx
│   │
│   ├── architecture/
│   │   ├── HLD.md
│   │   ├── system-architecture.png
│   │   ├── workflow-integration.png
│   │   └── data-flow.png
│   │
│   └── contracts/
│       ├── api-contract.md
│       ├── event-contract.md
│       └── CHANGELOG.md
│
├── apps/
│   ├── api/                         # Engineer 1
│   └── web/                         # Engineer 3
│
├── services/
│   ├── camera_registry/             # Engineer 1
│   ├── ingestion/                   # Engineer 1
│   ├── federation/                  # Engineer 1
│   ├── events/                      # Engineer 1
│   ├── watchlist/                   # Engineer 1
│   ├── correlation/                 # Engineer 1
│   ├── alerts/                      # Engineer 1
│   ├── route_engine/                # Engineer 1
│   ├── health_monitor/              # Engineer 1
│   ├── audit/                       # Engineer 1
│   │
│   ├── analytics/                   # Engineer 2
│   ├── adaptive_edge/               # Engineer 2
│   └── evidence/                    # Engineer 2
│
├── adapters/                        # Engineer 1
├── models/                          # Engineer 2
├── migrations/                      # Engineer 1
├── infra/                           # Engineer 1
├── scripts/                         # Engineer 1
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── load/
│
├── evidence/
│   ├── screenshots/
│   ├── demo-videos/
│   ├── anpr-results/
│   ├── route-reports/
│   └── performance/
│
├── .env.example
├── .gitignore
└── docker-compose.yml
```

---

# 6. Engineer Ownership

## Engineer 1 — Platform / Backend / Integration

Owns:

- FastAPI
- PostgreSQL/PostGIS
- Redis
- Camera registry
- Camera onboarding
- RTSP/ONVIF
- VMS federation
- Event bus
- Watchlists
- Correlation
- Alerts
- Vehicle route engine
- Authentication/RBAC
- Health monitoring
- Audit
- Infrastructure
- Docker
- Database migrations

Primary directories:

```text
apps/api/
services/camera_registry/
services/ingestion/
services/federation/
services/events/
services/watchlist/
services/correlation/
services/alerts/
services/route_engine/
services/health_monitor/
services/audit/
adapters/
migrations/
infra/
scripts/
```

---

# 7. Engineer 2 — Edge AI / Adaptive Intelligence

Owns:

- Activity sentinel
- Adaptive resolution
- Adaptive FPS
- Adaptive bitrate policy
- Adaptive inference
- ROI extraction
- Vehicle detection
- Plate detection
- OCR
- ANPR
- Person detection
- Object detection
- Multi-object tracking
- Person Re-ID
- Vehicle Re-ID
- Confidence escalation
- Evidence buffer
- AI benchmarking
- AI telemetry

Primary directories:

```text
services/analytics/
services/adaptive_edge/
services/evidence/
models/
```

Engineer 2 produces normalized events.

Engineer 2 does **not** directly write to the central PostgreSQL database.

---

# 8. Engineer 3 — Frontend / Command Center / GIS

Owns:

- React
- TypeScript
- Dashboard
- Camera registry UI
- Camera onboarding UI
- Live viewing
- Adaptive intelligence visualization
- ANPR visualization
- Alerts
- Watchlists
- Vehicle investigation
- GIS
- Evidence viewer
- Health dashboard
- Audit UI
- End-to-end frontend tests

Primary directory:

```text
apps/web/
```

Engineer 3 consumes backend APIs and WebSocket events.

Engineer 3 does **not** connect directly to PostgreSQL or RTSP.

---

# 9. Technology Stack

## Frontend

```text
React
TypeScript
Vite
Tailwind CSS
Leaflet / OpenStreetMap-compatible maps
```

## Backend

```text
Python
FastAPI
Pydantic
SQLAlchemy
Alembic
```

## Database

```text
PostgreSQL
PostGIS
Redis
```

## Event Infrastructure

```text
Redpanda / Kafka
```

## Video

```text
RTSP
ONVIF
FFmpeg
MediaMTX
WebRTC
HLS
```

## AI

```text
PyTorch
OpenCV
ONNX Runtime
TensorRT where supported

YOLO-family detection models
Dedicated license-plate detection
PaddleOCR
ByteTrack
Person Re-ID
Vehicle Re-ID
```

## Storage

```text
MinIO / S3-compatible object storage
```

## Monitoring

```text
Prometheus
Grafana
OpenTelemetry
```

## Deployment

```text
Docker
Docker Compose

Kubernetes is a later scale target.
```

---

# 10. Integration Contracts

The following contracts are shared and must not be changed silently.

## Camera Identity

Every camera has one immutable identifier:

```text
camera_id
```

The identifier must remain stable even if:

- IP changes
- VMS changes
- stream URL changes
- camera configuration changes

---

## AI Event Flow

```text
Engineer 2
    │
    │ Detection / ANPR / Re-ID event
    ▼
Redpanda / Kafka
    │
    ▼
Engineer 1
    │
    ├── PostgreSQL
    ├── Watchlist
    ├── Correlation
    ├── Alert
    └── Route Engine
             │
             ▼
        Engineer 3
             │
             ▼
        React UI
```

---

# 11. Critical Rules

## Rule 1 — No Mock Production Data

Never hard-code:

```text
camera counts
online cameras
ANPR results
alerts
vehicle routes
watchlist matches
health status
event timestamps
```

The application must derive these from actual system state.

---

## Rule 2 — No Direct Database Access from Frontend

Correct:

```text
React → FastAPI → PostgreSQL
```

Incorrect:

```text
React → PostgreSQL
```

---

## Rule 3 — No Direct RTSP in Browser

Correct:

```text
Camera
  ↓
MediaMTX
  ↓
Authorized WebRTC/HLS session
  ↓
Browser
```

---

## Rule 4 — AI Does Not Own the Central Database

Correct:

```text
AI Worker
  ↓
Event Bus
  ↓
Backend
  ↓
Database
```

---

## Rule 5 — Contracts Are Frozen

Before changing:

- API fields
- event fields
- event names
- endpoint names
- camera IDs
- WebSocket messages

update:

```text
docs/contracts/CHANGELOG.md
```

and coordinate with all affected engineers.

---

# 12. Git Workflow

Use one repository.

Recommended branches:

```text
main

engineer1/platform
engineer1/integration

engineer2/edge-ai
engineer2/anpr
engineer2/adaptive

engineer3/frontend
engineer3/gis
engineer3/dashboard
```

Do not keep branches disconnected for long periods.

Merge frequently after tests pass.

---

# 13. Initial Development Order

## Phase 1 — Platform Skeleton

Engineer 1:

```text
FastAPI
PostgreSQL
Redis
Docker Compose
Authentication
Camera registry
Basic REST APIs
```

Engineer 2:

```text
AI worker skeleton
Media ingestion
Sentinel
Model loading
Basic detection
```

Engineer 3:

```text
React
Authentication screen
Dashboard shell
Camera registry UI
API client
```

---

## Phase 2 — First Real Camera

The first milestone is:

```text
REAL CAMERA
    ↓
RTSP
    ↓
MediaMTX
    ↓
Edge AI
    ↓
Detection
    ↓
Event
    ↓
Backend
    ↓
Database
    ↓
React Dashboard
```

Do not proceed to large-scale feature development until this path works.

---

# 14. First End-to-End Demo Target

The minimum successful integrated flow is:

```text
1. Start platform
       ↓
2. Login
       ↓
3. Add real camera
       ↓
4. Validate stream
       ↓
5. Open live view
       ↓
6. Activity detected
       ↓
7. Adaptive quality changes
       ↓
8. Vehicle detected
       ↓
9. Plate detected
       ↓
10. OCR performed
       ↓
11. ANPR event created
       ↓
12. Event reaches backend
       ↓
13. Watchlist correlation
       ↓
14. Alert generated
       ↓
15. Alert appears in UI
       ↓
16. Search vehicle
       ↓
17. Timeline displayed
       ↓
18. GIS observed route displayed
       ↓
19. Evidence opened
       ↓
20. Audit record available
```

---

# 15. Definition of Done

The project is not considered functionally complete because the UI looks finished.

The critical path must demonstrate:

- Real camera onboarding
- Real stream validation
- Real live video
- Real edge processing
- Real adaptive state changes
- Real vehicle/person/object detection
- Real ANPR
- Real OCR
- Real tracking
- Real Re-ID where implemented
- Real event delivery
- Real persistence
- Real watchlist correlation
- Real alerts
- Real evidence
- Real vehicle timeline
- Real GIS visualization
- Real health monitoring
- Real audit logging

---

# 16. Important Architecture Principle

The goal is **not**:

> Send every frame from every camera to a central server and run every AI model continuously.

The goal is:

> **Use intelligence at the edge to determine what deserves bandwidth, compute, storage and human attention.**

Therefore:

```text
80,000 cameras connected
          ≠
80,000 HD streams continuously transported centrally
```

The central platform primarily receives:

```text
Events
Metadata
Health
Telemetry
Evidence
Selected video
```

while full live video is accessed on demand.

---

# 17. Documentation

Before implementing a major change, check:

```text
TEAM_COORDINATION_MANIFEST.docx
```

Then read the engineer-specific document:

```text
docs/Engineer_1_Platform_Backend_Integration.docx
docs/Engineer_2_Edge_AI_Adaptive_Intelligence.docx
docs/Engineer_3_Frontend_Command_Center_GIS.docx
```

The master architecture and detailed requirements are in:

```text
docs/MASTER_IMPLEMENTATION_GUIDE.docx
```

Shared contracts are maintained under:

```text
docs/contracts/
```

---

# 18. Final Principle

Build **one integrated platform**, not three separate projects.

```text
             ENGINEER 1
          Platform / Backend
                 │
                 │ contracts
                 ▼
             ENGINEER 2
          Edge AI / Analytics
                 │
                 │ events
                 ▼
             ENGINEER 1
       Correlation / Alerts
                 │
                 │ APIs / WebSocket
                 ▼
             ENGINEER 3
        Command Center / GIS
```

Every engineer should be able to work independently inside their ownership boundary while continuously integrating against the same contracts.

**If a change can break another engineer's module, it is a shared contract change and must be coordinated before merging.**
