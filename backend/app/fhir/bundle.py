"""
FHIR Bundle Resource.
"""

from typing import List

from pydantic import BaseModel


class BundleEntry(BaseModel):

    resource: dict


class FHIRBundle(BaseModel):

    resourceType: str = "Bundle"

    type: str = "collection"

    entry: List[BundleEntry]