from session import engine
from models import Base

async def init_bd():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
