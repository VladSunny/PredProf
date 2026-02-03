import { useState, useEffect } from "react";
import api from "../../api/config";
import { Layout } from "../../components/Layout";

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/my");
      setOrders(response.data);
    } catch (error) {
      console.error("Ошибка загрузки заказов:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsReceived = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/receive`);
      fetchOrders();
      alert("Заказ отмечен как полученный!");
    } catch (error) {
      alert(error.response?.data?.detail || "Ошибка");
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { label: "Ожидает", class: "badge-warning" },
      received: { label: "Получен", class: "badge-success" },
      cancelled: { label: "Отменен", class: "badge-error" },
    };
    return statuses[status] || { label: status, class: "badge-ghost" };
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Мои заказы</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-base-content/70">
              У вас пока нет заказов
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Блюдо</th>
                  <th>Цена</th>
                  <th>Тип оплаты</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const status = getStatusBadge(order.status);
                  return (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.dish?.name || "Не найдено"}</td>
                      <td>{order.dish?.price || 0} ₽</td>
                      <td>
                        <span className="badge badge-ghost">
                          {order.payment_type === "single"
                            ? "Разовый"
                            : "Абонемент"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${status.class}`}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        {new Date(order.created_at).toLocaleDateString("ru-RU")}
                      </td>
                      <td>
                        {order.status === "pending" && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => markAsReceived(order.id)}
                          >
                            Получить
                          </button>
                        )}
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
