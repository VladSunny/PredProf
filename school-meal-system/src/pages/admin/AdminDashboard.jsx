import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../api/admin";
import StatCard from "../../components/common/StatCard";
import {
  BarChart3,
  Users,
  Wallet,
  ClipboardList,
  UtensilsCrossed,
  FileText,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [paymentStats, setPaymentStats] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payment, attendance, requestsData] = await Promise.all([
          adminApi.getPaymentStatistics(),
          adminApi.getAttendanceStatistics(),
          adminApi.getAllPurchaseRequests(),
        ]);
        setPaymentStats(payment);
        setAttendanceStats(attendance);
        setRequests(requestsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingRequests = requests.filter((r) => r.status === "pending").length;

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
      <div className="bg-[#6B46C1] text-white rounded-box p-6">
        <div className="flex items-center gap-4">
          <BarChart3 className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-bold">Панель администратора</h1>
            <p className="mt-2 opacity-90">
              Добро пожаловать, {user?.full_name}!
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Общий доход"
          value={`${paymentStats?.total_revenue?.toFixed(2) || 0} ₽`}
          figure={<Wallet className="h-8 w-8" />}
          color="primary"
        />
        
        <StatCard
          title="Всего заказов"
          value={paymentStats?.orders_count || 0}
          figure={<ShoppingCart className="h-8 w-8" />}
          color="success"
        />
        
        <StatCard
          title="Уникальных пользователей"
          value={attendanceStats?.unique_users || 0}
          figure={<Users className="h-8 w-8" />}
          color="info"
        />
        
        <StatCard
          title="Заявок на рассмотрении"
          value={pendingRequests}
          figure={<ClipboardList className="h-8 w-8" />}
          color="warning"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">
              <TrendingUp className="h-5 w-5" />
              Статистика оплат
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <StatCard
                title="Средний чек"
                value={`${paymentStats?.average_order_value?.toFixed(2) || 0} ₽`}
                figure={<TrendingUp className="h-8 w-8" />}
                color="primary"
                className="text-center"
              />
              <StatCard
                title="Всего заказов"
                value={paymentStats?.orders_count || 0}
                figure={<ShoppingCart className="h-8 w-8" />}
                color="success"
                className="text-center"
              />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">
              <Users className="h-5 w-5" />
              Статистика посещаемости
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <StatCard
                title="Уникальных учеников"
                value={attendanceStats?.unique_users || 0}
                figure={<Users className="h-8 w-8" />}
                color="info"
                className="text-center"
              />
              <StatCard
                title="Заказов на ученика"
                value={attendanceStats?.average_orders_per_user?.toFixed(1) || 0}
                figure={<TrendingUp className="h-8 w-8" />}
                color="secondary"
                className="text-center"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/admin/dishes"
          className="card bg-base-100 shadow hover:shadow-lg transition-shadow"
        >
          <div className="card-body items-center text-center">
            <UtensilsCrossed className="h-12 w-12 text-primary" />
            <h3 className="card-title text-sm sm:text-base">Управление меню</h3>
            <p className="text-base-content/60 text-xs sm:text-sm">
              Добавить, изменить или удалить блюда
            </p>
          </div>
        </Link>

        <Link
          to="/admin/requests"
          className="card bg-base-100 shadow hover:shadow-lg transition-shadow"
        >
          <div className="card-body items-center text-center">
            <ClipboardList className="h-12 w-12 text-secondary" />
            <h3 className="card-title text-sm sm:text-base">Заявки на закупку</h3>
            <p className="text-base-content/60 text-xs sm:text-sm">
              {pendingRequests > 0
                ? `${pendingRequests} ожидают рассмотрения`
                : "Все заявки обработаны"}
            </p>
          </div>
        </Link>

        <Link
          to="/admin/reports"
          className="card bg-base-100 shadow hover:shadow-lg transition-shadow"
        >
          <div className="card-body items-center text-center">
            <FileText className="h-12 w-12 text-accent" />
            <h3 className="card-title text-sm sm:text-base">Отчеты</h3>
            <p className="text-base-content/60 text-xs sm:text-sm">
              Формирование отчетов по питанию
            </p>
          </div>
        </Link>
      </div>

      {/* Pending Requests Alert */}
      {pendingRequests > 0 && (
        <div className="alert alert-warning shadow-lg">
          <ClipboardList className="h-6 w-6" />
          <div>
            <h3 className="font-bold">Требуется внимание!</h3>
            <p>{pendingRequests} заявок на закупку ожидают рассмотрения</p>
          </div>
          <Link to="/admin/requests" className="btn btn-sm">
            Рассмотреть
          </Link>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
