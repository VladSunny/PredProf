-- schema.sql
-- База данных для системы управления школьной столовой
-- =====================================================

-- 1. Таблица пользователей (все роли: ученик, повар, администратор)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'cook', 'admin')),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    class VARCHAR(20), -- Только для учеников (например, "10А")
    student_id VARCHAR(20), -- Номер ученического билета
    phone VARCHAR(20),
    birth_date DATE,
    allergies TEXT, -- Аллергии и пищевые особенности
    preferences TEXT, -- Предпочтения в еде
    balance DECIMAL(10, 2) DEFAULT 0.00, -- Баланс на счету
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по ролям
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_class ON users(class);

-- 2. Таблица категорий блюд
CREATE TABLE IF NOT EXISTS dish_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    sort_order INTEGER DEFAULT 0
);

-- 3. Таблица блюд (меню)
CREATE TABLE IF NOT EXISTS dishes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES dish_categories(id) ON DELETE SET NULL,
    price DECIMAL(10, 2) NOT NULL,
    calories INTEGER,
    proteins DECIMAL(5, 1),
    fats DECIMAL(5, 1),
    carbohydrates DECIMAL(5, 1),
    allergens TEXT, -- Перечень аллергенов
    preparation_time INTEGER, -- Время приготовления в минутах
    is_available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для фильтрации по категориям и доступности
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category_id);
CREATE INDEX IF NOT EXISTS idx_dishes_available ON dishes(is_available);

-- 4. Таблица меню на день
CREATE TABLE IF NOT EXISTS daily_menus (
    id SERIAL PRIMARY KEY,
    menu_date DATE NOT NULL,
    meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
    dish_id INTEGER REFERENCES dishes(id) ON DELETE CASCADE,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    ordered_quantity INTEGER DEFAULT 0,
    max_orders INTEGER, -- Максимальное количество заказов на этот день
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(menu_date, meal_type, dish_id)
);

-- Индекс для поиска меню по дате
CREATE INDEX IF NOT EXISTS idx_daily_menus_date ON daily_menus(menu_date);
CREATE INDEX IF NOT EXISTS idx_daily_menus_type ON daily_menus(meal_type);

-- 5. Таблица заказов питания
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    menu_id INTEGER REFERENCES daily_menus(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    order_date DATE NOT NULL,
    meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'confirmed', 'prepared', 'issued', 'cancelled', 'completed')) DEFAULT 'pending',
    payment_method VARCHAR(20) CHECK (payment_method IN ('balance', 'cash', 'card', 'subscription')),
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    issued_at TIMESTAMP, -- Время выдачи
    issued_by INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Кто выдал (повар)
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска заказов
CREATE INDEX IF NOT EXISTS idx_orders_student ON orders(student_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_issued_by ON orders(issued_by);

-- 6. Таблица подписок (абонементов)
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subscription_type VARCHAR(50) NOT NULL, -- 'monthly_breakfast', 'monthly_lunch', 'semester_full', etc.
    meal_types TEXT[], -- Массив типов питания: {'breakfast', 'lunch'}
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_meals INTEGER NOT NULL, -- Общее количество приемов пищи
    meals_used INTEGER DEFAULT 0,
    meals_remaining INTEGER GENERATED ALWAYS AS (total_meals - meals_used) STORED,
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'expired', 'cancelled', 'pending')) DEFAULT 'pending',
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_date > start_date),
    CHECK (meals_used <= total_meals)
);

-- Индекс для активных подписок
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(student_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_subscriptions_dates ON subscriptions(start_date, end_date);

-- 7. Таблица платежей
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'online', 'balance')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    transaction_id VARCHAR(100), -- ID транзакции от платежной системы
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Индексы для платежей
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at);

-- 8. Таблица продуктов (для учета на складе)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- 'овощи', 'мясо', 'молочные', 'крупы', etc.
    unit VARCHAR(20) NOT NULL, -- 'кг', 'л', 'шт', 'уп'
    current_stock DECIMAL(10, 3) NOT NULL DEFAULT 0,
    min_stock DECIMAL(10, 3) NOT NULL DEFAULT 0, -- Минимальный запас
    supplier VARCHAR(100),
    storage_conditions TEXT,
    shelf_life_days INTEGER,
    price_per_unit DECIMAL(10, 2),
    last_delivery_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Таблица рецептов (связь блюд и продуктов)
CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    dish_id INTEGER REFERENCES dishes(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity DECIMAL(10, 3) NOT NULL, -- Количество продукта на одну порцию
    unit VARCHAR(20),
    notes TEXT,
    UNIQUE(dish_id, product_id)
);

