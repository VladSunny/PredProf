from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from .. import models, schemas
from . import allergen_crud
from typing import List, Optional


def get_dishes(db: Session, skip: int = 0, limit: int = 100, meal_type: Optional[str] = None, exclude_allergen_ids: Optional[List[int]] = None):
    """Получить блюда с фильтрацией по типу приема пищи и исключением аллергенов"""
    query = db.query(models.Dish).options(joinedload(models.Dish.allergens_rel), joinedload(models.Dish.meal_types))
    
    if meal_type:
        query = query.filter(models.Dish.meal_types.any(models.MealType.name == meal_type))

    # Filter out dishes that contain any of the excluded allergens
    if exclude_allergen_ids:
        # Subquery to find dishes with excluded allergens
        excluded_dish_ids = db.query(models.dish_allergen_association.c.dish_id).filter(
            models.dish_allergen_association.c.allergen_id.in_(exclude_allergen_ids)
        ).distinct()
        query = query.filter(~models.Dish.id.in_(excluded_dish_ids))

    return query.offset(skip).limit(limit).all()


def get_dish_by_id(db: Session, dish_id: int):
    return db.query(models.Dish).options(joinedload(models.Dish.allergens_rel), joinedload(models.Dish.meal_types)).filter(models.Dish.id == dish_id).first()


def create_dish(db: Session, dish: schemas.DishCreate):
    """Создать новое блюдо (для админа/повара)"""
    dish_data = dish.model_dump(exclude={'allergen_ids', 'meal_type_ids'})
    db_dish = models.Dish(**dish_data)

    # Handle allergens
    if dish.allergen_ids:
        allergens = allergen_crud.get_allergens_by_ids(db, dish.allergen_ids)
        db_dish.allergens_rel = allergens

    # Handle meal types
    if dish.meal_type_ids:
        meal_types = db.query(models.MealType).filter(models.MealType.id.in_(dish.meal_type_ids)).all()
        db_dish.meal_types = meal_types

    db.add(db_dish)
    db.commit()
    db.refresh(db_dish)
    return db_dish


def update_dish(db: Session, dish_id: int, dish_update: schemas.DishUpdate):
    """Обновить информацию о блюде"""
    db_dish = db.query(models.Dish).filter(models.Dish.id == dish_id).first()
    if not db_dish:
        return None

    update_data = dish_update.model_dump(exclude_unset=True, exclude={'allergen_ids', 'meal_type_ids'})
    for key, value in update_data.items():
        setattr(db_dish, key, value)

    # Handle allergens update
    if 'allergen_ids' in dish_update.model_dump(exclude_unset=True):
        allergen_ids = dish_update.allergen_ids
        if allergen_ids is not None:
            allergens = allergen_crud.get_allergens_by_ids(db, allergen_ids)
            db_dish.allergens_rel = allergens
        else:
            db_dish.allergens_rel = []

    # Handle meal types update
    if 'meal_type_ids' in dish_update.model_dump(exclude_unset=True):
        meal_type_ids = dish_update.meal_type_ids
        if meal_type_ids is not None:
            meal_types = db.query(models.MealType).filter(models.MealType.id.in_(meal_type_ids)).all()
            db_dish.meal_types = meal_types
        else:
            db_dish.meal_types = []

    db.commit()
    db.refresh(db_dish)
    return db_dish


def delete_dish(db: Session, dish_id: int):
    dish = db.query(models.Dish).filter(models.Dish.id == dish_id).first()
    if dish:
        db.delete(dish)
        db.commit()
    return dish