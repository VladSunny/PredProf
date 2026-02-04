from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from . import auth, crud, schemas
from .database import get_db
from sqlalchemy.orm import Session

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Получает текущего пользователя из токена"""
    token = credentials.credentials
    token_data = auth.verify_token(token)
    
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный токен",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = crud.get_user_by_username(db, username=token_data["username"])
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден или неактивен",
        )
    
    return user

def require_role(required_role: schemas.UserRole):
    """Декоратор для проверки роли пользователя"""
    def role_checker(current_user: schemas.User = Depends(get_current_user)):
        if current_user.role != required_role and current_user.role != schemas.UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Требуется роль {required_role.value}",
            )
        return current_user
    return role_checker

def require_student(current_user: schemas.User = Depends(get_current_user)):
    """Проверяет, является ли пользователь учеником"""
    if current_user.role != schemas.UserRole.STUDENT and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Требуется роль ученика",
        )
    return current_user

def require_chef(current_user: schemas.User = Depends(get_current_user)):
    """Проверяет, является ли пользователь поваром"""
    if current_user.role != schemas.UserRole.CHEF and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Требуется роль повара",
        )
    return current_user

def require_admin(current_user: schemas.User = Depends(get_current_user)):
    """Проверяет, является ли пользователь администратором"""
    if current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Требуется роль администратора",
        )
    return current_user