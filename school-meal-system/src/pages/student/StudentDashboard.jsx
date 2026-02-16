import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { studentApi } from "../../api/student";
import StatCard from "../../components/common/StatCard";
import DashboardWelcomeSection from "../../components/dashboard/DashboardWelcomeSection";
import DashboardStatsGrid from "../../components/dashboard/DashboardStatsGrid";
import DashboardQuickActions from "../../components/dashboard/DashboardQuickActions";
import DashboardAlerts from "../../components/dashboard/DashboardAlerts";
import {
  UtensilsCrossed,
  ShoppingCart,
  Star,
  Wallet,
  Clock,
  CheckCircle,
} from "lucide-react";
import { SunriseIcon, SunIcon } from "../../components/common/Icons";

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

        const sortedOrdersData = ordersData.sort((a, b) => {
          const dateA = a.order_date
            ? new Date(a.order_date)
            : new Date(a.created_at);
          const dateB = b.order_date
            ? new Date(b.order_date)
            : new Date(b.created_at);
          return dateB - dateA;
        });
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
    <div className="space-y-6 page-transition">
      {/* Welcome Section */}
      <DashboardWelcomeSection
        title={`Привет, ${user?.full_name}!`}
        subtitle="Добро пожаловать в систему школьного питания"
        icon={null}
      />

      {/* Stats */}
      <DashboardStatsGrid
        stats={[
          {
            title: "Баланс",
            value: `${user?.balance?.toFixed(2)} ₽`,
            figure: <Wallet className="h-8 w-8" />,
            color: "primary",
          },
          {
            title: "Ожидают получения",
            value: pendingOrders,
            figure: <Clock className="h-8 w-8" />,
            color: "warning",
          },
          {
            title: "Получено",
            value: completedOrders,
            figure: <CheckCircle className="h-8 w-8" />,
            color: "success",
          },
          {
            title: "Блюд в меню",
            value: menu.length,
            figure: <UtensilsCrossed className="h-8 w-8" />,
            color: "info",
          },
        ]}
      />

      {/* Quick Actions */}
      <DashboardQuickActions
        actions={[
          {
            to: "/student/menu",
            icon: <UtensilsCrossed className="h-12 w-12 text-primary" />,
            title: "Меню",
            description: "Посмотреть завтраки и обеды",
            buttonText: "Перейти",
            buttonStyle: "btn-primary",
          },
          {
            to: "/student/orders",
            icon: <ShoppingCart className="h-12 w-12 text-secondary" />,
            title: "Мои заказы",
            description: "История и текущие заказы",
            buttonText: "Перейти",
            buttonStyle: "btn-secondary",
          },
          {
            to: "/student/profile",
            icon: <Star className="h-12 w-12 text-accent" />,
            title: "Профиль",
            description: "Настройки и пополнение",
            buttonText: "Перейти",
            buttonStyle: "btn-accent",
          },
        ]}
      />

      {/* Allergies Alert */}
      {user?.allergies && (
        <DashboardAlerts
          alerts={[
            {
              type: "warning",
              title: "⚠️ Ваши аллергии:",
              message: user.allergies,
              icon: null,
            },
          ]}
        />
      )}

      {/* Recent Menu Items */}
      <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="card-body">
          <h2 className="card-title">Популярные блюда</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menu.slice(0, 6).map((dish) => (
              <div
                key={dish.id}
                className="flex items-center gap-3 p-3 bg-base-200 rounded-lg transition-all duration-200 hover:bg-base-300 hover:scale-105 cursor-pointer"
              >
                <div className={`${dish.is_breakfast ? "text-warning" : "text-info"} transition-transform duration-200 hover:scale-110`}>
                  {dish.is_breakfast ? <SunriseIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{dish.name}</div>
                  <div className="text-sm text-base-content/60">
                    {dish.price} ₽
                  </div>
                </div>
                <div
                  className={`badge transition-all duration-200 hover:scale-105 ${dish.stock_quantity > 0 ? "badge-success" : "badge-error"}`}
                >
                  {dish.stock_quantity > 0 ? "В наличии" : "Нет"}
                </div>
              </div>
            ))}
          </div>
          <div className="card-actions justify-end mt-4">
            <Link to="/student/menu" className="btn btn-primary btn-sm transition-all duration-200 hover:scale-105">
              Все меню
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
