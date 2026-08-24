"""
Security functions.

Responsible for:
- Password hashing
- Password verification
- JWT creation
- JWT decoding
"""

import os

from datetime import datetime
from datetime import timedelta
from datetime import timezone

from dotenv import load_dotenv

from jose import jwt
from jose import JWTError

from passlib.context import CryptContext


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()


# ============================================================
# JWT CONFIGURATION
# ============================================================

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "30"
    )
)


if not SECRET_KEY:

    raise RuntimeError(
        "SECRET_KEY is not set in the .env file"
    )


# ============================================================
# PASSWORD HASHING
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(
    password: str
):
    """
    Hash a plain-text password.
    """

    return pwd_context.hash(
        password
    )


def verify_password(
    plain_password: str,
    hashed_password: str
):
    """
    Verify a password against its hash.
    """

    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# ============================================================
# CREATE JWT
# ============================================================

def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None
):
    """
    Create a JWT access token.
    """

    to_encode = data.copy()

    if expires_delta:

        expire = (
            datetime.now(timezone.utc)
            + expires_delta
        )

    else:

        expire = (
            datetime.now(timezone.utc)
            + timedelta(
                minutes=ACCESS_TOKEN_EXPIRE_MINUTES
            )
        )

    to_encode.update(
        {
            "exp": expire
        }
    )

    encoded_token = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_token


# ============================================================
# DECODE JWT
# ============================================================

def decode_access_token(
    token: str
):
    """
    Decode and validate a JWT access token.

    Returns:
        dict: decoded payload

    Returns None if token is invalid or expired.
    """

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:

        return None