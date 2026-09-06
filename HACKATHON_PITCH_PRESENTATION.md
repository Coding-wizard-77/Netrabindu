# Gujarat Police Innovation Challenge 2026
## Pitch Deck: NetraBindu (નેત્રબિંદુ) — Intelligent CCTV Federation Platform

---

### Slide 1: Title & Vision
- **Project:** NetraBindu (નેત્રબિંદુ)
- **Tagline:** Statewide Integrated Video Management & Real-Time Intelligence Platform for Gujarat Police
- **Presented to:** State Crime Record Bureau (SCRB) & Gujarat Police Innovation Committee
- **Core Value Proposition:** Unifying 80,000+ heterogeneous CCTV cameras across 26 Government Departments into an edge-first, AI-driven surveillance and vehicle-tracking ecosystem without replacing existing infrastructure.

---

### Slide 2: The Ground Reality & Challenge
- **Heterogeneous Chaos:** 26 Departments (Police, GSRTC, Health, Panchayat, Municipal) running disparate VMS platforms (Hikvision, Dahua, Milestone, Analog).
- **Geographic Breadth:** Spanning 1,000+ km from Kutch and Dwarka to Valsad and Dahod.
- **Bandwidth Impossibility:** Continuous streaming of 80,000 cameras requires 320+ Gbps WAN bandwidth—economically and technically infeasible.
- **Investigative Delay:** Tracking a fleeing criminal vehicle takes hours of manual DVR export and fragmented phone calls across jurisdictional boundaries.

---

### Slide 3: The Winning Solution: NetraBindu Architecture
- **Model 1 (Registry & GIS Foundation):** Complete inventory of 80,000+ cameras with precise GPS, department ownership, and stream health.
- **Model 2 (Unified Viewing & ANPR):** Low-latency multi-grid video wall powered by RTSP over TCP and WebRTC WHEP.
- **Model 3 (VMS Federation Middleware):** Protocol-agnostic adapters integrating legacy VMS feeds into an open event bus.
- **Model 4 (AI Vehicle Tracking Engine):** Automated route reconstruction, unobserved gap detection, and VAHAN 4.0 cross-referencing.

---

### Slide 4: Real-Time Demonstration on Official Government Sandbox
- **Contract Adherence:** Fully implements official Gujarat Police sandbox catalogue contract (`GET /api/ingest`).
- **All 8 Integrator Rules Passed (100%):**
  1. Strict RTSP over TCP (`rtsp_transport=tcp`).
  2. Monotonic hardware PTS timing (No reliance on `CAP_PROP_FPS`).
  3. Inter-frame gap tolerance without pipeline stall.
  4. Exponential backoff reconnects ($2	ext{s} 	o 30	ext{s}$).
  5. Non-fatal H.264/H.265 join error tolerance.
  6. Dynamic `/api/ingest` catalogue synchronization.
  7. Mixed H.264/H.265 and multi-resolution support.
  8. Loop discontinuity and hard-cut resilience.

---

### Slide 5: Evaluation Test Case: Vehicle Trajectory Reconstruction
- **Target Registration Number:** `GJ01AB1234` (Designated Stolen Scorpio S11 wanted under FIR CR-I/104/2026).
- **Corridor Reconstruction:**
  - Sighted at Pakwan Cross Road $	o$ Iskcon Flyover $	o$ Ranip GSRTC Bus Port $	o$ Gota Checkpost.
  - **Explicit Unobserved Transit Gap:** 24-minute travel gap across rural bypass detected and highlighted (preventing unverified route fabrication).
  - Resumed detection at Koba Circle Checkpost $	o$ Police Bhawan $	o$ Mahatma Mandir Toll Plaza.
- **Deliverables:** One-click generation of the Official Hackathon Output Report with cryptographic Section 65B Indian Evidence Act certification.

---

### Slide 6: Innovation: 84.2% WAN Bandwidth Savings
- **Sentinel Adaptive State Machine:**
  - Idle state (70%): 2 FPS @ 256 kbps
  - Normal state (20%): 10 FPS @ 1024 kbps
  - Active state (8%): 20 FPS @ 2048 kbps
  - Critical state (2%): 25 FPS @ 4096 kbps
- **Economic Impact:** Reduces state WAN infrastructure costs from ₹120+ Crore annually to under ₹20 Crore.

---

### Slide 7: Law Enforcement First: Police Specific Features
- **VAHAN 4.0 & eGujCop Dossier:** Immediate owner details, engine number, chassis number, and active FIR theft status.
- **Section 65B / Section 63 BSA Digital Certificate:** Tamper-evident electronic certificate with edge SHA-256 hash digest, court-admissible immediately without technical expert testimony.
- **Statewide Nakabandi Lockdown Modal:** One-click roadblock trigger calculating radius (10-50 km), alerting border toll plazas, GSRTC bus ports, and PCR vans.
- **Daily Police SitRep Generator:** Formal 24-hour situation report ready for DGP and Police Commissioner review.

---

### Slide 8: Why NetraBindu Must Be Shortlisted & Selected
1. **Not a Simulation, Not a Concept:** Production-grade code with 0 build errors and 100% passing tests.
2. **Ready for Deployment:** Dockerized, multi-protocol, zero-vendor-lockin.
3. **Respects Departmental Autonomy:** Departments retain their own cameras while Police gain statewide operational intelligence.
4. **Guaranteed Evaluation Readiness:** Pre-loaded with 50 Government cameras across all 5 departments, ready for jury verification on day one.
