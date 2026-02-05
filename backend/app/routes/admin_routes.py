from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from .. import models, schemas, crud, auth, dependencies
from ..database import get_db

router = APIRouter()

# ========== Эндпоинты для администраторов ==========

@router.get("/admin/statistics/payments", response_model=schemas.PaymentStatistics)
def get_payment_statistics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_admin)
):
    """Получить статистику оплат"""
    return crud.get_payment_statistics(db, start_date, end_date)


@router.get("/admin/statistics/attendance", response_model=schemas.AttendanceStatistics)
def get_attendance_statistics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_admin)
):
    """Получить статистику посещаемости"""
    return crud.get_attendance_statistics(db, start_date, end_date)


@router.get("/admin/purchase-requests", response_model=list[schemas.PurchaseRequest])
def get_all_purchase_requests(
    status: Optional[str] = Query(None, pattern="^(pending|approved|rejected)$"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_admin)
):
    """Получить все заявки на закупку"""
    return crud.get_purchase_requests(db, skip=skip, limit=limit, status=status)


@router.patch("/admin/purchase-requests/{request_id}", response_model=schemas.PurchaseRequest)
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


@router.post("/admin/dishes", response_model=schemas.Dish, status_code=status.HTTP_201_CREATED)
def create_dish(
    dish: schemas.DishCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_admin)
):
    """Создать новое блюдо"""
    return crud.create_dish(db, dish)


@router.patch("/admin/dishes/{dish_id}", response_model=schemas.Dish)
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


@router.delete("/admin/dishes/{dish_id}")
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


@router.get("/admin/reports/payments")
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