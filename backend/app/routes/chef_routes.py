from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from .. import models, schemas, crud, auth, dependencies
from ..database import get_db

router = APIRouter()


@router.get("/chef/orders", response_model=list[schemas.Order])
def get_all_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_chef)
):
    """Просмотр всех заказов (для учета выданных блюд)"""
    return crud.get_all_orders(db, skip=skip, limit=limit)


@router.get("/chef/orders/today", response_model=list[schemas.Order])
def get_today_orders(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_chef)
):
    """Получить заказы на сегодня"""
    return crud.get_today_orders(db)


@router.get("/chef/dishes", response_model=list[schemas.Dish])
def get_all_dishes_with_stock(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_chef)
):
    """Просмотр блюд с остатками (контроль остатков)"""
    dishes = crud.get_dishes(db, skip=skip, limit=limit)
    return dishes


@router.post("/chef/purchase-requests", response_model=schemas.PurchaseRequest, status_code=status.HTTP_201_CREATED)
def create_purchase_request(
    request: schemas.PurchaseRequestCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_chef)
):
    """Создать заявку на закупку продуктов"""
    return crud.create_purchase_request(db, request, current_user.id)


@router.get("/chef/purchase-requests/my", response_model=list[schemas.PurchaseRequest])
def get_my_purchase_requests(
    status: Optional[str] = Query(None, pattern="^(pending|approved|rejected)$"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(dependencies.require_chef)
):
    """Получить мои заявки на закупку"""
    return crud.get_purchase_requests(db, skip=skip, limit=limit, status=status)