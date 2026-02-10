from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os

from .. import models, schemas, crud, auth, dependencies
from ..database import get_db
from ..seed import seed_database

router = APIRouter()

# ========== Публичные эндпоинты ==========

@router.get("/")
def read_root():
    return {"message": "Добро пожаловать в API школьной столовой!"}


@router.get("/health")
def health_check():
    return {"status": "healthy"}


@router.post("/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""
    # Проверяем email
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email уже зарегистрирован"
        )

    # Проверяем ФИО
    db_user = crud.get_user_by_full_name(db, full_name=user.full_name)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким ФИО уже зарегистрирован"
        )

    return crud.create_user(db=db, user=user)


@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """Авторизация и получение JWT токена"""
    db_user = crud.get_user_by_email(db, email=user.email)

    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
        )

    access_token_expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)))
    access_token = auth.create_access_token(
        data={"sub": db_user.email, "role": db_user.role.value},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": db_user.role
    }


@router.post("/seed")
def seed_test_data(
    db: Session = Depends(get_db)
):
    """
    Заполнить базу данных тестовыми данными.
    Только для администратора в демонстрационных целей.
    """
    print("test")
    return seed_database(db)