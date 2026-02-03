# backend/app/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    CHEF = "chef"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.STUDENT, nullable=False) # Роли из ТЗ [cite: 10]
    
    # Поля для ученика 
    balance = Column(Float, default=0.0)
    allergies = Column(Text, nullable=True) # Пищевые аллергии
    preferences = Column(Text, nullable=True) # Предпочтения
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    orders = relationship("Order", back_populates="student")
    reviews = relationship("Review", back_populates="student")

class Dish(Base):
    """Меню завтраков и обедов [cite: 12]"""
    __tablename__ = "dishes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    is_breakfast = Column(Boolean, default=True) # True - завтрак, False - обед [cite: 12]
    stock_quantity = Column(Integer, default=0) # Контроль остатков [cite: 14]

    orders = relationship("Order", back_populates="dish")
    reviews = relationship("Review", back_populates="dish")

class Order(Base):
    """Учет выданных блюд и оплат """
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    dish_id = Column(Integer, ForeignKey("dishes.id"))
    
    payment_type = Column(String) # "one-time" или "subscription" [cite: 12]
    is_received = Column(Boolean, default=False) # Отметка о получении [cite: 13, 14]
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("User", back_populates="orders")
    dish = relationship("Dish", back_populates="orders")

class PurchaseRequest(Base):
    """Заявки на закупку продуктов от повара [cite: 15]"""
    __tablename__ = "purchase_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, nullable=False)
    quantity = Column(String, nullable=False)
    status = Column(String, default="pending") # pending, approved, rejected [cite: 16]
    chef_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Review(Base):
    """Отзывы о блюдах """
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    dish_id = Column(Integer, ForeignKey("dishes.id"))
    rating = Column(Integer) # Оценка 1-5
    comment = Column(Text)

    student = relationship("User", back_populates="reviews")
    dish = relationship("Dish", back_populates="reviews")