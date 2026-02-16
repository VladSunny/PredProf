from sqlalchemy.orm import Session
from .. import models, schemas
from typing import List, Optional


def get_allergen_by_id(db: Session, allergen_id: int):
    """Получить аллерген по ID"""
    return db.query(models.Allergen).filter(models.Allergen.id == allergen_id).first()


def get_allergen_by_name(db: Session, name: str):
    """Получить аллерген по названию"""
    return db.query(models.Allergen).filter(models.Allergen.name == name).first()


def get_all_allergens(db: Session, skip: int = 0, limit: int = 100):
    """Получить все аллергены"""
    return db.query(models.Allergen).offset(skip).limit(limit).all()


def create_allergen(db: Session, allergen: schemas.AllergenCreate):
    """Создать новый аллерген"""
    db_allergen = models.Allergen(**allergen.model_dump())
    db.add(db_allergen)
    db.commit()
    db.refresh(db_allergen)
    return db_allergen


def get_allergens_by_ids(db: Session, allergen_ids: List[int]) -> List[models.Allergen]:
    """Получить аллергены по списку ID"""
    if not allergen_ids:
        return []
    return db.query(models.Allergen).filter(models.Allergen.id.in_(allergen_ids)).all()
