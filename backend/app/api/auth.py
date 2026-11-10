"""
Authentication endpoints.
"""

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.dependencies import get_db

from app.models import User
from app.models.patient import Patient

from app.models.external_system import ExternalSystem
from app.schemas.external_system import ExternalSystemCreate

from app.schemas.user import (
    UserRegister,
    UserResponse,
    UserLogin,
    Token
)

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ============================================================
# REGISTER
# ============================================================

@router.post(
    "/register",
    response_model=UserResponse
)
def register_user(

    user: UserRegister,

    db: Session = Depends(get_db)

):

    existing_user = (

        db.query(User)

        .filter(
            User.email == user.email
        )

        .first()

    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = hash_password(
        user.password
    )

    new_user = User(

        first_name=user.first_name,

        last_name=user.last_name,

        email=user.email,

        password_hash=hashed_password,

        role="PATIENT"
    )

    new_patient = Patient()

    new_user.patient = new_patient

    db.add(
        new_user
    )

    try:

        db.commit()

        db.refresh(
            new_user
        )

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Could not create user"
        )

    return new_user


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=Token
)
def login_user(

    user: UserLogin,

    db: Session = Depends(get_db)

):

    existing_user = (

        db.query(User)

        .filter(
            User.email == user.email
        )

        .first()

    )

    if not existing_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(

        user.password,

        existing_user.password_hash

    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": existing_user.email,
            "role": existing_user.role
        }
    )

    return {

        "access_token": access_token,

        "token_type": "bearer"

    }

@router.post(
    "/create-test-external-system",
    response_model=UserResponse
)
def create_test_external_system(
    external_system_data: ExternalSystemCreate,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Check whether the email is already registered
    # --------------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(
            User.email == external_system_data.email
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # --------------------------------------------------------
    # Create the EXTERNAL_SYSTEM user account
    # --------------------------------------------------------

    hashed_password = hash_password(
        external_system_data.password
    )

    external_user = User(
        first_name=external_system_data.contact_first_name,
        last_name=external_system_data.contact_last_name,
        email=external_system_data.email,
        password_hash=hashed_password,
        role="EXTERNAL_SYSTEM"
    )

    # --------------------------------------------------------
    # Add the user first so that SQLAlchemy can generate
    # the user ID.
    # --------------------------------------------------------

    db.add(external_user)

    try:

        db.flush()

        # ----------------------------------------------------
        # Create the linked external healthcare organisation
        # profile.
        # ----------------------------------------------------

        external_system = ExternalSystem(
            user_id=external_user.id,
            organisation_name=external_system_data.organisation_name,
            organisation_type=external_system_data.organisation_type,
            province=external_system_data.province,
            address=external_system_data.address,
        )

        db.add(external_system)

        # ----------------------------------------------------
        # Save both records.
        # ----------------------------------------------------

        db.commit()

        db.refresh(external_user)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Could not create external healthcare system"
        )

    return external_user