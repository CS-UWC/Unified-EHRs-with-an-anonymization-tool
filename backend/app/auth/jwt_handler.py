"""
JWT utilities.

Responsible for:
- Creating access tokens
- Verifying access tokens
"""

from datetime import datetime
from datetime import timedelta
from datetime import timezone

from jose import JWTError
from jose import jwt

from fastapi import HTTPException
from fastapi import status

from app.core.config import settings


def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None
):
    """
    Create a JWT access token.
    """

    # Make a copy of the payload
    to_encode = data.copy()

    # Set expiration time
    if expires_delta:

        expire = (
            datetime.now(timezone.utc)
            + expires_delta
        )

    else:

        expire = (
            datetime.now(timezone.utc)
            + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        )

    # Add expiration time to payload
    to_encode.update(
        {"exp": expire}
    )

    # Create JWT token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return encoded_jwt


def verify_access_token(
    token: str
):
    """
    Verify and decode a JWT token.
    """

    credentials_exception = HTTPException(

        status_code=status.HTTP_401_UNAUTHORIZED,

        detail="Could not validate credentials",

        headers={
            "WWW-Authenticate": "Bearer"
        }

    )

    try:

        payload = jwt.decode(

            token,

            settings.SECRET_KEY,

            algorithms=[settings.ALGORITHM]

        )

        # Get the email stored in the token
        email = payload.get("sub")

        if email is None:

            raise credentials_exception

        return email

    except JWTError:

        raise credentials_exception