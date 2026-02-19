from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from .. import models, schemas, crud, auth, dependencies
from ..database import get_db

router = APIRouter()


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


@router.patch("/me/personal-info", response_model=schemas.User)
def update_personal_info(
    personal_info_update: schemas.UserPersonalInfoUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.get_current_user)
):
    """Обновить личную информацию (ФИО, параллель)"""
    updated_user = crud.update_user_personal_info(db, current_user.id, personal_info_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return updated_user


@router.patch("/me/password", response_model=dict)
def update_password(
    password_update: schemas.PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.get_current_user)
):
    """Обновить пароль"""
    result = crud.update_user_password(db, current_user.id, password_update.old_password, password_update.new_password)
    if result is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    elif result is False:
        raise HTTPException(status_code=400, detail="Неверный старый пароль")
    return {"message": "Пароль успешно обновлен"}


@router.post("/me/balance/topup", response_model=schemas.BalanceTopupRequest, status_code=status.HTTP_201_CREATED)
def request_balance_topup(
    balance_update: schemas.UserBalanceUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_student)
):
    """Создать заявку на пополнение баланса (требует подтверждения админа)"""
    topup_request = crud.create_topup_request(db, current_user.id, balance_update.amount)
    return topup_request


@router.get("/me/balance/requests", response_model=list[schemas.BalanceTopupRequest])
def get_my_topup_requests(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None, pattern="^(pending|approved|rejected)$"),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_student)
):
    """Получить мои заявки на пополнение баланса"""
    return crud.get_student_topup_requests(db, current_user.id, skip=skip, limit=limit, status=status)


@router.get("/menu", response_model=list[schemas.Dish])
def get_menu(
    is_breakfast: Optional[bool] = Query(None, description="Фильтр по типу: true - завтрак, false - обед"),
    exclude_allergens: Optional[bool] = Query(True, description="Исключить блюда с аллергенами пользователя"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.get_current_user)
):
    """Просмотр меню с фильтрацией по аллергенам"""
    exclude_allergen_ids = None
    if exclude_allergens and current_user.allergens_rel:
        exclude_allergen_ids = [allergen.id for allergen in current_user.allergens_rel]
    
    dishes = crud.get_dishes(
        db, 
        skip=skip, 
        limit=limit, 
        is_breakfast=is_breakfast,
        exclude_allergen_ids=exclude_allergen_ids
    )
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