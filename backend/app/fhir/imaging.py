"""
FHIR DocumentReference schema for medical images.
"""

from typing import Optional

from pydantic import BaseModel


class FHIRAttachment(BaseModel):

    contentType: str

    url: str

    title: Optional[str] = None


class FHIRDocumentReferenceContent(BaseModel):

    attachment: FHIRAttachment


class FHIRDocumentReference(BaseModel):

    resourceType: str = "DocumentReference"

    id: Optional[str] = None

    status: str = "current"

    subject: dict

    description: Optional[str] = None

    content: list[FHIRDocumentReferenceContent]