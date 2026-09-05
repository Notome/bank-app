from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from contextlib import asynccontextmanager

from app.session import get_session, engine
from app.models import Base, UserTable, AccountTable, CardTable, TransactionTable
from app.schemas import (
    UserLogin, UserLoginResponse,
    UserRegister, UserRegisterResponse,
    UserProfile,
    CreateAccount, CreateAccountResponse,
    AddCard, AddCardResponse,
    TransferMoney, TransferResponse,
    AccountOut, TransactionOut,
)
from app.auth import hash_password, verify_password, create_access_token, decode_access_token
from app.utils import generate_account_number, generate_card_number


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    from app.session import AsyncSessionLocal
    async with AsyncSessionLocal() as session:
        existing = await session.execute(
            select(UserTable).where(UserTable.phone == "79000000000")
        )
        if not existing.scalar_one_or_none():
            user = UserTable(
                name="Тестовый пользователь",
                phone="79000000000",
                password_hash=hash_password("password123"),
            )
            session.add(user)
            account = AccountTable(
                account_number="40817810000000000001",
                balance=100000,
                type="card",
                can_withdraw=True,
                user=user,
            )
            session.add(account)
            await session.commit()

    yield

app = FastAPI(title="Bank API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_session),
) -> UserTable:
    payload = decode_access_token(credentials.credentials)
    user_id: int = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    result = await session.execute(select(UserTable).where(UserTable.id == int(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@app.post("/api/register", response_model=UserRegisterResponse, tags=["auth"])
async def register(
    data: UserRegister,
    session: AsyncSession = Depends(get_session),
):
    existing = await session.execute(
        select(UserTable).where(UserTable.phone == data.phone)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Phone already registered")

    user = UserTable(
        name=data.name,
        phone=data.phone,
        password_hash=hash_password(data.password),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token}


@app.post("/api/login", response_model=UserLoginResponse, tags=["auth"])
async def login(
    data: UserLogin,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(UserTable).where(UserTable.phone == data.phone)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid phone or password")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token}


@app.get("/api/profile", response_model=UserProfile, tags=["user"])
async def profile(user: UserTable = Depends(get_current_user)):
    return user


@app.get("/api/accounts", response_model=list[AccountOut], tags=["accounts"])
async def get_accounts(
    user: UserTable = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(UserTable)
        .where(UserTable.id == user.id)
        .options(
            selectinload(UserTable.accounts).selectinload(AccountTable.cards)
        )
    )
    user_full = result.scalar_one()
    return user_full.accounts


@app.post("/api/accounts", response_model=CreateAccountResponse, tags=["accounts"])
async def create_account(
    data: CreateAccount,
    user: UserTable = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    for _ in range(10):
        acc_number = generate_account_number()
        existing = await session.execute(
            select(AccountTable).where(AccountTable.account_number == acc_number)
        )
        if not existing.scalar_one_or_none():
            break

    account = AccountTable(
        account_number=acc_number,
        balance=0,
        type=data.type,
        interest_rate=data.interest_rate,
        can_withdraw=data.can_withdraw,
        deposit_end_date=data.deposit_end_date,
        user_id=user.id,
    )
    session.add(account)
    await session.commit()
    await session.refresh(account)
    return account


@app.delete("/api/accounts/{account_number}", tags=["accounts"])
async def delete_account(
    account_number: str,
    user: UserTable = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(AccountTable).where(
            AccountTable.account_number == account_number,
            AccountTable.user_id == user.id,
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    if account.balance > 0:
        raise HTTPException(status_code=400, detail="Cannot delete account with positive balance")

    await session.delete(account)
    await session.commit()
    return {"message": "Account deleted"}


@app.post("/api/cards", response_model=AddCardResponse, tags=["cards"])
async def add_card(
    data: AddCard,
    user: UserTable = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(AccountTable).where(
            AccountTable.account_number == data.account_number,
            AccountTable.user_id == user.id,
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    for _ in range(10):
        card_num = generate_card_number()
        existing = await session.execute(
            select(CardTable).where(CardTable.card_number == card_num)
        )
        if not existing.scalar_one_or_none():
            break

    card = CardTable(card_number=card_num, account_id=account.id)
    session.add(card)
    await session.commit()
    await session.refresh(card)

    return {"id": card.id, "card_number": card.card_number, "account_number": account.account_number}


@app.post("/api/transfer", response_model=TransferResponse, tags=["transactions"])
async def transfer_money(
    data: TransferMoney,
    user: UserTable = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    sender_result = await session.execute(
        select(AccountTable).where(
            AccountTable.account_number == data.sender_account_number,
            AccountTable.user_id == user.id,
        )
    )
    sender = sender_result.scalar_one_or_none()
    if not sender:
        raise HTTPException(status_code=404, detail="Sender account not found")
    if not sender.can_withdraw:
        raise HTTPException(status_code=400, detail="Withdrawals not allowed from this account")
    if sender.balance < data.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    receiver_result = await session.execute(
        select(AccountTable).where(
            AccountTable.account_number == data.receiver_account_number
        )
    )
    receiver = receiver_result.scalar_one_or_none()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver account not found")
    if sender.id == receiver.id:
        raise HTTPException(status_code=400, detail="Cannot transfer to same account")

    sender.balance -= data.amount
    receiver.balance += data.amount

    transaction = TransactionTable(
        sender_account_id=sender.id,
        receiver_account_id=receiver.id,
        amount=data.amount,
        description=data.description,
    )
    session.add(transaction)
    await session.commit()
    await session.refresh(transaction)

    return {
        "transaction_id": transaction.id,
        "sender_new_balance": sender.balance,
        "message": "Transfer successful",
    }


@app.get("/api/transactions", response_model=list[TransactionOut], tags=["transactions"])
async def get_transactions(
    account_number: str,
    user: UserTable = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    acc_result = await session.execute(
        select(AccountTable).where(
            AccountTable.account_number == account_number,
            AccountTable.user_id == user.id,
        )
    )
    account = acc_result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    result = await session.execute(
        select(TransactionTable).where(
            (TransactionTable.sender_account_id == account.id)
            | (TransactionTable.receiver_account_id == account.id)
        ).order_by(TransactionTable.created_at.desc()).limit(50)
    )
    return result.scalars().all()


@app.get("/api/health", tags=["system"])
async def health():
    return {"status": "ok"}
