from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional


def get_dishes(db: Session, skip: int = 0, limit: int = 100, is_breakfast: Optional[bool] = None):
    """Получить блюда с фильтрацией по типу (завтрак/обед)"""
    query = db.query(models.Dish)
    if is_breakfast is not None:
        query = query.filter(models.Dish.is_breakfast == is_breakfast)
    return query.offset(skip).limit(limit).all()


def get_dish_by_id(db: Session, dish_id: int):
    return db.query(models.Dish).filter(models.Dish.id == dish_id).first()


def create_dish(db: Session, dish: schemas.DishCreate):
    """Создать новое блюдо (для админа/повара)"""
    db_dish = models.Dish(**dish.model_dump())
    db.add(db_dish)
    db.commit()
    db.refresh(db_dish)
    return db_dish


def update_dish(db: Session, dish_id: int, dish_update: schemas.DishUpdate):
    """Обновить информацию о блюде"""
    db_dish = db.query(models.Dish).filter(models.Dish.id == dish_id).first()
    if not db_dish:
        return None

    update_data = dish_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_dish, key, value)

    db.commit()
    db.refresh(db_dish)
    return db_dish


def delete_dish(db: Session, dish_id: int):
    dish = db.query(models.Dish).filter(models.Dish.id == dish_id).first()
    if dish:
        db.delete(dish)
        db.commit()
    return dish