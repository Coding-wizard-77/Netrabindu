# High-Level Design (HLD) Document
## Gujarat Police Innovation Challenge 2026: Integrated Video Management & Analytics Platform
### Project: NetraBindu (નેત્રબિંદુ) — Hybrid Sentinel CCTV Intelligence & Statewide Federation

---

## 1. Executive Summary & Problem Understanding

The Government of Gujarat operates over 26 independent departmental CCTV infrastructures comprising analog, IP, and high-definition PTZ/fixed surveillance cameras across geographically dispersed jurisdictions ranging over 1,000 km (from Kutch and Dwarka to Valsad and Dahod). 

Currently, each department (Home/Police, GSRTC, Health, Panchayat, Municipal Corporations) manages disconnected Video Management Systems (VMS), leading to:
1. **Fragmented Surveillance:** Inability to track cross-corridor target vehicle movements in real time.
2. **Bandwidth Exhaustion:** Ingesting 80,000+ continuous high-bitrate video streams to central data centers would require unfeasible multi-terabit WAN backbones.
3. **Evidence Inadmissibility:** Electronic video extractions often lack cryptographic provenance and clock-synchronization certificates required under Section 65B of the Indian Evidence Act 1872 and Section 63 of Bharatiya Sakshya Adhiniyam (BSA 2023).

**NetraBindu** solves this through a **Hybrid Architecture (Models 1 + 2 + 3 + 4)**:
- **Model 1:** Single Source-of-Truth CCTV Registry & GIS Foundation.
- **Model 2:** Multi-Grid Unified Live Viewing & Edge ANPR Analytics.
- **Model 3:** Heterogeneous VMS Federation & Adapter Middleware Bus.
- **Model 4:** Central VMS, Tiered Storage, and Multi-Camera Route Engine.

---

## 2. Overall Hybrid Architecture & Component Interactions

