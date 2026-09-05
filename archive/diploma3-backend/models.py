from sqlalchemy import Integer, String, ForeignKey, Boolean, DateTime, Float
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
import enum
from datetime import datetime

class AccountType(str, enum.Enum):
    CARD = "card"
    SAVINGS = "savings"
    DEPOSIT = "deposit"

class Base(DeclarativeBase):
    pass

class UserTable(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)

    accounts: Mapped[list["AccountTable"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

class AccountTable(Base):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    account_number: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    balance: Mapped[int] = mapped_column(Integer, default=0)

    type: Mapped[str] = mapped_column(String, nullable=False)  

    interest_rate: Mapped[float | None] = mapped_column(Float, nullable=True)

    can_withdraw: Mapped[bool] = mapped_column(Boolean, default=True)

    deposit_end_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user: Mapped["UserTable"] = relationship(back_populates="accounts")

    cards: Mapped[list["CardTable"]] = relationship(
        back_populates="account",
        cascade="all, delete-orphan"
    )


class CardTable(Base):
    __tablename__ = "cards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    card_number: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"))

    account: Mapped["AccountTable"] = relationship(back_populates="cards")

class TransactionTable(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    sender_account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"))
    receiver_account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"))

    amount: Mapped[int] = mapped_column(Integer, nullable=False)

    sender_account: Mapped["AccountTable"] = relationship(
        foreign_keys=[sender_account_id]
    )

    receiver_account: Mapped["AccountTable"] = relationship(
        foreign_keys=[receiver_account_id]
    )
    