from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

DATABASE_URL = "postgresql+asyncpg://bank_user:1234@localhost/bank_db"

engine = create_async_engine(
    DATABASE_URL,
    echo= True,
    future= True
)

AsyncSessionLocal = async_sessionmaker(
    bind= engine,
    class_=AsyncSession,
    expire_on_commit=False
) 

async def get_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
        
        