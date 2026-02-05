from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models
from typing import List, Optional
from datetime import datetime


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