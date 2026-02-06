from sqlalchemy.orm import Session
from . import models, auth
from datetime import datetime, timedelta
import random

def seed_database(db: Session):
    """Заполнить базу данных тестовыми данными"""
    
    # Проверяем, есть ли уже данные
    if db.query(models.User).count() > 0:
        return {"message": "База данных уже содержит данные. Пропускаем заполнение."}
    
    print("Начало заполнения базы данных тестовыми данными...")
    
    # 1. Создаем пользователей
    users_data = [
        {
            "email": "student1@school.ru",
            "full_name": "Иванов Иван Иванович",
            "parallel": "10Г",
            "password": "password123",
            "role": models.UserRole.STUDENT,
            "allergies": "Арахис, морепродукты",
            "preferences": "Вегетарианское питание",
            "balance": 1000.0
        },
        {
            "email": "student2@school.ru",
            "full_name": "Петров Петр Петрович",
            "parallel": "9Б",
            "password": "password123",
            "role": models.UserRole.STUDENT,
            "allergies": "Лактоза",
            "preferences": "Без глютена",
            "balance": 750.0
        },
        {
            "email": "student3@school.ru",
            "full_name": "Сидорова Мария Сергеевна",
            "parallel": "11А",
            "password": "password123",
            "role": models.UserRole.STUDENT,
            "allergies": None,
            "preferences": "Предпочитаю курицу",
            "balance": 500.0
        },
        {
            "email": "chef@school.ru",
            "full_name": "Шеф Иван Иванович",
            "parallel": "Школьная столовая",
            "password": "chefpass123",
            "role": models.UserRole.CHEF,
            "allergies": None,
            "preferences": None,
            "balance": 0.0
        },
        {
            "email": "admin@school.ru",
            "full_name": "Админ Админ Админович",
            "parallel": "Администрация",
            "password": "adminpass123",
            "role": models.UserRole.ADMIN,
            "allergies": None,
            "preferences": None,
            "balance": 0.0
        }
    ]
    
    created_users = {}
    for user_data in users_data:
        hashed_password = auth.get_password_hash(user_data["password"])
        db_user = models.User(
            email=user_data["email"],
            full_name=user_data["full_name"],
            parallel=user_data["parallel"],
            hashed_password=hashed_password,
            role=user_data["role"],
            allergies=user_data["allergies"],
            preferences=user_data["preferences"],
            balance=user_data["balance"]
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        created_users[user_data["full_name"]] = db_user
        print(f"Создан пользователь: {user_data['full_name']} ({user_data['role']})")
    
    # 2. Создаем блюда (меню)
    dishes_data = [
        # Завтраки
        {"name": "Овсяная каша с ягодами", "description": "Овсянка с свежими ягодами и медом", "price": 150.0, "is_breakfast": True, "stock_quantity": 50},
        {"name": "Омлет с сыром", "description": "Пушистый омлет с сыром и зеленью", "price": 180.0, "is_breakfast": True, "stock_quantity": 40},
        {"name": "Блинчики с творогом", "description": "Тонкие блинчики с начинкой из творога", "price": 200.0, "is_breakfast": True, "stock_quantity": 30},
        {"name": "Сырники со сметаной", "description": "Домашние сырники с соусом из сметаны", "price": 190.0, "is_breakfast": True, "stock_quantity": 35},
        {"name": "Каша гречневая с молоком", "description": "Гречневая каша с теплым молоком", "price": 120.0, "is_breakfast": True, "stock_quantity": 45},
        
        # Обеды
        {"name": "Куриный суп с лапшой", "description": "Ароматный куриный суп с домашней лапшой", "price": 220.0, "is_breakfast": False, "stock_quantity": 60},
        {"name": "Пюре с котлетой", "description": "Картофельное пюре с куриной котлетой", "price": 250.0, "is_breakfast": False, "stock_quantity": 55},
        {"name": "Гречка с тефтелями", "description": "Гречневая каша с говяжьими тефтелями в томатном соусе", "price": 230.0, "is_breakfast": False, "stock_quantity": 50},
        {"name": "Рыба с овощами", "description": "Запеченная рыба с сезонными овощами", "price": 280.0, "is_breakfast": False, "stock_quantity": 40},
        {"name": "Салат Цезарь с курицей", "description": "Классический салат Цезарь с куриной грудкой", "price": 210.0, "is_breakfast": False, "stock_quantity": 45},
        {"name": "Плов с бараниной", "description": "Узбекский плов с бараниной и морковью", "price": 270.0, "is_breakfast": False, "stock_quantity": 35},
        {"name": "Овощное рагу", "description": "Тушеные овощи с грибами в сметанном соусе", "price": 190.0, "is_breakfast": False, "stock_quantity": 40},
    ]
    
    created_dishes = []
    for dish_data in dishes_data:
        db_dish = models.Dish(**dish_data)
        db.add(db_dish)
        db.commit()
        db.refresh(db_dish)
        created_dishes.append(db_dish)
        print(f"Создано блюдо: {dish_data['name']} ({'Завтрак' if dish_data['is_breakfast'] else 'Обед'})")
    
    # 3. Создаем заказы за последние 7 дней
    payment_types = ["one-time", "subscription"]

    # Filter only student users for orders
    student_users = [user for user in created_users.values() if user.role == models.UserRole.STUDENT]

    for i in range(30):  # Создаем 30 заказов
        if not student_users:
            break  # Exit if no student users available
        student = random.choice(student_users)
        dish = random.choice(created_dishes)
        
        # Проверяем баланс студента
        if student.balance >= dish.price:
            # Создаем заказ с разными датами (за последние 7 дней)
            days_ago = random.randint(0, 7)
            order_date = datetime.now() - timedelta(days=days_ago)
            
            # Для симуляции времени создания
            order_date = order_date.replace(
                hour=random.randint(8, 14),
                minute=random.randint(0, 59),
                second=random.randint(0, 59)
            )
            
            db_order = models.Order(
                student_id=student.id,
                dish_id=dish.id,
                order_date=datetime.now(),  # Use order_date for the scheduled date
                payment_type=random.choice(payment_types),
                is_received=random.choice([True, False]),
                created_at=order_date  # Keep created_at for when the order was placed
            )
            
            # Списание средств
            student.balance -= dish.price
            dish.stock_quantity -= 1
            
            db.add(db_order)
    
    db.commit()
    print("Созданы заказы (30 штук)")
    
    # 4. Создаем отзывы
    reviews_data = [
        {"student": created_users["Иванов Иван Иванович"], "dish": created_dishes[0], "rating": 5, "comment": "Очень вкусная каша, ягоды свежие!"},
        {"student": created_users["Петров Петр Петрович"], "dish": created_dishes[0], "rating": 4, "comment": "Хорошо, но могло бы быть больше ягод"},
        {"student": created_users["Сидорова Мария Сергеевна"], "dish": created_dishes[1], "rating": 5, "comment": "Омлет просто великолепный!"},
        {"student": created_users["Иванов Иван Иванович"], "dish": created_dishes[3], "rating": 3, "comment": "Сырники суховатые"},
        {"student": created_users["Петров Петр Петрович"], "dish": created_dishes[5], "rating": 5, "comment": "Лучший куриный суп в школе!"},
        {"student": created_users["Сидорова Мария Сергеевна"], "dish": created_dishes[6], "rating": 4, "comment": "Котлета вкусная, но пюре могло бы быть более воздушным"},
        {"student": created_users["Иванов Иван Иванович"], "dish": created_dishes[8], "rating": 5, "comment": "Рыба приготовлена идеально!"},
    ]
    
    for review_data in reviews_data:
        db_review = models.Review(
            student_id=review_data["student"].id,
            dish_id=review_data["dish"].id,
            rating=review_data["rating"],
            comment=review_data["comment"]
        )
        db.add(db_review)
    
    db.commit()
    print("Созданы отзывы (7 штук)")
    
    # 5. Создаем заявки на закупку
    purchase_requests_data = [
        {"chef": created_users["Шеф Иван Иванович"], "item_name": "Куриные грудки", "quantity": "10 кг", "status": "approved"},
        {"chef": created_users["Шеф Иван Иванович"], "item_name": "Свежие овощи (морковь, лук, картофель)", "quantity": "15 кг", "status": "pending"},
        {"chef": created_users["Шеф Иван Иванович"], "item_name": "Молоко", "quantity": "20 л", "status": "rejected"},
        {"chef": created_users["Шеф Иван Иванович"], "item_name": "Рис для плова", "quantity": "25 кг", "status": "approved"},
        {"chef": created_users["Шеф Иван Иванович"], "item_name": "Сыр для пиццы", "quantity": "5 кг", "status": "pending"},
    ]
    
    for pr_data in purchase_requests_data:
        # Создаем с разными датами
        days_ago = random.randint(0, 10)
        created_date = datetime.now() - timedelta(days=days_ago)
        
        db_pr = models.PurchaseRequest(
            item_name=pr_data["item_name"],
            quantity=pr_data["quantity"],
            status=pr_data["status"],
            chef_id=pr_data["chef"].id,
            created_at=created_date
        )
        db.add(db_pr)
    
    db.commit()
    print("Созданы заявки на закупку (5 штук)")
    
    print("\n" + "="*60)
    print("Заполнение базы данных завершено успешно!")
    print("="*60)
    print("Создано:")
    print(f"  - Пользователей: {len(created_users)}")
    print(f"  - Блюд: {len(created_dishes)}")
    print(f"  - Заказов: 30")
    print(f"  - Отзывов: 7")
    print(f"  - Заявок на закупку: 5")
    print("="*60)
    
    return {
        "message": "База данных успешно заполнена тестовыми данными",
        "stats": {
            "users": len(created_users),
            "dishes": len(created_dishes),
            "orders": 30,
            "reviews": 7,
            "purchase_requests": 5
        }
    }
