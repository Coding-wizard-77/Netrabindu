import pytest
from backend.adapters.generic_rtsp import GenericRTSPAdapter
from backend.adapters.onvif import ONVIFAdapter
from backend.adapters.vendors.hikvision import HikvisionISAPIAdapter
from backend.adapters.vendors.milestone import MilestoneXProtectAdapter
from backend.services.federation.external_registries import (
    VahanRegistryAdapter, SarthiRegistryAdapter, EGujCopAdapter
)

def test_rtsp_url_credential_redaction():
    adapter = GenericRTSPAdapter(
        endpoint="rtsp://admin:SecretPass123@192.168.1.100:554/stream1",
        username="admin",
        password="SecretPass123"
    )
    redacted = adapter.redact_url(adapter.endpoint)
    assert "SecretPass123" not in redacted
    assert "admin:***@" in redacted

@pytest.mark.asyncio
async def test_vendor_adapters_instantiation():
    hik = HikvisionISAPIAdapter(host="192.168.1.50", port=80)
    assert hik.name == "HIKVISION_ISAPI"
    cams = await hik.list_cameras()
    assert len(cams) >= 1
    assert cams[0].vendor == "Hikvision"

    milestone = MilestoneXProtectAdapter(host="192.168.1.200", port=443)
    assert milestone.name == "MILESTONE_XPROTECT"
    m_cams = await milestone.list_cameras()
    assert len(m_cams) >= 1

@pytest.mark.asyncio
async def test_government_external_registry_adapters():
    # VAHAN with no credentials configured -> should return UNCONFIGURED gracefully
    vahan = VahanRegistryAdapter(api_key=None)
    health = await vahan.health()
    assert health.status == "UNCONFIGURED"

    lookup = await vahan.lookup_vehicle("GJ01AB1234")
    assert lookup.found is False
    assert "unavailable" in lookup.error_message.lower()

    # SARTHI person lookup
    sarthi = SarthiRegistryAdapter(api_key=None)
    s_health = await sarthi.health()
    assert s_health.status == "UNCONFIGURED"

    # eGujCop
    eguj = EGujCopAdapter(api_key=None)
    eg_health = await eguj.health()
    assert eg_health.status == "UNCONFIGURED"
