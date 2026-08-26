"""
User schemas.
"""

from pydantic import BaseModel
from pydantic import EmailStr


class UserRegister(BaseModel):

    first_name: str

    last_name: str

    email: EmailStr

    password: str


class UserLogin(BaseModel):

    email: EmailStr

    password: str


class UserResponse(BaseModel):

    id: int

    first_name: str

    last_name: str

    email: EmailStr

    role: str

    class Config:

        from_attributes = True


class Token(BaseModel):

    access_token: str

    token_type: str