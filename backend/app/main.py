# backend/app/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
import os

from . import models, schemas, crud, auth, dependencies
from .database import engine, get_db

# Создаем таблицы в БД (в продакшене используйте миграции!)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Simple API Example", version="1.0.0")

# Настройка CORS (для работы с фронтендом)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене укажите конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Регистрация пользователя
@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""
    # Проверяем, не занят ли email
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email уже зарегистрирован"
        )
    
    # Проверяем, не занят ли username
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Имя пользователя уже занято"
        )
    
    return crud.create_user(db=db, user=user)

# Авторизация и получение токена
@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """Авторизация и получение JWT токена"""
    # Ищем пользователя
    db_user = crud.get_user_by_username(db, username=user.username)
    
    # Проверяем пароль
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
        )
    
    # Создаем токен
    access_token_expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)))
    access_token = auth.create_access_token(
        data={"sub": db_user.username, "is_admin": db_user.is_admin},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Получить профиль текущего пользователя
@app.get("/me", response_model=schemas.User)
def read_users_me(current_user: schemas.User = Depends(dependencies.get_current_user)):
    """Получить информацию о текущем пользователе"""
    return current_user

# Получить все предметы (только для админов)
@app.get("/admin/items", response_model=list[schemas.Item])
def read_all_items(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.get_current_admin)
):
    """Получить все предметы (только админы)"""
    items = crud.get_items(db, skip=skip, limit=limit)
    return items

# CRUD для предметов (только свои предметы)
@app.get("/items", response_model=list[schemas.Item])
def read_my_items(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.get_current_user)
):
    """Получить предметы текущего пользователя"""
    items = crud.get_user_items(db, user_id=current_user.id, skip=skip, limit=limit)
    return items

@app.post("/items", response_model=schemas.Item)
def create_item(
    item: schemas.ItemCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.get_current_user)
):
    """Создать новый предмет"""
    return crud.create_user_item(db=db, item=item, user_id=current_user.id)

@app.get("/items/{item_id}", response_model=schemas.Item)
def read_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.get_current_user)
):
    """Получить один предмет (только свой или админ)"""
    item = crud.get_item_by_id(db, item_id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Предмет не найден")
    if item.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    return item

@app.patch("/items/{item_id}", response_model=schemas.Item)
def update_item(
    item_id: int,
    item_update: schemas.ItemUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.get_current_user)
):
    """Обновить свой предмет (или админ любой)"""
    item = crud.get_item_by_id(db, item_id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Предмет не найден")
    if item.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    update_data = item_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
    
    db.commit()
    db.refresh(item)
    return item

@app.delete("/items/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.get_current_user)
):
    """Удалить свой предмет (или админ любой)"""
    item = crud.get_item_by_id(db, item_id=item_id)
    
    if not item:
        raise HTTPException(status_code=404, detail="Предмет не найден")
    
    if item.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Недостаточно прав для удаления этого предмета")
    
    crud.delete_item(db, item_id=item_id)
    return {"message": "Предмет удален"}

# Публичный endpoint (без авторизации)
@app.get("/")
def read_root():
    return {"message": "Добро пожаловать в API! Используйте /login для авторизации"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}