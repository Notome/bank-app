from pydantic import BaseModel, Field
from pydantic.config import ConfigDict
from typing import Optional
from datetime import datetime

class UserLogin(BaseModel):
    phone : str
    password : str

class UserLoginResponse(BaseModel):
    access_token : str
    refresh_token : str
    class Config:
        from_attributes = True
        
class UserRegister(BaseModel):
    name : str
    phone : str
    password : str

class UserRegisterResponse(BaseModel):
    access_token : str
    refresh_token : str
    class Config:
        from_attributes = True

class AddCard(BaseModel):
    card_number: str
    account_number: str
    balance: int
    
class CreateAccount(BaseModel):
    account_number: str
    type: str
    balance: int = 0
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

class TransferMoney(BaseModel):
    id: int
    account_number_recipent: str
    account_number_sender: str
    amount: float
    