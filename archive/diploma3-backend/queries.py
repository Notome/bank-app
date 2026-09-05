from models import *
from sqlalchemy import select

async def select_users(session, phone):
    result = await session.execute(
        select(UserTable).where(UserTable.phone == phone)
    )
    user = result.scalar_or_none()
    
    return user