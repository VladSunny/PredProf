from sqlalchemy.orm import Session
from .. import models, schemas, auth
from typing import List, Optional


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_full_name(db: Session, full_name: str):
    return db.query(models.User).filter(models.User.full_name == full_name).first()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)

    db_user = models.User(
        email=user.email,
        full_name=user.full_name,
        parallel=user.parallel,
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


def update_user_personal_info(db: Session, user_id: int, personal_info_update: schemas.UserPersonalInfoUpdate):
    """Обновление личной информации пользователя (ФИО, параллель)"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None

    update_data = personal_info_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user


def update_user_password(db: Session, user_id: int, old_password: str, new_password: str):
    """Обновление пароля пользователя"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None

    # Проверяем старый пароль
    if not auth.verify_password(old_password, db_user.hashed_password):
        return False  # False indicates incorrect old password

    # Обновляем пароль
    db_user.hashed_password = auth.get_password_hash(new_password)
    db.commit()
    db.refresh(db_user)
    return db_user