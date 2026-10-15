"""
Research Data API.

Provides researchers with access to anonymised data
stored in the Research Data Mart.

Only anonymised ResearchData records are exposed.
Operational EHR records are never returned by this API.
"""

import csv
import io

from fastapi import APIRouter
from fastapi import Depends
from fastapi.responses import JSONResponse
from fastapi.responses import StreamingResponse

from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.research_data import ResearchData
from app.models.user import User

from app.core.authorization import require_role


router = APIRouter(
    prefix="/research-data",
    tags=["Research Data"]
)


def get_filtered_research_data(
    db: Session,
    province: str | None = None,
    disease: str | None = None,
    age_group: str | None = None
):
    """
    Retrieve anonymised research data using
    optional filters.
    """

    query = db.query(ResearchData)

    if province:
        query = query.filter(
            ResearchData.province.ilike(province)
        )

    if disease:
        query = query.filter(
            ResearchData.disease.ilike(disease)
        )

    if age_group:
        query = query.filter(
            ResearchData.age_group == age_group
        )

    return query.order_by(
        ResearchData.created_at.desc()
    ).all()


@router.get("/")
def get_research_data(
    province: str | None = None,
    disease: str | None = None,
    age_group: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(
            "RESEARCHER",
            "ADMIN"
        )
    )
):
    """
    Get anonymised research data.

    Optional filters:

        province
        disease
        age_group

    Examples:

        GET /research-data/

        GET /research-data/?province=Western%20Cape

        GET /research-data/?disease=Diabetes

        GET /research-data/?age_group=25-34
    """

    records = get_filtered_research_data(
        db=db,
        province=province,
        disease=disease,
        age_group=age_group
    )

    return [
        {
            "id": record.id,
            "age_group": record.age_group,
            "gender": record.gender,
            "province": record.province,
            "disease": record.disease,
            "blood_type": record.blood_group,
            "allergies": record.allergies,
            "current_medications": record.current_medications,
            "medical_history": record.medical_history,
            "height": record.height,
            "weight": record.weight,
            "glucose": record.glucose,
            "created_at": record.created_at
        }
        for record in records
    ]


@router.get("/export/json")
def export_research_data_json(
    province: str | None = None,
    disease: str | None = None,
    age_group: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(
            "RESEARCHER",
            "ADMIN"
        )
    )
):
    """
    Export filtered anonymised research data as JSON.
    """

    records = get_filtered_research_data(
        db=db,
        province=province,
        disease=disease,
        age_group=age_group
    )

    data = [
        {
            "id": record.id,
            "age_group": record.age_group,
            "gender": record.gender,
            "province": record.province,
            "disease": record.disease,
            "blood_type": record.blood_group,
            "allergies": record.allergies,
            "current_medications": record.current_medications,
            "medical_history": record.medical_history,
            "height": record.height,
            "weight": record.weight,
            "glucose": record.glucose,
            "created_at": (
                record.created_at.isoformat()
                if record.created_at
                else None
            )
        }
        for record in records
    ]

    return JSONResponse(
        content=data,
        headers={
            "Content-Disposition":
                'attachment; filename="research_data.json"'
        }
    )


@router.get("/export/csv")
def export_research_data_csv(
    province: str | None = None,
    disease: str | None = None,
    age_group: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(
            "RESEARCHER",
            "ADMIN"
        )
    )
):
    """
    Export filtered anonymised research data as CSV.
    """

    records = get_filtered_research_data(
        db=db,
        province=province,
        disease=disease,
        age_group=age_group
    )

    output = io.StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "id",
        "age_group",
        "gender",
        "province",
        "disease",
        "blood_group",
        "allergies",
        "current_medications",
        "medical_history",
        "height",
        "weight",
        "glucose",
        "created_at"
    ])

    for record in records:

        writer.writerow([
            record.id,
            record.age_group,
            record.gender,
            record.province,
            record.disease,
            record.blood_group,
            record.allergies,
            record.current_medications,
            record.medical_history,
            record.height,
            record.weight,
            record.glucose,
            (
                record.created_at.isoformat()
                if record.created_at
                else None
            )
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":
                'attachment; filename="research_data.csv"'
        }
    )