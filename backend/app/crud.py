# backend/app/crud.py
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from . import models, schemas, auth
from typing import List, Optional
from datetime import datetime

# Операции с пользователями
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        role=user.role if user.role else models.UserRole.STUDENT,
        allergies=user.allergies,
        preferences=user.preferences
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_profile(db: Session, user_id: int, profile_update: schemas.UserProfileUpdate):
    """Обновление профиля пользователя (аллергии, предпочтения)"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    
    update_data = profile_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_balance(db: Session, user_id: int, amount: float):
    """Пополнение баланса пользователя"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    
    db_user.balance += amount
    db.commit()
    db.refresh(db_user)
    return db_user

# Операции с блюдами
def get_dishes(db: Session, skip: int = 0, limit: int = 100, is_breakfast: Optional[bool] = None):
    """Получить блюда с фильтрацией по типу (завтрак/обед)"""
    query = db.query(models.Dish)
    if is_breakfast is not None:
        query = query.filter(models.Dish.is_breakfast == is_breakfast)
    return query.offset(skip).limit(limit).all()

def get_dish_by_id(db: Session, dish_id: int):
    return db.query(models.Dish).filter(models.Dish.id == dish_id).first()

def create_dish(db: Session, dish: schemas.DishCreate):
    """Создать новое блюдо (для админа/повара)"""
    db_dish = models.Dish(**dish.dict())
    db.add(db_dish)
    db.commit()
    db.refresh(db_dish)
    return db_dish

def update_dish(db: Session, dish_id: int, dish_update: schemas.DishUpdate):
    """Обновить информацию о блюде"""
    db_dish = db.query(models.Dish).filter(models.Dish.id == dish_id).first()
    if not db_dish:
        return None
    
    update_data = dish_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_dish, key, value)
    
    db.commit()
    db.refresh(db_dish)
    return db_dish

def delete_dish(db: Session, dish_id: int):
    dish = db.query(models.Dish).filter(models.Dish.id == dish_id).first()
    if dish:
        db.delete(dish)
        db.commit()
    return dish

# Операции с заказами
def create_order(db: Session, order: schemas.OrderCreate, student_id: int):
    """Создать заказ"""
    # Проверяем наличие блюда
    dish = get_dish_by_id(db, order.dish_id)
    if not dish:
        return None
    
    # Проверяем баланс студента
    student = db.query(models.User).filter(models.User.id == student_id).first()
    if not student or student.balance < dish.price:
        return None
    
    # Списание средств
    student.balance -= dish.price
    
    # Создание заказа
    db_order = models.Order(
        student_id=student_id,
        dish_id=order.dish_id,
        payment_type=order.payment_type
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Уменьшаем остаток блюда
    dish.stock_quantity -= 1
    db.commit()
    
    return db_order

def get_user_orders(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Получить заказы пользователя"""
    return db.query(models.Order).filter(models.Order.student_id == user_id)\
        .offset(skip).limit(limit).all()

def get_all_orders(db: Session, skip: int = 0, limit: int = 100):
    """Получить все заказы (для повара/админа)"""
    return db.query(models.Order).offset(skip).limit(limit).all()

def mark_order_received(db: Session, order_id: int, user_id: int):
    """Отметить заказ как полученный"""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order or order.student_id != user_id:
        return None
    
    order.is_received = True
    db.commit()
    db.refresh(order)
    return order

def get_today_orders(db: Session):
    """Получить заказы на сегодня (для повара)"""
    today = datetime.now().date()
    return db.query(models.Order).filter(
        func.date(models.Order.created_at) == today
    ).all()

# Операции с заявками на закупку
def create_purchase_request(db: Session, request: schemas.PurchaseRequestCreate, chef_id: int):
    """Создать заявку на закупку"""
    db_request = models.PurchaseRequest(
        **request.model_dump(),
        chef_id=chef_id
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def get_purchase_requests(db: Session, skip: int = 0, limit: int = 100, 
                         status: Optional[str] = None):
    """Получить заявки на закупку"""
    query = db.query(models.PurchaseRequest)
    if status:
        query = query.filter(models.PurchaseRequest.status == status)
    return query.offset(skip).limit(limit).all()

def update_purchase_request_status(db: Session, request_id: int, status: str):
    """Обновить статус заявки на закупку"""
    request = db.query(models.PurchaseRequest)\
        .filter(models.PurchaseRequest.id == request_id).first()
    if not request:
        return None
    
    request.status = status
    db.commit()
    db.refresh(request)
    return request

# Операции с отзывами
def create_review(db: Session, review: schemas.ReviewCreate, student_id: int):
    """Создать отзыв"""
    db_review = models.Review(
        **review.dict(),
        student_id=student_id
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_dish_reviews(db: Session, dish_id: int, skip: int = 0, limit: int = 100):
    """Получить отзывы о блюде"""
    return db.query(models.Review)\
        .filter(models.Review.dish_id == dish_id)\
        .offset(skip).limit(limit).all()

def get_user_reviews(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Получить отзывы пользователя"""
    return db.query(models.Review)\
        .filter(models.Review.student_id == user_id)\
        .offset(skip).limit(limit).all()

# Статистика для администратора
def get_payment_statistics(db: Session, start_date: Optional[datetime] = None, 
                          end_date: Optional[datetime] = None):
    """Статистика оплат"""
    query = db.query(models.Order)
    
    if start_date:
        query = query.filter(models.Order.created_at >= start_date)
    if end_date:
        query = query.filter(models.Order.created_at <= end_date)
    
    orders = query.all()
    total_revenue = sum(order.dish.price for order in orders)
    orders_count = len(orders)
    
    return {
        "total_revenue": total_revenue,
        "orders_count": orders_count,
        "average_order_value": total_revenue / orders_count if orders_count > 0 else 0
    }

def get_attendance_statistics(db: Session, start_date: Optional[datetime] = None,
                             end_date: Optional[datetime] = None):
    """Статистика посещаемости"""
    query = db.query(models.Order)
    
    if start_date:
        query = query.filter(models.Order.created_at >= start_date)
    if end_date:
        query = query.filter(models.Order.created_at <= end_date)
    
    unique_users = db.query(func.count(func.distinct(models.Order.student_id))).scalar()
    total_orders = query.count()
    
    return {
        "unique_users": unique_users,
        "total_orders": total_orders,
        "average_orders_per_user": total_orders / unique_users if unique_users > 0 else 0
    }