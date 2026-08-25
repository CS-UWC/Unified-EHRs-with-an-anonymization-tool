"""
Authorization dependencies.

Responsible for checking whether the authenticated
user has the required role.
"""

from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from app.core.dependencies import get_current_user
from app.models.user import User


def require_role(*allowed_roles: str):

    def role_checker(
        current_user: User = Depends(
            get_current_user
        )
    ):

        if current_user.role not in allowed_roles:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )

        return current_user

    return role_checker