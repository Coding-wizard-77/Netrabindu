from backend.services.federation.manager import VMSFederationManager
from backend.services.federation.external_registries import (
    ExternalRegistryAdapter, VahanRegistryAdapter, SarthiRegistryAdapter, EGujCopAdapter, AFISAdapter
)

__all__ = [
    "VMSFederationManager",
    "ExternalRegistryAdapter",
    "VahanRegistryAdapter",
    "SarthiRegistryAdapter",
    "EGujCopAdapter",
    "AFISAdapter"
]
