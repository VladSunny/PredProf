from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    STUDENT = "student"
    CHEF = "chef"
    ADMIN = "admin"

# Схемы для пользователей
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: Optional[UserRole] = UserRole.STUDENT
    allergies: Optional[str] = None
    preferences: Optional[str] = None

class UserProfileUpdate(BaseModel):
    allergies: Optional[str] = None
    preferences: Optional[str] = None

class UserBalanceUpdate(BaseModel):
    amount: float = Field(..., gt=0)

class User(UserBase):
    id: int
    role: UserRole
    balance: float
    allergies: Optional[str]
    preferences: Optional[str]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

# Схемы для токенов
class Token(BaseModel):
    access_token: str
    token_type: str
    role: UserRole

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[UserRole] = None

# Схемы для блюд
class DishBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    is_breakfast: bool = True
    stock_quantity: int = Field(..., ge=0)

class DishCreate(DishBase):
    pass

class DishUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    is_breakfast: Optional[bool] = None
    stock_quantity: Optional[int] = None

class Dish(DishBase):
    id: int
    
    class Config:
        from_attributes = True

# Схемы для заказов
class OrderBase(BaseModel):
    dish_id: int
    payment_type: str = Field(..., pattern="^(one-time|subscription)$")

class OrderCreate(OrderBase):
    pass

class DishInfo(BaseModel):
    id: int
    name: str
    price: float

    class Config:
        from_attributes = True

class Order(OrderBase):
    id: int
    student_id: int
    is_received: bool
    created_at: datetime
    dish: Optional[DishInfo] = None

    class Config:
        from_attributes = True

# Схемы для заявок на закупку
class PurchaseRequestBase(BaseModel):
    item_name: str
    quantity: str
    status: Optional[str] = "pending"

class PurchaseRequestCreate(PurchaseRequestBase):
    pass

class PurchaseRequest(PurchaseRequestBase):
    id: int
    chef_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class PurchaseRequestUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|approved|rejected)$")

# Схемы для отзывов
class ReviewBase(BaseModel):
    dish_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    id: int
    student_id: int
    
    class Config:
        from_attributes = True

# Схемы для статистики
class PaymentStatistics(BaseModel):
    total_revenue: float
    orders_count: int
    average_order_value: float

class AttendanceStatistics(BaseModel):
    unique_users: int
    total_orders: int
    average_orders_per_user: float

class ReportRequest(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None