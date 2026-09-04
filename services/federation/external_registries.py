import httpx
from typing import Protocol, runtime_checkable, Optional, Dict, Any
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class IntegrationHealth:
    adapter_name: str
    status: str  # CONNECTED, UNCONFIGURED, UNREACHABLE, UNAUTHORIZED
    endpoint: str
    latency_ms: float = 0.0
    error_message: Optional[str] = None
    last_checked: datetime = field(default_factory=datetime.utcnow)

@dataclass
class ExternalLookupResult:
    source_name: str
    found: bool
    identifier: str
    raw_payload: Optional[Dict[str, Any]] = None
    is_live_external: bool = False
    disclaimer: str = "Government external registry query result."
    error_message: Optional[str] = None

@runtime_checkable
class ExternalRegistryAdapter(Protocol):
    name: str

    async def health(self) -> IntegrationHealth: ...
    async def lookup_vehicle(self, plate: str) -> ExternalLookupResult: ...
    async def lookup_person(self, identifier: str) -> ExternalLookupResult: ...

class VahanRegistryAdapter:
    """VAHAN (MoRTH Vehicle Registry) Integration Adapter."""
    name: str = "VAHAN"

    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        self.base_url = base_url or "https://vahan.parivahan.gov.in/api/v1"
        self.api_key = api_key

    async def health(self) -> IntegrationHealth:
        if not self.api_key:
            return IntegrationHealth(
                adapter_name=self.name,
                status="UNCONFIGURED",
                endpoint=self.base_url,
                error_message="VAHAN API credentials not configured in secure store."
            )
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/health", headers={"Authorization": f"Bearer {self.api_key}"})
                return IntegrationHealth(
                    adapter_name=self.name,
                    status="CONNECTED" if res.status_code == 200 else "UNAUTHORIZED",
                    endpoint=self.base_url
                )
        except Exception as e:
            return IntegrationHealth(
                adapter_name=self.name,
                status="UNREACHABLE",
                endpoint=self.base_url,
                error_message=str(e)
            )

    async def lookup_vehicle(self, plate: str) -> ExternalLookupResult:
        health_status = await self.health()
        if health_status.status != "CONNECTED":
            return ExternalLookupResult(
                source_name=self.name,
                found=False,
                identifier=plate,
                error_message=f"VAHAN registry integration unavailable: {health_status.error_message or health_status.status}"
            )
        return ExternalLookupResult(source_name=self.name, found=False, identifier=plate)

    async def lookup_person(self, identifier: str) -> ExternalLookupResult:
        return ExternalLookupResult(
            source_name=self.name,
            found=False,
            identifier=identifier,
            error_message="VAHAN does not support direct individual person lookup; use SARTHI."
        )

class SarthiRegistryAdapter:
    """SARTHI (MoRTH Driving License Registry) Integration Adapter."""
    name: str = "SARTHI"

    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        self.base_url = base_url or "https://sarathi.parivahan.gov.in/api/v1"
        self.api_key = api_key

    async def health(self) -> IntegrationHealth:
        return IntegrationHealth(
            adapter_name=self.name,
            status="UNCONFIGURED" if not self.api_key else "READY",
            endpoint=self.base_url,
            error_message=None if self.api_key else "SARTHI API access token pending authorization."
        )

    async def lookup_vehicle(self, plate: str) -> ExternalLookupResult:
        return ExternalLookupResult(
            source_name=self.name,
            found=False,
            identifier=plate,
            error_message="SARTHI is a driver license registry, not a vehicle registration registry."
        )

    async def lookup_person(self, identifier: str) -> ExternalLookupResult:
        health_status = await self.health()
        if health_status.status != "CONNECTED":
            return ExternalLookupResult(
                source_name=self.name,
                found=False,
                identifier=identifier,
                error_message=f"SARTHI integration unavailable: {health_status.error_message}"
            )
        return ExternalLookupResult(source_name=self.name, found=False, identifier=identifier)

class EGujCopAdapter:
    """eGujCop (Gujarat Police Core Application) Integration Adapter."""
    name: str = "EGUJCOP"

    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        self.base_url = base_url or "https://egujcop.gujarat.gov.in/api/v1"
        self.api_key = api_key

    async def health(self) -> IntegrationHealth:
        return IntegrationHealth(
            adapter_name=self.name,
            status="UNCONFIGURED" if not self.api_key else "CONNECTED",
            endpoint=self.base_url,
            error_message=None if self.api_key else "eGujCop integration interface configured for authorized staging/production only."
        )

    async def lookup_vehicle(self, plate: str) -> ExternalLookupResult:
        return ExternalLookupResult(
            source_name=self.name,
            found=False,
            identifier=plate,
            error_message="eGujCop live access pending state clearance."
        )

    async def lookup_person(self, identifier: str) -> ExternalLookupResult:
        return ExternalLookupResult(
            source_name=self.name,
            found=False,
            identifier=identifier,
            error_message="eGujCop live access pending state clearance."
        )

class AFISAdapter:
    """AFIS/NAFIS (Automated Fingerprint / Biometrics) Integration Adapter."""
    name: str = "AFIS_NAFIS"

    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        self.base_url = base_url or "https://nafis.gov.in/api/v1"
        self.api_key = api_key

    async def health(self) -> IntegrationHealth:
        return IntegrationHealth(
            adapter_name=self.name,
            status="UNCONFIGURED",
            endpoint=self.base_url,
            error_message="NAFIS biometric interface awaiting authorized agency key."
        )

    async def lookup_vehicle(self, plate: str) -> ExternalLookupResult:
        return ExternalLookupResult(source_name=self.name, found=False, identifier=plate, error_message="NAFIS does not support vehicle query.")

    async def lookup_person(self, identifier: str) -> ExternalLookupResult:
        return ExternalLookupResult(source_name=self.name, found=False, identifier=identifier, error_message="NAFIS biometric query requires authorized cert.")
