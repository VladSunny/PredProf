import { useState, useEffect } from "react";
import api from "../../api/config";
import { Layout } from "../../components/Layout";

export function ChefOrders() {
  const [orders, setOrders] = useState([]);
  const [todayOnly, setTodayOnly] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [todayOnly]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const endpoint = todayOnly ? "/chef/orders/today" : "/chef/orders";
      const response = await api.get(endpoint);
      setOrders(response.data);
    } catch (error) {
      console.error("Ошибка загрузки заказов:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { label: "Ожидает", class: "badge-warning" },
      received: { label: "Выдан", class: "badge-success" },
      cancelled: { label: "Отменен", class: "badge-error" },
    };
    return statuses[status] || { label: status, class: "badge-ghost" };
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    received: orders.filter((o) => o.status === "received").length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">📋 Заказы</h1>
          <div className="form-control">
            <label className="label cursor-pointer gap-2">
              <span className="label-text">Только сегодня</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={todayOnly}
                onChange={(e) => setTodayOnly(e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* Статистика */}
        <div className="stats shadow w-full">
          <div className="stat">
            <div className="stat-title">Всего заказов</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Ожидают выдачи</div>
            <div className="stat-value text-warning">{stats.pending}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Выдано</div>
            <div className="stat-value text-success">{stats.received}</div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-base-content/70">Заказов нет</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Блюдо</th>
                  <th>Тип</th>
                  <th>Статус</th>
                  <th>Дата/Время</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const status = getStatusBadge(order.status);
                  return (
                    <tr
                      key={order.id}
                      className={
                        order.status === "pending" ? "bg-warning/10" : ""
                      }
                    >
                      <td className="font-mono">#{order.id}</td>
                      <td>
                        <div className="font-semibold">
                          {order.dish?.name || "Не найдено"}
                        </div>
                        <div className="text-sm text-base-content/50">
                          {order.dish?.price} ₽
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${order.dish?.is_breakfast ? "badge-warning" : "badge-info"}`}
                        >
                          {order.dish?.is_breakfast ? "🌅 Завтрак" : "☀️ Обед"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${status.class}`}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        {new Date(order.created_at).toLocaleString("ru-RU")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