-- 10. Таблица заявок на закупку продуктов
CREATE TABLE IF NOT EXISTS purchase_requests (
    id SERIAL PRIMARY KEY,
    request_number VARCHAR(50) UNIQUE NOT NULL,
    requested_by INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Повар
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity DECIMAL(10, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    urgency VARCHAR(20) CHECK (urgency IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    reason TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'ordered', 'delivered', 'cancelled')) DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Администратор
    approved_at TIMESTAMP,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    total_cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для отслеживания статуса заявок
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_urgency ON purchase_requests(urgency);

-- 11. Таблица отзывов о блюдах
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    dish_id INTEGER REFERENCES dishes(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    advantages TEXT, -- Что понравилось
    disadvantages TEXT, -- Что не понравилось
    is_anonymous BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, dish_id, order_id) -- Один отзыв на блюдо из одного заказа
);

-- Индекс для среднего рейтинга блюд
CREATE INDEX IF NOT EXISTS idx_reviews_dish ON reviews(dish_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- 12. Таблица уведомлений
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) CHECK (notification_type IN ('system', 'order', 'payment', 'subscription', 'alert', 'reminder')),
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(50), -- 'order', 'payment', 'subscription', etc.
    related_entity_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Индекс для непрочитанных уведомлений
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- 13. Таблица отчетов
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL, -- 'daily_sales', 'monthly_attendance', 'product_usage', etc.
    title VARCHAR(200) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    generated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    data JSONB NOT NULL, -- Данные отчета в формате JSON
    file_url VARCHAR(255), -- Ссылка на сгенерированный файл (PDF, Excel)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Таблица журнала выдачи блюд
CREATE TABLE IF NOT EXISTS meal_issuance_log (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    issued_by INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Повар
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantity_issued INTEGER NOT NULL,
    notes TEXT
);

-- 15. Таблица остатков на кухне
CREATE TABLE IF NOT EXISTS kitchen_stock (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    opening_balance DECIMAL(10, 3) NOT NULL, -- Остаток на начало дня
    received DECIMAL(10, 3) DEFAULT 0, -- Получено за день
    used DECIMAL(10, 3) DEFAULT 0, -- Израсходовано за день
    waste DECIMAL(10, 3) DEFAULT 0, -- Списано (брак, истек срок)
    closing_balance DECIMAL(10, 3) GENERATED ALWAYS AS (opening_balance + received - used - waste) STORED,
    checked_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, date)
);

-- 16. Таблица скидок и акций
CREATE TABLE IF NOT EXISTS discounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed', 'meal_free')),
    value DECIMAL(10, 2) NOT NULL, -- Процент или фиксированная сумма
    applicable_to VARCHAR(20) CHECK (applicable_to IN ('all', 'students', 'category', 'dish')),
    applicable_id INTEGER, -- ID категории или блюда, если applicable_to не 'all'
    min_order_amount DECIMAL(10, 2),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_uses INTEGER, -- Максимальное количество использований
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ТРИГГЕРЫ для автоматического обновления updated_at
-- =====================================================

-- Функция для обновления временной метки
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Применяем триггеры к таблицам
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dishes_updated_at 
    BEFORE UPDATE ON dishes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_requests_updated_at 
    BEFORE UPDATE ON purchase_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- СИДЫ (начальные данные для тестирования)
-- =====================================================

-- Категории блюд
INSERT INTO dish_categories (name, description, meal_type, sort_order) VALUES
('Супы', 'Первые блюда', 'lunch', 1),
('Горячие блюда', 'Основные горячие блюда', 'lunch', 2),
('Гарниры', 'Картофель, макароны, крупы', 'lunch', 3),
('Салаты', 'Овощные салаты', 'lunch', 4),
('Выпечка', 'Булочки, пирожки', 'breakfast', 5),
('Каши', 'Молочные каши', 'breakfast', 6),
('Напитки', 'Чай, компот, сок', NULL, 7),
('Десерты', 'Сладкие блюда', NULL, 8)
ON CONFLICT (name) DO NOTHING;

-- Примерные блюда
INSERT INTO dishes (name, description, category_id, price, calories, allergens) VALUES
('Борщ', 'Традиционный украинский борщ со сметаной', 1, 80.00, 150, 'свекла, капуста'),
('Курица с картофелем', 'Куриное филе с отварным картофелем', 2, 120.00, 300, NULL),
('Гречневая каша', 'Гречневая каша с маслом', 3, 60.00, 200, 'глютен'),
('Салат "Винегрет"', 'Овощной салат из вареных овощей', 4, 70.00, 100, NULL),
('Булочка с маком', 'Сдобная булочка с маковой начинкой', 5, 40.00, 250, 'глютен, мак'),
('Манная каша', 'Молочная манная каша', 6, 50.00, 180, 'глютен, лактоза'),
('Компот из сухофруктов', 'Напиток из сушеных фруктов', 7, 30.00, 80, NULL),
('Творожная запеканка', 'Запеканка из творога с изюмом', 8, 65.00, 220, 'творог, яйца')
ON CONFLICT DO NOTHING;

