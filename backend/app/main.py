from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routes.public_routes import router as public_router
from .routes.student_routes import router as student_router
from .routes.chef_routes import router as chef_router
from .routes.admin_routes import router as admin_router

# Создаем таблицы в БД
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Школьная столовая - API",
    version="1.0.0",
    description="API для автоматизированной системы управления школьной столовой"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Включение маршрутов
app.include_router(public_router)
app.include_router(student_router)
app.include_router(chef_router)
app.include_router(admin_router)