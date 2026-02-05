from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional


def create_review(db: Session, review: schemas.ReviewCreate, student_id: int):
    """Создать отзыв"""
    db_review = models.Review(
        **review.model_dump(),
        student_id=student_id
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


def get_dish_reviews(db: Session, dish_id: int, skip: int = 0, limit: int = 100):
    """Получить отзывы о блюде"""
    return db.query(models.Review)\
        .filter(models.Review.dish_id == dish_id)\
        .offset(skip).limit(limit).all()


def get_user_reviews(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Получить отзывы пользователя"""
    return db.query(models.Review)\
        .filter(models.Review.student_id == user_id)\
        .offset(skip).limit(limit).all()