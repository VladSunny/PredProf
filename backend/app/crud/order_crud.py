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
    if not student:
        return None

    # Calculate total cost based on payment type and subscription weeks
    if order.payment_type == "subscription":
        # For subscription, we need to calculate the total cost for all weeks
        num_orders = order.subscription_weeks if order.subscription_weeks else 1
        
        # Check if the student has enough balance for all orders
        total_cost = dish.price * num_orders
        if student.balance < total_cost:
            return None
        
        # Deduct the total cost from the student's balance
        student.balance -= total_cost
        
        # Create multiple orders for each week
        from datetime import timedelta
        import calendar
        
        # Determine the day of the week for the order
        order_day = order.order_date.weekday() if order.order_date else datetime.now().weekday()
        
        created_orders = []
        for week in range(num_orders):
            # Calculate the date for this week's order
            if order.order_date:
                order_date = order.order_date + timedelta(weeks=week)
            else:
                # If no specific date provided, use the corresponding day of the week for each week
                days_ahead = order_day - datetime.now().weekday()
                if days_ahead <= 0:  # Target day already happened this week
                    days_ahead += 7
                base_date = datetime.now() + timedelta(days_ahead)
                order_date = base_date + timedelta(weeks=week)
            
            # Create the order
            db_order = models.Order(
                student_id=student_id,
                dish_id=order.dish_id,
                order_date=order_date,
                payment_type=order.payment_type
            )
            db.add(db_order)
            created_orders.append(db_order)
            
            # Decrease stock quantity for each order
            dish.stock_quantity -= 1
        
        db.commit()
        
        # Return the first order (the API expects a single order object)
        return created_orders[0]
    
    else:  # one-time payment
        if student.balance < dish.price:
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


def get_all_orders_with_student(db: Session, skip: int = 0, limit: int = 100):
    """Получить все заказы с информацией о студенте (для повара/админа)"""
    return db.query(models.Order).options(joinedload(models.Order.dish), joinedload(models.Order.student)).offset(skip).limit(limit).all()


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


def get_today_orders_with_student(db: Session):
    """Получить заказы на сегодня с информацией о студенте (для повара)"""
    today = datetime.now().date()

    return db.query(models.Order).options(joinedload(models.Order.dish), joinedload(models.Order.student)).filter(
        func.date(func.coalesce(models.Order.order_date, models.Order.created_at)) == today
    ).all()