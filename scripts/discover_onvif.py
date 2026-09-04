import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from adapters.onvif import ONVIFAdapter

async def run_discovery(timeout: float = 3.0):
    print(f"[*] Probing local network for ONVIF Profile S compliant cameras (timeout: {timeout}s)...")
    devices = await ONVIFAdapter.discover_devices(timeout=timeout)
    print(f"[*] Discovery complete. Found {len(devices)} device(s):")
    for d in devices:
        print(f"    - IP: {d['ip']}:{d['port']} | Device: {d['device_id']} | Endpoint: {d['endpoint_ref']}")

if __name__ == "__main__":
    asyncio.run(run_discovery())
