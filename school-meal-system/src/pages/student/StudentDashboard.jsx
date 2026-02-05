import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { studentApi } from "../../api/student";
import {
  UtensilsCrossed,
  ShoppingCart,
  Star,
  Wallet,
  Clock,
  CheckCircle,
} from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, menuData] = await Promise.all([
          studentApi.getMyOrders(),
          studentApi.getMenu(),
        ]);
        // Sort orders by created_at timestamp (newer first)
        const sortedOrdersData = ordersData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setOrders(sortedOrdersData);
        setMenu(menuData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingOrders = orders.filter((o) => !o.is_received).length;
  const completedOrders = orders.filter((o) => o.is_received).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-[#6B46C1] text-primary-content rounded-box p-6">
        <h1 className="text-3xl font-bold">Привет, {user?.username}! 👋</h1>
        <p className="mt-2 opacity-90">
          Добро пожаловать в систему школьного питания
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-primary">
            <Wallet className="h-8 w-8" />
          </div>
          <div className="stat-title">Баланс</div>
          <div className="stat-value text-primary text-sm sm:text-base">
            {user?.balance?.toFixed(2)} ₽
          </div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-warning">
            <Clock className="h-8 w-8" />
          </div>
          <div className="stat-title">Ожидают получения</div>
          <div className="stat-value text-warning text-sm sm:text-base">{pendingOrders}</div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-success">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div className="stat-title">Получено</div>
          <div className="stat-value text-success text-sm sm:text-base">{completedOrders}</div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-info">
            <UtensilsCrossed className="h-8 w-8" />
          </div>
          <div className="stat-title">Блюд в меню</div>
          <div className="stat-value text-info text-sm sm:text-base">{menu.length}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/student/menu"
          className="card bg-base-100 shadow hover:shadow-lg transition-shadow"
        >
          <div className="card-body items-center text-center">
            <UtensilsCrossed className="h-12 w-12 text-primary" />
            <h3 className="card-title text-sm sm:text-base">Меню</h3>
            <p className="text-base-content/60 text-xs sm:text-sm">Посмотреть завтраки и обеды</p>
            <div className="card-actions">
              <button className="btn btn-primary btn-sm">Перейти</button>
            </div>
          </div>
        </Link>

        <Link
          to="/student/orders"
          className="card bg-base-100 shadow hover:shadow-lg transition-shadow"
        >
          <div className="card-body items-center text-center">
            <ShoppingCart className="h-12 w-12 text-secondary" />
            <h3 className="card-title text-sm sm:text-base">Мои заказы</h3>
            <p className="text-base-content/60 text-xs sm:text-sm">История и текущие заказы</p>
            <div className="card-actions">
              <button className="btn btn-secondary btn-sm">Перейти</button>
            </div>
          </div>
        </Link>

        <Link
          to="/student/profile"
          className="card bg-base-100 shadow hover:shadow-lg transition-shadow"
        >
          <div className="card-body items-center text-center">
            <Star className="h-12 w-12 text-accent" />
            <h3 className="card-title text-sm sm:text-base">Профиль</h3>
            <p className="text-base-content/60 text-xs sm:text-sm">Настройки и пополнение</p>
            <div className="card-actions">
              <button className="btn btn-accent btn-sm">Перейти</button>
            </div>
          </div>
        </Link>
      </div>

      {/* Allergies Alert */}
      {user?.allergies && (
        <div className="alert alert-warning shadow-lg">
          <div>
            <span className="font-semibold">⚠️ Ваши аллергии:</span>
            <span className="ml-2">{user.allergies}</span>
          </div>
        </div>
      )}

      {/* Recent Menu Items */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Популярные блюда</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menu.slice(0, 6).map((dish) => (
              <div
                key={dish.id}
                className="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
              >
                <div className="text-2xl">
                  {dish.is_breakfast ? "🌅" : "🌞"}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{dish.name}</div>
                  <div className="text-sm text-base-content/60">
                    {dish.price} ₽
                  </div>
                </div>
                <div
                  className={`badge ${dish.stock_quantity > 0 ? "badge-success" : "badge-error"}`}
                >
                  {dish.stock_quantity > 0 ? "В наличии" : "Нет"}
                </div>
              </div>
            ))}
          </div>
          <div className="card-actions justify-end mt-4">
            <Link to="/student/menu" className="btn btn-primary btn-sm">
              Все меню
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
