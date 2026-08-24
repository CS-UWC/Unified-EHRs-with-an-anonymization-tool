from typing import List

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.core.dependencies import get_current_user

from app.models import User
from app.models import LabResult

from app.schemas.lab_result import (
    LabResultCreate,
    LabResultResponse
)


router = APIRouter(

    prefix="/lab-results",

    tags=["Lab Results"]

)


@router.post(

    "/",

    response_model=LabResultResponse

)
def create_lab_result(

    lab_result: LabResultCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    new_lab_result = LabResult(

        patient_id=current_user.id,

        test_name=
        lab_result.test_name,

        result=
        lab_result.result,

        normal_range=
        lab_result.normal_range,

        laboratory_name=
        lab_result.laboratory_name

    )


    db.add(new_lab_result)

    db.commit()

    db.refresh(new_lab_result)

    return new_lab_result


@router.get(

    "/me",

    response_model=
    List[LabResultResponse]

)
def get_my_lab_results(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    results = (

        db.query(LabResult)

        .filter(
            LabResult.patient_id ==
            current_user.id
        )

        .all()

    )


    return results


@router.get(

    "/{lab_result_id}",

    response_model=
    LabResultResponse

)
def get_lab_result(

    lab_result_id:int,

    db: Session = Depends(get_db)

):

    result = (

        db.query(LabResult)

        .filter(
            LabResult.id ==
            lab_result_id
        )

        .first()

    )


    if not result:

        raise HTTPException(

            status_code=404,

            detail="Lab result not found"

        )


    return result



@router.put(

    "/{lab_result_id}",

    response_model=
    LabResultResponse

)
def update_lab_result(

    lab_result_id:int,

    lab_result: LabResultCreate,

    db: Session = Depends(get_db)

):

    existing_result = (

        db.query(LabResult)

        .filter(
            LabResult.id ==
            lab_result_id
        )

        .first()

    )


    if not existing_result:

        raise HTTPException(

            status_code=404,

            detail="Lab result not found"

        )


    existing_result.test_name = (
        lab_result.test_name
    )

    existing_result.result = (
        lab_result.result
    )

    existing_result.normal_range = (
        lab_result.normal_range
    )

    existing_result.laboratory_name = (
        lab_result.laboratory_name
    )


    db.commit()

    db.refresh(existing_result)

    return existing_result


@router.delete(

    "/{lab_result_id}"

)
def delete_lab_result(

    lab_result_id:int,

    db: Session = Depends(get_db)

):

    result = (

        db.query(LabResult)

        .filter(
            LabResult.id ==
            lab_result_id
        )

        .first()

    )


    if not result:

        raise HTTPException(

            status_code=404,

            detail="Lab result not found"

        )


    db.delete(result)

    db.commit()


    return {

        "message":
        "Lab result deleted successfully."

    }


