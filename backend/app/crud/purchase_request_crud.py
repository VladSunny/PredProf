from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional


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