from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import schemas
from session import get_session
from init_bd import init_bd
from contextlib import asynccontextmanager
from models import UserTable, AccountTable, CardTable
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.orm import selectinload

security = HTTPBearer()
async def select_users(session, phone):
    result = await session.execute(
        select(UserTable).where(UserTable.phone == phone)
    )
    user = result.scalar_one_or_none()
    
    return user

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), session: AsyncSession = Depends(get_session)):
    token = credentials.credentials

    result = await select_users(session, token)

    if result is not None:
        return result
    
    raise HTTPException(status_code=401, detail="Invalid token")

async def create_response_token(phone):
    return {"access_token" : phone, "refresh_token" : phone}

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_bd()
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/login")
async def login():
    return {"message": "working"}

@app.post("/register", response_model = schemas.UserLoginResponse)
async def register(
    user: schemas.UserRegister,
    session: AsyncSession = Depends(get_session)
):
    db_user = UserTable(
        name = user.name,
        phone = user.phone,
        password_hash = user.password
    )
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)

    tokens = await create_response_token(db_user.phone)
    
    return {"access_token" : tokens["access_token"], "refresh_token": tokens["refresh_token"]}

@app.get("/profile")
async def profile(user: UserTable = Depends(get_current_user)): 
    return {
        "id": user.id,
        "phone": user.phone
    }

@app.get("/show_balance")
async def show_balance(
    user: UserTable = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(
        select(UserTable)
        .where(UserTable.id == user.id)
        .options(
            selectinload(UserTable.accounts)
            .selectinload(AccountTable.cards)
        )
    )

    user = result.scalar_one()

    resp = []
    for account in user.accounts:
        resp.append({
            "account_number": account.account_number,
            "balance": account.balance,
            "cards": [card.card_number for card in account.cards]
        })

    return resp

@app.post("/add_card")
async def add_card(
    data: schemas.AddCard,
    user: UserTable = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(
        select(AccountTable).where(
            AccountTable.account_number == data.account_number,
            AccountTable.user_id == user.id
        )
    )
    account = result.scalar_one_or_none()

    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")

    account.balance = data.balance

    new_card = CardTable(
        card_number=data.card_number,
        account_id=account.id
    )

    session.add(new_card)
    await session.commit()

    return {"message": "Card added", "new_balance": account.balance}

@app.post('/create_account', response_model=schemas.CreateAccountResponse)
async def create_account(
    data: schemas.CreateAccount,
    user: UserTable = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    existing = await session.execute(
        select(AccountTable).where(AccountTable.account_number == data.account_number)
    )
    
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    new_account = AccountTable(
        account_number=data.account_number,
        balance=data.balance,
        type=data.type,
        interest_rate=data.interest_rate,
        can_withdraw=data.can_withdraw,
        deposit_end_date=data.deposit_end_date,
        user_id=user.id
    )
    
    session.add(new_account)
    await session.commit()
    await session.refresh(new_account)
    
    return {
        "id": new_account.id,
        "account_number": new_account.account_number,
        "balance": new_account.balance,
        "type": new_account.type,
        "interest_rate": new_account.interest_rate,
        "can_withdraw": new_account.can_withdraw,
        "deposit_end_date": new_account.deposit_end_date
    }
    
@app.post('/transfer_money', response_model=schemas.TransferMoney):
    