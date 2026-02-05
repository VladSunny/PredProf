from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from .. import models, schemas, crud, auth, dependencies
from ..database import get_db

router = APIRouter()

# ========== Эндпоинты для учеников ==========

@router.get("/me", response_model=schemas.User)
def get_current_user_profile(current_user: schemas.User = Depends(dependencies.get_current_user)):
    """Получить информацию о текущем пользователе"""
    return current_user


@router.patch("/me/profile", response_model=schemas.User)
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


@router.post("/me/balance", response_model=schemas.User)
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


@router.get("/menu", response_model=list[schemas.Dish])
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


@router.post("/orders", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
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


@router.get("/orders/my", response_model=list[schemas.Order])
def get_my_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_student)
):
    """Получить мои заказы"""
    orders = crud.get_user_orders(db, current_user.id, skip=skip, limit=limit)
    return orders


@router.post("/orders/{order_id}/receive", response_model=schemas.Order)
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


@router.post("/reviews", response_model=schemas.Review, status_code=status.HTTP_201_CREATED)
def create_review(
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_student)
):
    """Оставить отзыв о блюде"""
    return crud.create_review(db, review, current_user.id)


@router.get("/dishes/{dish_id}/reviews", response_model=list[schemas.Review])
def get_dish_reviews(
    dish_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.get_current_user)
):
    """Получить отзывы о блюде"""
    return crud.get_dish_reviews(db, dish_id, skip=skip, limit=limit)