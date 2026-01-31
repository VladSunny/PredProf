# create_tables_context.py
import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv
from contextlib import contextmanager

load_dotenv()

@contextmanager
def get_connection():
    """Контекстный менеджер для подключения к БД"""
    conn = None
    try:
        conn = psycopg2.connect(
            host="localhost",
            port=os.getenv("POSTGRES_PORT", "5432"),
            database=os.getenv("POSTGRES_DB", "postgres"),
            user=os.getenv("POSTGRES_USER", "postgres"),
            password=os.getenv("POSTGRES_PASSWORD", "postgres")
        )
        yield conn
    except Exception as e:
        print(f"Ошибка: {e}")
        raise
    finally:
        if conn:
            conn.close()

def create_tables_from_file(conn, schema_file="schema.sql"):
    """Создает таблицы из SQL файла"""
    try:
        cursor = conn.cursor()
        with open(schema_file, 'r') as file:
            sql_commands = file.read()
            cursor.execute(sql_commands)
        conn.commit()
        cursor.close()
        print(f"Таблицы из файла {schema_file} успешно созданы")
    except Exception as e:
        print(f"Ошибка: {e}")
        conn.rollback()

if __name__ == "__main__":
    # Пример создания таблиц через контекстный менеджер
    with get_connection() as conn:
        create_tables_from_file(conn, "schema.sql")