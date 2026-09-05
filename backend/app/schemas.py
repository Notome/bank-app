from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import re


class UserLogin(BaseModel):
    phone: str
    password: str


class UserLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

    class Config:
        from_attributes = True


class UserRegister(BaseModel):
    name: str
    phone: str
    password: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        cleaned = re.sub(r"\D", "", v)
        if len(cleaned) < 10:
            raise ValueError("Phone number too short")
        return cleaned

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserRegisterResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    id: int
    name: str
    phone: str

    class Config:
        from_attributes = True


class CardOut(BaseModel):
    id: int
    card_number: str

    class Config:
        from_attributes = True


class AccountOut(BaseModel):
    id: int
    account_number: str
    balance: int
    type: str
    interest_rate: Optional[float]
    can_withdraw: bool
    deposit_end_date: Optional[datetime]
    cards: list[CardOut] = []

    class Config:
        from_attributes = True


class CreateAccount(BaseModel):
    type: str
    interest_rate: Optional[float] = None
    can_withdraw: bool = True
    deposit_end_date: Optional[datetime] = None


class CreateAccountResponse(BaseModel):
    id: int
    account_number: str
    balance: int
    type: str
    interest_rate: Optional[float]
    can_withdraw: bool
    deposit_end_date: Optional[datetime]

    class Config:
        from_attributes = True


class AddCard(BaseModel):
    account_number: str

    @field_validator("account_number")
    @classmethod
    def validate_account(cls, v):
        if not v.strip():
            raise ValueError("Account number required")
        return v


class AddCardResponse(BaseModel):
    id: int
    card_number: str
    account_number: str

    class Config:
        from_attributes = True


class TransferMoney(BaseModel):
    sender_account_number: str
    receiver_account_number: str
    amount: int
    description: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v


class TransactionOut(BaseModel):
    id: int
    sender_account_id: int
    receiver_account_id: int
    amount: int
    created_at: datetime
    description: Optional[str]

    class Config:
        from_attributes = True


class TransferResponse(BaseModel):
    transaction_id: int
    sender_new_balance: int
    message: str
