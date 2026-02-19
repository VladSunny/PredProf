from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from typing import List, Optional


def create_topup_request(db: Session, student_id: int, amount: float):
    """Создание заявки на пополнение баланса"""
    db_request = models.BalanceTopupRequest(
        student_id=student_id,
        amount=amount,
        status="pending"
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request


def get_student_topup_requests(
    db: Session,
    student_id: int,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
) -> List[models.BalanceTopupRequest]:
    """Получение заявок на пополнение баланса студента"""
    query = db.query(models.BalanceTopupRequest).filter(
        models.BalanceTopupRequest.student_id == student_id
    )
    
    if status:
        query = query.filter(models.BalanceTopupRequest.status == status)
    
    return query.order_by(
        models.BalanceTopupRequest.created_at.desc()
    ).offset(skip).limit(limit).all()


def get_all_topup_requests(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
) -> List[models.BalanceTopupRequest]:
    """Получение всех заявок на пополнение баланса (для админа)"""
    query = db.query(models.BalanceTopupRequest).options(
        joinedload(models.BalanceTopupRequest.student)
    )
    
    if status:
        query = query.filter(models.BalanceTopupRequest.status == status)
    
    return query.order_by(
        models.BalanceTopupRequest.created_at.desc()
    ).offset(skip).limit(limit).all()


def get_topup_request_by_id(db: Session, request_id: int) -> Optional[models.BalanceTopupRequest]:
    """Получение заявки на пополнение баланса по ID"""
    return db.query(models.BalanceTopupRequest).options(
        joinedload(models.BalanceTopupRequest.student)
    ).filter(models.BalanceTopupRequest.id == request_id).first()


def update_topup_request_status(
    db: Session,
    request_id: int,
    status: str,
    admin_comment: Optional[str] = None
) -> Optional[models.BalanceTopupRequest]:
    """Обновление статуса заявки на пополнение баланса"""
    db_request = db.query(models.BalanceTopupRequest).filter(
        models.BalanceTopupRequest.id == request_id
    ).first()
    
    if not db_request:
        return None
    
    db_request.status = status
    if admin_comment is not None:
        db_request.admin_comment = admin_comment
    
    # If approved, update user balance
    if status == "approved":
        user = db.query(models.User).filter(models.User.id == db_request.student_id).first()
        if user:
            user.balance += db_request.amount
    
    db.commit()
    db.refresh(db_request)
    return db_request


def get_pending_topup_requests_count(db: Session) -> int:
    """Получение количества ожидающих заявок"""
    return db.query(models.BalanceTopupRequest).filter(
        models.BalanceTopupRequest.status == "pending"
    ).count()
