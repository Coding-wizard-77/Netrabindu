-- PostGIS spatial extension initialization
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify spatial reference system
SELECT PostGIS_Full_Version();
