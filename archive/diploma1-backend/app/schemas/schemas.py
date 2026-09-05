from pydantic import BaseModel, field_validator
import re


class RegisterRequest(BaseModel):
    phone: str
    name: str
    password: str

    @field_validator("phone")
    @classmethod
    def phone_must_be_digits(cls, v: str) -> str:
        cleaned = re.sub(r"[\s\-\(\)\+]", "", v)
        if not cleaned.isdigit() or len(cleaned) < 7:
            raise ValueError("Некорректный номер телефона")
        return cleaned

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Пароль должен быть не менее 6 символов")
        return v


class LoginRequest(BaseModel):
    phone: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    name: str
    phone: str

    model_config = {"from_attributes": True}