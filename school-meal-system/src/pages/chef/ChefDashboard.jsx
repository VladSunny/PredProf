import { useState, useEffect } from "react";
import * as api from "../../api";

export const ChefDashboard = () => {
  const [todayOrders, setTodayOrders] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [newRequest, setNewRequest] = useState({ item_name: "", quantity: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchData = async () => {
    try {
      const [ordersData, dishesData, requestsData] = await Promise.all([
        api.getTodayOrders(),
        api.getChefDishes(),
        api.getMyPurchaseRequests(),
      ]);
      setTodayOrders(ordersData);
      setDishes(dishesData);
      setPurchaseRequests(requestsData);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!newRequest.item_name || !newRequest.quantity) {
      setMessage({ type: "error", text: "Заполните все поля" });
      return;
    }
    try {
      await api.createPurchaseRequest(newRequest);
      setMessage({ type: "success", text: "Заявка успешно создана!" });
      setNewRequest({ item_name: "", quantity: "" });
      fetchData();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "badge-warning",
      approved: "badge-success",
      rejected: "badge-error",
    };
    const labels = {
      pending: "На рассмотрении",
      approved: "Одобрено",
      rejected: "Отклонено",
    };
    return <span className={`badge ${badges[status]}`}>{labels[status]}</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {message.text && (
        <div className={`alert ${message.type === "error" ? "alert-error" : "alert-success"} mb-4`}>
          <span>{message.text}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setMessage({ type: "", text: "" })}>
            ✕
          </button>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">👨‍🍳 Панель повара</h1>

      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${activeTab === "orders" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          📦 Заказы на сегодня
        </button>
        <button
          className={`tab ${activeTab === "stock" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("stock")}
        >
          📊 Остатки
        </button>
        <button
          className={`tab ${activeTab === "requests" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          📝 Заявки на закупку
        </button>
      </div>

      {/* Заказы на сегодня */}
      {activeTab === "orders" && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">📦 Заказы на сегодня ({todayOrders.length})</h2>
            {todayOrders.length === 0 ? (
              <p className="opacity-70">Заказов на сегодня нет</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>ID ученика</th>
                      <th>ID блюда</th>
                      <th>Тип оплаты</th>
                      <th>Статус</th>
                      <th>Время</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.student_id}</td>
                        <td>{order.dish_id}</td>
                        <td>{order.payment_type === "one-time" ? "Разовый" : "Абонемент"}</td>
                        <td>
                          <span className={`badge ${order.is_received ? "badge-success" : "badge-warning"}`}>
                            {order.is_received ? "Выдано" : "Ожидает выдачи"}
                          </span>
                        </td>
                        <td>{new Date(order.created_at).toLocaleTimeString("ru")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="stats shadow mt-4">
              <div className="stat">
                <div className="stat-title">Всего заказов</div>
                <div className="stat-value text-primary">{todayOrders.length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Выдано</div>
                <div className="stat-value text-success">
                  {todayOrders.filter((o) => o.is_received).length}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Ожидает</div>
                <div className="stat-value text-warning">
                  {todayOrders.filter((o) => !o.is_received).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Остатки */}
      {activeTab === "stock" && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">📊 Контроль остатков</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dishes.map((dish) => (
                <div
                  key={dish.id}
                  className={`card bg-base-200 shadow ${
                    dish.stock_quantity <= 5 ? "border-2 border-error" : ""
                  }`}
                >
                  <div className="card-body">
                    <h3 className="card-title text-lg">
                      {dish.is_breakfast ? "🌅" : "🌞"} {dish.name}
                    </h3>
                    <div className="flex justify-between items-center">
                      <span>Остаток:</span>
                      <span
                        className={`text-2xl font-bold ${
                          dish.stock_quantity <= 5 ? "text-error" : "text-success"
                        }`}
                      >
                        {dish.stock_quantity} шт.
                      </span>
                    </div>
                    {dish.stock_quantity <= 5 && (
                      <div className="alert alert-error mt-2">
                        <span>⚠️ Низкий остаток!</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Заявки на закупку */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">📝 Создать заявку на закупку</h2>
              <form onSubmit={handleCreateRequest} className="flex gap-4 flex-wrap">
                <input
                  type="text"
                  placeholder="Название продукта"
                  className="input input-bordered flex-1 min-w-50"
                  value={newRequest.item_name}
                  onChange={(e) => setNewRequest({ ...newRequest, item_name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Количество (напр. 10 кг)"
                  className="input input-bordered w-48"
                  value={newRequest.quantity}
                  onChange={(e) => setNewRequest({ ...newRequest, quantity: e.target.value })}
                />
                <button type="submit" className="btn btn-primary">
                  Создать заявку
                </button>
              </form>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">📋 Мои заявки</h2>
              {purchaseRequests.length === 0 ? (
                <p className="opacity-70">У вас пока нет заявок</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Продукт</th>
                        <th>Количество</th>
                        <th>Статус</th>
                        <th>Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseRequests.map((req) => (
                        <tr key={req.id}>
                          <td>#{req.id}</td>
                          <td>{req.item_name}</td>
                          <td>{req.quantity}</td>
                          <td>{getStatusBadge(req.status)}</td>
                          <td>{new Date(req.created_at).toLocaleDateString("ru")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
