from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from sqlalchemy.orm import joinedload
from .. import models, schemas
from . import dish_crud
from typing import List, Optional
from datetime import datetime


def create_order(db: Session, order: schemas.OrderCreate, student_id: int):
    """Создать заказ"""
    # Проверяем наличие блюда
    dish = dish_crud.get_dish_by_id(db, order.dish_id)
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
        order_date=order.order_date,
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
    return db.query(models.Order).options(joinedload(models.Order.dish))\
        .filter(models.Order.student_id == user_id).offset(skip).limit(limit).all()


def get_all_orders(db: Session, skip: int = 0, limit: int = 100):
    """Получить все заказы (для повара/админа)"""
    return db.query(models.Order).options(joinedload(models.Order.dish)).offset(skip).limit(limit).all()


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
    
    return db.query(models.Order).options(joinedload(models.Order.dish)).filter(
        func.date(func.coalesce(models.Order.order_date, models.Order.created_at)) == today
    ).all()