FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim

WORKDIR /app

# Копируем файлы зависимостей
COPY pyproject.toml uv.lock ./

# Устанавливаем зависимости
RUN uv sync --frozen --no-dev

# Activate virtual environment
ENV PATH="/app/.venv/bin:$PATH"

# Копируем код приложения
COPY ./app /app/app

# Запускаем приложение
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
