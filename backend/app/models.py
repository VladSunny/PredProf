from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Enum, Text, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

# Association tables for many-to-many relationships
dish_allergen_association = Table(
    'dish_allergen',
    Base.metadata,
    Column('dish_id', Integer, ForeignKey('dishes.id'), primary_key=True),
    Column('allergen_id', Integer, ForeignKey('allergens.id'), primary_key=True)
)

user_allergen_association = Table(
    'user_allergen',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('allergen_id', Integer, ForeignKey('allergens.id'), primary_key=True)
)

class UserRole(str, enum.Enum):
    STUDENT = "student"
    CHEF = "chef"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    parallel = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.STUDENT, nullable=False)

    balance = Column(Float, default=0.0)
    allergies = Column(Text, nullable=True)
    preferences = Column(Text, nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    orders = relationship("Order", back_populates="student")
    reviews = relationship("Review", back_populates="student")
    allergens_rel = relationship("Allergen", secondary=user_allergen_association, back_populates="users")

class Dish(Base):
    """Меню завтраков и обедов"""
    __tablename__ = "dishes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    is_breakfast = Column(Boolean, default=True)
    stock_quantity = Column(Integer, default=0)
    allergens = Column(Text, nullable=True)

    orders = relationship("Order", back_populates="dish")
    reviews = relationship("Review", back_populates="dish")
    allergens_rel = relationship("Allergen", secondary=dish_allergen_association, back_populates="dishes")

class Order(Base):
    """Учет выданных блюд и оплат"""
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    dish_id = Column(Integer, ForeignKey("dishes.id"))

    order_date = Column(DateTime(timezone=True), nullable=True)
    payment_type = Column(String)
    is_received = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("User", back_populates="orders")
    dish = relationship("Dish", back_populates="orders")

class PurchaseRequest(Base):
    """Заявки на закупку продуктов от повара"""
    __tablename__ = "purchase_requests"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, nullable=False)
    quantity = Column(String, nullable=False)
    status = Column(String, default="pending")
    chef_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class BalanceTopupRequest(Base):
    """Заявки на пополнение баланса от студентов (требуют подтверждения админа)"""
    __tablename__ = "balance_topup_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="pending", nullable=False)  # pending, approved, rejected
    admin_comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    student = relationship("User", back_populates="topup_requests")


# Add relationship to User model
User.topup_requests = relationship("BalanceTopupRequest", back_populates="student")

class Review(Base):
    """Отзывы о блюдах"""
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    dish_id = Column(Integer, ForeignKey("dishes.id"))
    rating = Column(Integer)
    comment = Column(Text)

    student = relationship("User", back_populates="reviews")
    dish = relationship("Dish", back_populates="reviews")

class Allergen(Base):
    """Аллергены"""
    __tablename__ = "allergens"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    dishes = relationship("Dish", secondary=dish_allergen_association, back_populates="allergens_rel")
    users = relationship("User", secondary=user_allergen_association, back_populates="allergens_rel")