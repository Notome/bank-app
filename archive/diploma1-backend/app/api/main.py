from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer

from app.database.models import init_db, create_new_user, get_user_by_phone, get_user_by_id
from app.core.security import hash_password, verify_password, create_access_token, decode_token
from app.schemas.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Bank API", lifespan=lifespan)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    """Dependency: проверяет токен и возвращает user_id."""
    return decode_token(token)


@app.post("/register", response_model=TokenResponse)
async def register(body: RegisterRequest):
    existing = await get_user_by_phone(body.phone)
    if existing:
        raise HTTPException(status_code=409, detail="Пользователь уже существует")

    user_id = await create_new_user(body.phone, body.name, hash_password(body.password))
    token = create_access_token({"sub": str(user_id)})
    return TokenResponse(access_token=token)


@app.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    user = await get_user_by_phone(body.phone)

    if not user or not verify_password(body.password, user.password):
        raise HTTPException(status_code=401, detail="Неверный телефон или пароль")

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)


@app.get("/me", response_model=UserResponse)
async def get_me(current_user_id: str = Depends(get_current_user)):
    user = await get_user_by_id(int(current_user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return UserResponse.model_validate(user)


@app.post("/transfer_money")
async def transfer_money(current_user_id: str = Depends(get_current_user)):
    return {"message": "transfer_money — в разработке"}


@app.get("/get_money")
async def get_money(current_user_id: str = Depends(get_current_user)):
    return {"message": "get_money — в разработке"}


@app.post("/create_deposit")
async def create_deposit(current_user_id: str = Depends(get_current_user)):
    return {"message": "create_deposit — в разработке"}
