from services.federation.manager import VMSFederationManager
from services.federation.external_registries import (
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