-- Примерные пользователи (пароли должны быть захешированы в реальном приложении)
INSERT INTO users (username, email, password_hash, role, first_name, last_name, class, allergies) VALUES
('ivanov.student', 'ivanov@school.ru', '$2b$10$YourHashedPasswordHere1', 'student', 'Иван', 'Иванов', '10А', 'орехи, мед'),
('petrov.student', 'petrov@school.ru', '$2b$10$YourHashedPasswordHere2', 'student', 'Петр', 'Петров', '9Б', NULL),
('chef.anna', 'anna@school.ru', '$2b$10$YourHashedPasswordHere3', 'cook', 'Анна', 'Сидорова', NULL, NULL),
('admin.sergey', 'sergey@school.ru', '$2b$10$YourHashedPasswordHere4', 'admin', 'Сергей', 'Козлов', NULL, NULL)
ON CONFLICT (username) DO NOTHING;

-- Примерные продукты
INSERT INTO products (name, category, unit, current_stock, min_stock, supplier) VALUES
('Картофель', 'овощи', 'кг', 50.0, 10.0, 'ООО "Овощебаза"'),
('Куриное филе', 'мясо', 'кг', 15.0, 5.0, 'Птицефабрика "Заря"'),
('Гречневая крупа', 'крупы', 'кг', 30.0, 8.0, 'ООО "Зернопродукт"'),
('Молоко', 'молочные', 'л', 20.0, 5.0, 'Молочный комбинат'),
('Мука пшеничная', 'бакалея', 'кг', 25.0, 6.0, 'Хлебозавод №1')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ВЬЮ (представления) для упрощения запросов
-- =====================================================

-- Вью для отображения меню на сегодня
CREATE OR REPLACE VIEW today_menu AS
SELECT 
    dm.id,
    dm.menu_date,
    dm.meal_type,
    d.name as dish_name,
    d.description,
    d.price,
    d.calories,
    d.allergens,
    dc.name as category_name,
    dm.available_quantity,
    dm.ordered_quantity,
    dm.max_orders,
    (dm.available_quantity - dm.ordered_quantity) as remaining_quantity
FROM daily_menus dm
JOIN dishes d ON dm.dish_id = d.id
JOIN dish_categories dc ON d.category_id = dc.id
WHERE dm.menu_date = CURRENT_DATE
ORDER BY dm.meal_type, dc.sort_order;

-- Вью для статистики по заказам
CREATE OR REPLACE VIEW order_statistics AS
SELECT 
    o.order_date,
    o.meal_type,
    COUNT(*) as total_orders,
    SUM(o.total_amount) as total_revenue,
    AVG(o.total_amount) as avg_order_value,
    COUNT(DISTINCT o.student_id) as unique_students
FROM orders o
WHERE o.status NOT IN ('cancelled')
GROUP BY o.order_date, o.meal_type;

-- Вью для отслеживания низких остатков продуктов
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.current_stock,
    p.min_stock,
    p.unit,
    ROUND((p.current_stock / p.min_stock) * 100, 2) as stock_percentage,
    CASE 
        WHEN p.current_stock <= p.min_stock * 0.3 THEN 'CRITICAL'
        WHEN p.current_stock <= p.min_stock * 0.5 THEN 'LOW'
        WHEN p.current_stock <= p.min_stock * 0.8 THEN 'WARNING'
        ELSE 'NORMAL'
    END as stock_level
FROM products p
WHERE p.current_stock <= p.min_stock * 1.2 -- Показывать продукты, которые близки к минимальному запасу
ORDER BY stock_percentage ASC;

-- =====================================================
-- КОММЕНТАРИИ к таблицам (для документации)
-- =====================================================

COMMENT ON TABLE users IS 'Пользователи системы: ученики, повара, администраторы';
COMMENT ON COLUMN users.role IS 'Роль пользователя: student (ученик), cook (повар), admin (администратор)';
COMMENT ON COLUMN users.balance IS 'Баланс на личном счету ученика для оплаты питания';

COMMENT ON TABLE orders IS 'Заказы на питание от учеников';
COMMENT ON COLUMN orders.status IS 'Статус заказа: pending, confirmed, prepared, issued, cancelled, completed';
COMMENT ON COLUMN orders.issued_by IS 'ID повара, который выдал заказ';

COMMENT ON TABLE subscriptions IS 'Абонементы на питание для учеников';
COMMENT ON COLUMN subscriptions.subscription_type IS 'Тип подписки: monthly_breakfast, monthly_lunch, semester_full и т.д.';

COMMENT ON TABLE purchase_requests IS 'Заявки поваров на закупку продуктов';
COMMENT ON COLUMN purchase_requests.status IS 'Статус заявки: pending, approved, rejected, ordered, delivered, cancelled';

COMMENT ON TABLE reviews IS 'Отзывы учеников о блюдах';
COMMENT ON COLUMN reviews.status IS 'Статус модерации отзыва: pending, approved, rejected';

COMMENT ON TABLE notifications IS 'Система уведомлений для пользователей';

-- =====================================================
-- КОНЕЦ СХЕМЫ
-- =====================================================