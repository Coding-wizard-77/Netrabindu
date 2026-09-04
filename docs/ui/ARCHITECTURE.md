# NetraBindu Command Center & GIS Architecture

## Overview
The NetraBindu Command Center (`apps/web`) is a high-density, mission-critical web application built using **React 19 + TypeScript + Vite + Tailwind CSS**. It provides real-time situational awareness, adaptive intelligence telemetry, low-latency live video streaming, AI detection feeds, watchlist correlation, and GIS observed-route reconstruction for Gujarat Police.

---

## 1. Directory Structure

```
apps/web/
├── src/
│   ├── api/                   # REST & WebSocket Client Services
│   │   ├── client.ts          # Axios base client with JWT interceptors
│   │   ├── cameras.ts         # Camera registry, onboarding, stream authorization
│   │   ├── events.ts          # Detection queries & rolling buffer evidence
│   │   ├── vehicles.ts        # Plate timeline, GIS route, evidence endpoints
│   │   ├── watchlists.ts      # Watchlist target CRUD & candidate matching
│   │   ├── alerts.ts          # Alert lifecycle: acknowledge, dispatch, resolve
│   │   ├── health.ts          # Edge node metrics, database pools, external systems
│   │   ├── audit.ts           # Immutable compliance audit log search
│   │   └── websocket.ts       # Resilient WebSocket connection manager
│   ├── components/
│   │   ├── common/            # Design system primitives (Badge, Button, DataTable, Modal, Drawer)
│   │   ├── layout/            # Shell layout, Sidebar, Header, SystemStatusBar
│   │   ├── gis/               # Leaflet GIS CommandMap, CameraMarker, RoutePolyline, CoverageGapCallout
│   │   ├── video/             # LiveVideoPlayer, WebRTC (WHEP), HLS.js, VideoWallGrid, StreamOverlay
│   │   ├── anpr/              # ANPREventCard, PlateBadge, CropInspectorModal, LiveEventStream
│   │   ├── alerts/            # AlertBanner, AlertTable, AlertDetailDrawer, AlertActionButtons
│   │   ├── onboarding/        # OnboardingWizard, CSVUploader, ONVIFDiscoveryModal, ManualCameraForm
│   │   ├── investigation/     # PlateSearchHeader, VehicleTimeline, RouteMapSynchronizer, PDF Export
│   │   └── telemetry/         # AdaptiveStateMatrix, BandwidthSavingsChart, InferenceComputeChart
│   ├── store/                 # Zustand state stores (Auth, UI, Live Alerts, Video Wall)
│   ├── types/                 # Frozen TypeScript contracts matching E1 Pydantic & E2 event schemas
│   ├── utils/                 # IST date formatters, plate normalizer, Haversine geo math, Web Audio synthesizer
│   └── views/                 # 11 Operational Command Views
```

---

## 2. Frozen Contract Adherence

1. **No Mock Data**: All KPI cards, camera statuses, detection feeds, and alerts derive dynamically from backend APIs/WebSockets.
2. **Zero RTSP in Browser**: Video is delivered via MediaMTX WebRTC (WHEP) sessions with automatic fallback to HLS.
3. **Observed-Only Vehicle Routes**: The GIS engine draws directional polylines only between cameras that genuinely observed the target plate, with explicit coverage gap warnings for unobserved intervals.
4. **Adaptive Quality States**: Feeds dynamically reflect `Idle`, `Normal`, `Active`, and `Critical` states with telemetry-backed reasons.
5. **Timezone Uniformity**: All timestamps are stored in UTC internally and presented in Indian Standard Time (IST, UTC+05:30).
