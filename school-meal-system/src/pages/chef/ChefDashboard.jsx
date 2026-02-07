import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { chefApi } from "../../api/chef";
import StatCard from "../../components/common/StatCard";
import {
  Package,
  ClipboardList,
  CheckCircle,
  Clock,
  ChefHat,
} from "lucide-react";

const ChefDashboard = () => {
  const { user } = useAuth();
  const [todayOrders, setTodayOrders] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, dishesData, requestsData] = await Promise.all([
          chefApi.getTodayOrders(),
          chefApi.getDishesWithStock(),
          chefApi.getMyPurchaseRequests(),
        ]);
        // Sort orders by order_date (if available) or created_at timestamp (newer first)
        const sortedOrdersData = ordersData.sort((a, b) => {
          const dateA = a.order_date ? new Date(a.order_date) : new Date(a.created_at);
          const dateB = b.order_date ? new Date(b.order_date) : new Date(b.created_at);
          return dateB - dateA;
        });
        setTodayOrders(sortedOrdersData);
        setDishes(dishesData);
        setRequests(requestsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const receivedOrders = todayOrders.filter((o) => o.is_received).length;
  const pendingOrders = todayOrders.filter((o) => !o.is_received).length;
  const lowStockDishes = dishes.filter((d) => d.stock_quantity < 5).length;
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
          <ChefHat className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-bold">
              Добрый день, {user?.full_name}! 👨‍🍳
            </h1>
            <p className="mt-2 opacity-90">Панель управления повара</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Заказов сегодня"
          value={todayOrders.length}
          figure={<ClipboardList className="h-8 w-8" />}
          color="primary"
        />
        
        <StatCard
          title="Выдано"
          value={receivedOrders}
          figure={<CheckCircle className="h-8 w-8" />}
          color="success"
        />
        
        <StatCard
          title="Ожидают выдачи"
          value={pendingOrders}
          figure={<Clock className="h-8 w-8" />}
          color="warning"
        />
        
        <StatCard
          title="Мало на складе"
          value={lowStockDishes}
          figure={<Package className="h-8 w-8" />}
          color="error"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/chef/stock"
          className="card bg-base-100 shadow hover:shadow-lg transition-shadow"
        >
          <div className="card-body">
            <div className="flex items-center gap-4">
              <Package className="h-12 w-12 text-primary" />
              <div>
                <h3 className="card-title text-sm sm:text-base">Остатки блюд</h3>
                <p className="text-base-content/60 text-xs sm:text-sm">
                  Контроль остатков продуктов
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/chef/requests"
          className="card bg-base-100 shadow hover:shadow-lg transition-shadow"
        >
          <div className="card-body">
            <div className="flex items-center gap-4">
              <ClipboardList className="h-12 w-12 text-secondary" />
              <div>
                <h3 className="card-title text-sm sm:text-base">Заявки на закупку</h3>
                <p className="text-base-content/60 text-xs sm:text-sm">
                  {pendingRequests > 0
                    ? `${pendingRequests} в ожидании`
                    : "Создать новую заявку"}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Today Orders */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">📋 Заказы на сегодня</h2>
          {todayOrders.length === 0 ? (
            <p className="text-center py-8 text-base-content/60">
              Заказов пока нет
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ученик ID</th>
                    <th>Блюдо</th>
                    <th>Тип оплаты</th>
                    <th>Статус</th>
                    <th>Дата заказа</th>
                    <th>Время</th>
                  </tr>
                </thead>
                <tbody>
                  {todayOrders.slice(0, 10).map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.student_id}</td>
                      <td>{order.dish?.name || `ID: ${order.dish_id}`}</td>
                      <td>
                        <span
                          className={`badge ${order.payment_type === "subscription" ? "badge-secondary" : "badge-primary"}`}
                        >
                          {order.payment_type === "subscription"
                            ? "Абонемент"
                            : "Разовый"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${order.is_received ? "badge-success" : "badge-warning"}`}
                        >
                          {order.is_received ? "Выдано" : "Ожидает"}
                        </span>
                      </td>
                      <td>
                        {order.order_date 
                          ? new Date(order.order_date).toLocaleDateString("ru-RU")
                          : new Date(order.created_at).toLocaleDateString("ru-RU")}
                      </td>
                      <td>
                        {new Date(order.created_at).toLocaleTimeString("ru-RU")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockDishes > 0 && (
        <div className="alert alert-warning shadow-lg">
          <Package className="h-6 w-6" />
          <div>
            <h3 className="font-bold">Внимание!</h3>
            <p>{lowStockDishes} блюд имеют низкий остаток (менее 5 порций)</p>
          </div>
          <Link to="/chef/stock" className="btn btn-sm">
            Проверить
          </Link>
        </div>
      )}
    </div>
  );
};

export default ChefDashboard;
