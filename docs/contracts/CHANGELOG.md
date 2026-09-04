# Netrabindu Contracts Changelog

All contract changes across API, Event Bus, or DB schema between Engineers 1, 2, and 3 must be recorded here.

## [1.0.0] - 2026-09-04
### Added
- Initial frozen API contract (`api-contract.md`) covering Auth, Departments, Cameras, Events, Vehicles/GIS Route, Watchlists, Alerts, Health, Metrics, and Audit.
- Initial frozen Event contract (`event-contract.md`) covering `camera.health`, `anpr.events`, `vehicle.events`, `watchlist.matches`, `alerts`, `adaptive.telemetry`.
- Established PostGIS SRID 4326 geospatial standard for camera and detection event coordinates.
- Established UTC timestamp contract with IST presentation rule.
