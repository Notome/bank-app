"""
Запускать один раз вручную для создания БД и пользователя:
    python scripts/create_database.py
"""
from sqlalchemy import create_engine, text

ADMIN_URL = "postgresql+psycopg2://postgres:1234@localhost:5432/postgres"
engine = create_engine(ADMIN_URL, isolation_level="AUTOCOMMIT")


def init_database():
    with engine.connect() as conn:
        conn.execute(text("CREATE USER bank_user WITH PASSWORD '1234';"))
        conn.execute(text("CREATE DATABASE bank_db OWNER bank_user TEMPLATE template0;"))
        conn.execute(text("GRANT ALL PRIVILEGES ON DATABASE bank_db TO bank_user;"))
    print("БД и пользователь созданы.")


if __name__ == "__main__":
    init_database()