```
+----------------------------------------------------------------------------------------------------+
|                                    NETRABINDU COMMAND CENTER (UI)                                  |
|  [Tactical Video Wall]  [GIS Trajectory Map]  [VAHAN 4.0 Dossier]  [Section 65B Generator] [SitRep]|
+----------------------------------------------------------------------------------------------------+
                                                  |  WebSockets (/ws/alerts, /ws/events) & REST APIs
+-------------------------------------------------+--------------------------------------------------+
|                            BACKEND FEDERATION & CONTROL PLANE (FastAPI)                            |
|  +-----------------------+  +------------------------+  +-----------------------+                  |
|  | Camera Registry & GIS |  | Watchlist Matcher Engine|  | Route Engine & Gap Det|                  |
|  +-----------------------+  +------------------------+  +-----------------------+                  |
|  +-----------------------+  +------------------------+  +-----------------------+                  |
|  | Sentinel Ingest/Audit |  | VAHAN/eGujCop Connector|  | Alert Lifecycle Hub   |                  |
|  +-----------------------+  +------------------------+  +-----------------------+                  |
+-------------------------------------------------+--------------------------------------------------+
                                                  |  Kafka / Redpanda Event Bus (DetectionEvent Topic)
+-------------------------------------------------+--------------------------------------------------+
|                       EDGE AI SENTINEL ENGINE (YOLOv11 + PaddleOCR + ByteTrack)                     |
|  +----------------------------------------------------------------------------------------------+  |
|  | Adaptive State Machine (Idle: 2 FPS | Normal: 10 FPS | Active: 20 FPS | Critical: 25 FPS)    |  |
|  | VideoDecoder (RTSP over TCP | Monotonic Hardware PTS ms | Non-fatal Join Error Tolerance)    |  |
|  +----------------------------------------------------------------------------------------------+  |
+-------------------------------------------------+--------------------------------------------------+
                                                  |  RTSP over TCP / ONVIF Profile S / VMS APIs
+-------------------------------------------------+--------------------------------------------------+
|                     HETEROGENEOUS DEPARTMENTAL SURVEILLANCE ECOSYSTEM                              |
|  [Home/Police (Traffic/HQ)]  [GSRTC (Bus Ports)]  [Health (Hospitals)]  [Panchayat]  [Municipal]   |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Integration Strategy for Heterogeneous Infrastructure

### 3.1 Standards-Based Ingestion Protocol
Per Section 1-4 of the Gujarat Police Integrator's Guide:
1. **RTSP over TCP Enforced:** All streaming clients strictly set `rtsp_transport=tcp` (`OPENCV_FFMPEG_CAPTURE_OPTIONS=rtsp_transport;tcp`). UDP is rejected to eliminate packet drop and corrupted macroblocks across state police WAN/NAT gateways.
2. **Hardware Monotonic Presentation Timestamps (PTS):** All motion models and speed estimation use hardware `PTS` (`cap.get(cv2.CAP_PROP_POS_MSEC)`) instead of unreliable `CAP_PROP_FPS` or arrival time.
3. **Exponential Backoff Reconnect:** Connection dropouts are handled via jittered exponential backoff ($2	ext{s} 	o 4	ext{s} 	o 8	ext{s} 	o 16	ext{s} 	o 30	ext{s}$ ceiling) preventing connection storms.
4. **Mixed H.264 & H.265 Transcoding:** Supports H.264 Baseline/High Profile and H.265 Main Profile with non-fatal warning suppression during IDR synchronization.
5. **Catalogue-Driven Discovery (`GET /api/ingest`):** Endpoints are never hard-coded; cameras are dynamically resolved from the centralized catalogue.

### 3.2 VMS Federation Adapters
For legacy VMS networks (Hikvision, Dahua, Milestone, Honeywell, CP Plus), NetraBindu deploys modular adapter microservices that translate native proprietary events into standard `DetectionEvent` JSON schemas.

---

## 4. AI Video Analytics & Vehicle Tracking Workflow

### 4.1 Multi-Stage Pipeline
1. **Vehicle & License Plate Localizer:** Ultralytics YOLOv11 deep neural network trained on Indian vehicle topologies (Commercial Autos, GSRTC Buses, Two-Wheelers, SUVs, Heavy Commercial Vehicles).
2. **Indian ANPR Engine:** PaddleOCR with customized character recognition models supporting standard high-security registration plates (HSRP) and non-standard state fonts.
3. **Character-by-Character Confidence Metric:**
   $$	ext{Confidence}_{	ext{Plate}} = \left(\prod_{i=1}^M c_iight)^{1/M}$$
4. **Trajectory Reconstruction & Gap Detection:**
   The `RouteEngine` computes chronological vehicle movement between consecutive camera observations $(P_1, P_2)$. Distance is calculated using the Haversine formula:
   $$d = 2R \cdot rcsin\left(\sqrt{\sin^2\left(rac{\Delta\phi}{2}ight) + \cos\phi_1\cos\phi_2\sin^2\left(rac{\Delta\lambda}{2}ight)}ight)$$
   If the transit duration $\Delta t > 900	ext{ seconds}$ (15 minutes), the engine explicitly logs an **Unobserved Corridor Transit Gap** to prevent fabricating travel paths across unmonitored rural bypasses.

---

## 5. Watchlist Cross-Referencing & Alert Engine

### 5.1 Real-Time Ingest Correlation
Detections published to Kafka are immediately normalized using fuzzy phonetic and Levenshtein distance algorithms:
- Matches against active Government databases:
  - **eGujCop / CCTNS:** Stolen vehicles, FIR suspect lists, wanted criminals.
  - **VAHAN 4.0 / SARTHI:** Blacklisted commercial vehicles, revoked permits, RC verification.
  - **AFIS / NAFIS:** National automated fingerprint & facial watchlists.
- **Alert Dispatch Tiers:**
  - `CRITICAL`: Immediate siren, Web Audio klaxon, automated Nakabandi perimeter calculation, and PCR van dispatch.
  - `HIGH`: Priority dispatcher intervention within 60 seconds.
  - `MEDIUM` & `LOW`: Logged to audit repository with automated license plate indexing.

---

## 6. Infrastructure Sizing for 80,000 Cameras Statewide

### 6.1 Adaptive Sentinel WAN Bandwidth Reduction
Traditional full-rate 1080p streaming for 80,000 cameras:
$$80,000 	imes 4	ext{ Mbps} = 320	ext{ Gbps Continuous WAN}$$

NetraBindu's Edge Sentinel dynamically throttles FPS based on scene activity:
- **Idle State (70% of network):** 2 FPS @ 256 kbps
- **Normal State (20% of network):** 10 FPS @ 1024 kbps
- **Active State (8% of network):** 20 FPS @ 2048 kbps
- **Critical State (2% of network):** 25 FPS @ 4096 kbps

$$	ext{Average Bitrate} = (0.70 	imes 256) + (0.20 	imes 1024) + (0.08 	imes 2048) + (0.02 	imes 4096) pprox 629.7	ext{ kbps}$$
$$	ext{Total Bandwidth} = 80,000 	imes 629.7	ext{ kbps} pprox 50.3	ext{ Gbps} \quad (\mathbf{84.2\%	ext{ Bandwidth Reduction}})$$

### 6.2 Compute & GPU Architecture
- **Edge Layer:** Edge micro-servers (NVIDIA Jetson Orin / Intel Core Ultra) running Sentinel vision decoders at police station hubs and GSRTC depots.
- **Regional Layer:** 6 Regional Command Centers (Ahmedabad, Surat, Vadodara, Rajkot, Gandhinagar, Border Zone) handling regional Kafka brokers and localized WebRTC media relays.
- **State Data Center (Gandhinagar):** Centralized high-availability Kubernetes cluster running FastAPI control planes, PostGIS spatial clusters, and Ceph/MinIO storage.

### 6.3 Tiered Storage Strategy (Hot / Warm / Cold)
- **Hot Tier (0-7 Days):** NVMe SSD array for high-priority evidence clips and ANPR metadata with sub-10ms search latency.
- **Warm Tier (8-30 Days):** S3/MinIO Object Storage with erasure coding (EC 8+4) for general video retention.
- **Cold Tier (30-90 Days):** Compressed tape/dense object archives for Section 65B certified legal case exhibits.

---

## 7. Statutory & Electronic Evidence Compliance

### 7.1 Section 65B Indian Evidence Act 1872 & Section 63 BSA 2023
To guarantee court admissibility in Sessions and High Courts:
1. **Cryptographic SHA-256 Digest:** Every detection event hashes the raw frame buffer, monotonic hardware PTS timestamp, camera UUID, and GPS coordinates at edge capture time.
2. **Investigating Officer Attribution:** Certificates cryptographically bind the Investigating Officer's Name, Police Rank, Officer ID, Police Station Jurisdiction, and FIR Case Number.
3. **Hardware State Integrity:** Records capturing camera firmware version, NTP synchronization offset, and packet transport flags (`RTSP/TCP`).

---

## 8. Disaster Recovery & Cybersecurity Architecture

- **Zero-Trust Network Architecture (ZTNA):** Mutual TLS (mTLS) across all edge-to-cloud communications.
- **Air-Gapped Operation:** Edge nodes cache up to 72 hours of detections and evidence locally during WAN connectivity loss and auto-synchronize upon link recovery.
- **Role-Based Access Control (RBAC):** Department-scoped visibility ensuring Health Department operators cannot view Police tactical grids without formal multi-signature authorization.
