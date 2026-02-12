import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../api/admin";
import StatCard from "../../components/common/StatCard";
import DashboardWelcomeSection from "../../components/dashboard/DashboardWelcomeSection";
import DashboardStatsGrid from "../../components/dashboard/DashboardStatsGrid";
import DashboardQuickActions from "../../components/dashboard/DashboardQuickActions";
import DashboardAlerts from "../../components/dashboard/DashboardAlerts";
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
      <DashboardWelcomeSection
        title="Панель администратора"
        subtitle={`Добро пожаловать, ${user?.full_name}!`}
        icon={<BarChart3 className="h-12 w-12" />}
      />

      {/* Main Stats */}
      <DashboardStatsGrid
        stats={[
          {
            title: "Общий доход",
            value: `${paymentStats?.total_revenue?.toFixed(2) || 0} ₽`,
            figure: <Wallet className="h-8 w-8" />,
            color: "primary",
          },
          {
            title: "Всего заказов",
            value: paymentStats?.orders_count || 0,
            figure: <ShoppingCart className="h-8 w-8" />,
            color: "success",
          },
          {
            title: "Уникальных пользователей",
            value: attendanceStats?.unique_users || 0,
            figure: <Users className="h-8 w-8" />,
            color: "info",
          },
          {
            title: "Заявок на рассмотрении",
            value: pendingRequests,
            figure: <ClipboardList className="h-8 w-8" />,
            color: "warning",
          },
        ]}
      />

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">
              <TrendingUp className="h-5 w-5" />
              Статистика оплат
            </h2>
            <DashboardStatsGrid
              layout="two-col"
              stats={[
                {
                  title: "Средний чек",
                  value: `${paymentStats?.average_order_value?.toFixed(2) || 0} ₽`,
                  figure: <TrendingUp className="h-8 w-8" />,
                  color: "primary",
                  className: "text-center",
                },
                {
                  title: "Всего заказов",
                  value: paymentStats?.orders_count || 0,
                  figure: <ShoppingCart className="h-8 w-8" />,
                  color: "success",
                  className: "text-center",
                },
              ]}
            />
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">
              <Users className="h-5 w-5" />
              Статистика посещаемости
            </h2>
            <DashboardStatsGrid
              layout="two-col"
              stats={[
                {
                  title: "Уникальных учеников",
                  value: attendanceStats?.unique_users || 0,
                  figure: <Users className="h-8 w-8" />,
                  color: "info",
                  className: "text-center",
                },
                {
                  title: "Заказов на ученика",
                  value:
                    attendanceStats?.average_orders_per_user?.toFixed(1) || 0,
                  figure: <TrendingUp className="h-8 w-8" />,
                  color: "secondary",
                  className: "text-center",
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <DashboardQuickActions
        actions={[
          {
            to: "/admin/dishes",
            icon: <UtensilsCrossed className="h-12 w-12 text-primary" />,
            title: "Управление меню",
            description: "Добавить, изменить или удалить блюда",
          },
          {
            to: "/admin/requests",
            icon: <ClipboardList className="h-12 w-12 text-secondary" />,
            title: "Заявки на закупку",
            description:
              pendingRequests > 0
                ? `${pendingRequests} ожидают рассмотрения`
                : "Все заявки обработаны",
          },
          {
            to: "/admin/reports",
            icon: <FileText className="h-12 w-12 text-accent" />,
            title: "Отчеты",
            description: "Формирование отчетов по питанию",
          },
        ]}
      />

      {/* Pending Requests Alert */}
      {pendingRequests > 0 && (
        <DashboardAlerts
          alerts={[
            {
              type: "warning",
              icon: <ClipboardList className="h-6 w-6" />,
              title: "Требуется внимание!",
              message: `${pendingRequests} заявок на закупку ожидают рассмотрения`,
              link: {
                to: "/admin/requests",
                text: "Рассмотреть",
              },
            },
          ]}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
