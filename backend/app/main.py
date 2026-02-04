from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
from typing import Optional

from . import models, schemas, crud, auth, dependencies
from .database import engine, get_db
from .seed import seed_database

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

# ========== Публичные эндпоинты ==========

@app.get("/")
def read_root():
    return {"message": "Добро пожаловать в API школьной столовой!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""
    # Проверяем email
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email уже зарегистрирован"
        )
    
    # Проверяем username
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Имя пользователя уже занято"
        )
    
    return crud.create_user(db=db, user=user)

@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """Авторизация и получение JWT токена"""
    db_user = crud.get_user_by_username(db, username=user.username)
    
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
        )
    
    access_token_expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)))
    access_token = auth.create_access_token(
        data={"sub": db_user.username, "role": db_user.role.value},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": db_user.role
    }

@app.post("/seed")
def seed_test_data(
    db: Session = Depends(get_db)
):
    """
    Заполнить базу данных тестовыми данными.
    Только для администратора в демонстрационных целях.
    """
    print("test")
    return seed_database(db)

# ========== Эндпоинты для учеников ==========

@app.get("/me", response_model=schemas.User)
def get_current_user_profile(current_user: schemas.User = Depends(dependencies.get_current_user)):
    """Получить информацию о текущем пользователе"""
    return current_user

@app.patch("/me/profile", response_model=schemas.User)
def update_profile(
    profile_update: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_student)
):
    """Обновить профиль (аллергии, предпочтения)"""
    updated_user = crud.update_user_profile(db, current_user.id, profile_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return updated_user

@app.post("/me/balance", response_model=schemas.User)
def add_balance(
    balance_update: schemas.UserBalanceUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_student)
):
    """Пополнить баланс"""
    updated_user = crud.update_user_balance(db, current_user.id, balance_update.amount)
    if not updated_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return updated_user

@app.get("/menu", response_model=list[schemas.Dish])
def get_menu(
    is_breakfast: Optional[bool] = Query(None, description="Фильтр по типу: true - завтрак, false - обед"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.get_current_user)
):
    """Просмотр меню"""
    dishes = crud.get_dishes(db, skip=skip, limit=limit, is_breakfast=is_breakfast)
    return dishes

@app.post("/orders", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_student)
):
    """Создать заказ (оплата питания)"""
    result = crud.create_order(db, order, current_user.id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно средств или блюдо недоступно"
        )
    return result

@app.get("/orders/my", response_model=list[schemas.Order])
def get_my_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_student)
):
    """Получить мои заказы"""
    orders = crud.get_user_orders(db, current_user.id, skip=skip, limit=limit)
    return orders

@app.post("/orders/{order_id}/receive", response_model=schemas.Order)
def mark_order_received(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_student)
):
    """Отметить заказ как полученный"""
    order = crud.mark_order_received(db, order_id, current_user.id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден или у вас нет прав")
    return order

@app.post("/reviews", response_model=schemas.Review, status_code=status.HTTP_201_CREATED)
def create_review(
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_student)
):
    """Оставить отзыв о блюде"""
    return crud.create_review(db, review, current_user.id)

@app.get("/dishes/{dish_id}/reviews", response_model=list[schemas.Review])
def get_dish_reviews(
    dish_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.get_current_user)
):
    """Получить отзывы о блюде"""
    return crud.get_dish_reviews(db, dish_id, skip=skip, limit=limit)

# ========== Эндпоинты для поваров ==========

@app.get("/chef/orders", response_model=list[schemas.Order])
def get_all_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_chef)
):
    """Просмотр всех заказов (для учета выданных блюд)"""
    return crud.get_all_orders(db, skip=skip, limit=limit)

@app.get("/chef/orders/today", response_model=list[schemas.Order])
def get_today_orders(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_chef)
):
    """Получить заказы на сегодня"""
    return crud.get_today_orders(db)

@app.get("/chef/dishes", response_model=list[schemas.Dish])
def get_all_dishes_with_stock(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_chef)
):
    """Просмотр блюд с остатками (контроль остатков)"""
    dishes = crud.get_dishes(db, skip=skip, limit=limit)
    return dishes

@app.post("/chef/purchase-requests", response_model=schemas.PurchaseRequest, status_code=status.HTTP_201_CREATED)
def create_purchase_request(
    request: schemas.PurchaseRequestCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_chef)
):
    """Создать заявку на закупку продуктов"""
    return crud.create_purchase_request(db, request, current_user.id)

@app.get("/chef/purchase-requests/my", response_model=list[schemas.PurchaseRequest])
def get_my_purchase_requests(
    status: Optional[str] = Query(None, pattern="^(pending|approved|rejected)$"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_chef)
):
    """Получить мои заявки на закупку"""
    return crud.get_purchase_requests(db, skip=skip, limit=limit, status=status)

# ========== Эндпоинты для администраторов ==========

@app.get("/admin/statistics/payments", response_model=schemas.PaymentStatistics)
def get_payment_statistics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_admin)
):
    """Получить статистику оплат"""
    return crud.get_payment_statistics(db, start_date, end_date)

@app.get("/admin/statistics/attendance", response_model=schemas.AttendanceStatistics)
def get_attendance_statistics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_admin)
):
    """Получить статистику посещаемости"""
    return crud.get_attendance_statistics(db, start_date, end_date)

@app.get("/admin/purchase-requests", response_model=list[schemas.PurchaseRequest])
def get_all_purchase_requests(
    status: Optional[str] = Query(None, pattern="^(pending|approved|rejected)$"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_admin)
):
    """Получить все заявки на закупку"""
    return crud.get_purchase_requests(db, skip=skip, limit=limit, status=status)

@app.patch("/admin/purchase-requests/{request_id}", response_model=schemas.PurchaseRequest)
def update_purchase_request_status(
    request_id: int,
    status_update: schemas.PurchaseRequestUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_admin)
):
    """Обновить статус заявки на закупку (согласование)"""
    request = crud.update_purchase_request_status(db, request_id, status_update.status)
    if not request:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    return request

@app.post("/admin/dishes", response_model=schemas.Dish, status_code=status.HTTP_201_CREATED)
def create_dish(
    dish: schemas.DishCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_admin)
):
    """Создать новое блюдо"""
    return crud.create_dish(db, dish)

@app.patch("/admin/dishes/{dish_id}", response_model=schemas.Dish)
def update_dish(
    dish_id: int,
    dish_update: schemas.DishUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_admin)
):
    """Обновить информацию о блюде"""
    dish = crud.update_dish(db, dish_id, dish_update)
    if not dish:
        raise HTTPException(status_code=404, detail="Блюдо не найдено")
    return dish

@app.delete("/admin/dishes/{dish_id}")
def delete_dish(
    dish_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_admin)
):
    """Удалить блюдо"""
    dish = crud.delete_dish(db, dish_id)
    if not dish:
        raise HTTPException(status_code=404, detail="Блюдо не найдено")
    return {"message": "Блюдо удалено"}

@app.get("/admin/reports/payments")
def generate_payment_report(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_admin)
):
    """Сформировать отчет по оплатам"""
    stats = crud.get_payment_statistics(db, start_date, end_date)
    orders = crud.get_all_orders(db, limit=1000)
    
    return {
        "statistics": stats,
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "orders": [
            {
                "id": order.id,
                "student_id": order.student_id,
                "dish_name": order.dish.name,
                "price": order.dish.price,
                "payment_type": order.payment_type,
                "created_at": order.created_at
            }
            for order in orders
        ]
    }