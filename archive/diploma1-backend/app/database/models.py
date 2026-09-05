import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, Integer, String, select

DATABASE_URL = os.getenv("DATABASE_URL", "").replace(
    "postgresql://", "postgresql+asyncpg://"
)

engine = create_async_engine(DATABASE_URL, echo=True)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)


async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def create_new_user(phone: str, name: str, password: str) -> int:
    async with async_session() as session:
        async with session.begin():
            new_user = User(name=name, phone=phone, password=password)
            session.add(new_user)
        await session.refresh(new_user)
        return new_user.id


async def get_user_by_phone(phone: str):
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.phone == phone)
        )
        return result.scalars().first()


async def get_user_by_id(user_id: int):
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalars().first()
