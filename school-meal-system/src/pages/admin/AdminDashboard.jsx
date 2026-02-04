import { useState, useEffect } from "react";
import * as api from "../../api";

export const AdminDashboard = () => {
  const [paymentStats, setPaymentStats] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [newDish, setNewDish] = useState({
    name: "",
    description: "",
    price: "",
    is_breakfast: true,
    stock_quantity: "",
  });
  const [editingDish, setEditingDish] = useState(null);

  const fetchData = async () => {
    try {
      const [payStats, attStats, requests, dishesData] = await Promise.all([
        api.getPaymentStats(),
        api.getAttendanceStats(),
        api.getAllPurchaseRequests(),
        api.getMenu(),
      ]);
      setPaymentStats(payStats);
      setAttendanceStats(attStats);
      setPurchaseRequests(requests);
      setDishes(dishesData);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateRequestStatus = async (id, status) => {
    try {
      await api.updatePurchaseRequestStatus(id, status);
      setMessage({
        type: "success",
        text: `Заявка ${status === "approved" ? "одобрена" : "отклонена"}!`,
      });
      fetchData();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleCreateDish = async (e) => {
    e.preventDefault();
    try {
      await api.createDish({
        ...newDish,
        price: parseFloat(newDish.price),
        stock_quantity: parseInt(newDish.stock_quantity),
      });
      setMessage({ type: "success", text: "Блюдо успешно создано!" });
      setNewDish({
        name: "",
        description: "",
        price: "",
        is_breakfast: true,
        stock_quantity: "",
      });
      fetchData();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleUpdateDish = async (e) => {
    e.preventDefault();
    try {
      await api.updateDish(editingDish.id, {
        ...editingDish,
        price: parseFloat(editingDish.price),
        stock_quantity: parseInt(editingDish.stock_quantity),
      });
      setMessage({ type: "success", text: "Блюдо обновлено!" });
      setEditingDish(null);
      fetchData();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleDeleteDish = async (id) => {
    if (!confirm("Вы уверены, что хотите удалить это блюдо?")) return;
    try {
      await api.deleteDish(id);
      setMessage({ type: "success", text: "Блюдо удалено!" });
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
        <div
          className={`alert ${message.type === "error" ? "alert-error" : "alert-success"} mb-4`}
        >
          <span>{message.text}</span>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setMessage({ type: "", text: "" })}
          >
            ✕
          </button>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">🔧 Панель администратора</h1>

      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${activeTab === "stats" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          📊 Статистика
        </button>
        <button
          className={`tab ${activeTab === "requests" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          📝 Заявки на закупку
        </button>
        <button
          className={`tab ${activeTab === "dishes" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("dishes")}
        >
          🍽️ Управление меню
        </button>
      </div>

      {/* Статистика */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">💰 Статистика оплат</h2>
                <div className="stats stats-vertical shadow">
                  <div className="stat">
                    <div className="stat-title">Общий доход</div>
                    <div className="stat-value text-primary">
                      {paymentStats?.total_revenue?.toFixed(2)} ₽
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Количество заказов</div>
                    <div className="stat-value">
                      {paymentStats?.orders_count}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Средний чек</div>
                    <div className="stat-value text-secondary">
                      {paymentStats?.average_order_value?.toFixed(2)} ₽
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">👥 Статистика посещаемости</h2>
                <div className="stats stats-vertical shadow">
                  <div className="stat">
                    <div className="stat-title">Уникальных пользователей</div>
                    <div className="stat-value text-primary">
                      {attendanceStats?.unique_users}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Всего заказов</div>
                    <div className="stat-value">
                      {attendanceStats?.total_orders}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">
                      Среднее заказов на пользователя
                    </div>
                    <div className="stat-value text-secondary">
                      {attendanceStats?.average_orders_per_user?.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Заявки на закупку */}
      {activeTab === "requests" && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">📝 Заявки на закупку</h2>
            {purchaseRequests.length === 0 ? (
              <p className="opacity-70">Нет заявок</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Продукт</th>
                      <th>Количество</th>
                      <th>ID повара</th>
                      <th>Статус</th>
                      <th>Дата</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseRequests.map((req) => (
                      <tr key={req.id}>
                        <td>#{req.id}</td>
                        <td>{req.item_name}</td>
                        <td>{req.quantity}</td>
                        <td>{req.chef_id}</td>
                        <td>{getStatusBadge(req.status)}</td>
                        <td>
                          {new Date(req.created_at).toLocaleDateString("ru")}
                        </td>
                        <td>
                          {req.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() =>
                                  handleUpdateRequestStatus(req.id, "approved")
                                }
                              >
                                ✓
                              </button>
                              <button
                                className="btn btn-sm btn-error"
                                onClick={() =>
                                  handleUpdateRequestStatus(req.id, "rejected")
                                }
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Управление меню */}
      {activeTab === "dishes" && (
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">➕ Добавить блюдо</h2>
              <form
                onSubmit={handleCreateDish}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <input
                  type="text"
                  placeholder="Название"
                  className="input input-bordered"
                  value={newDish.name}
                  onChange={(e) =>
                    setNewDish({ ...newDish, name: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Описание"
                  className="input input-bordered"
                  value={newDish.description}
                  onChange={(e) =>
                    setNewDish({ ...newDish, description: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Цена"
                  className="input input-bordered"
                  value={newDish.price}
                  onChange={(e) =>
                    setNewDish({ ...newDish, price: e.target.value })
                  }
                  required
                  min="0"
                  step="0.01"
                />
                <input
                  type="number"
                  placeholder="Количество"
                  className="input input-bordered"
                  value={newDish.stock_quantity}
                  onChange={(e) =>
                    setNewDish({ ...newDish, stock_quantity: e.target.value })
                  }
                  required
                  min="0"
                />
                <select
                  className="select select-bordered"
                  value={newDish.is_breakfast}
                  onChange={(e) =>
                    setNewDish({
                      ...newDish,
                      is_breakfast: e.target.value === "true",
                    })
                  }
                >
                  <option value="true">🌅 Завтрак</option>
                  <option value="false">🌞 Обед</option>
                </select>
                <button type="submit" className="btn btn-primary">
                  Добавить
                </button>
              </form>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">📋 Список блюд</h2>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Тип</th>
                      <th>Название</th>
                      <th>Описание</th>
                      <th>Цена</th>
                      <th>Остаток</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dishes.map((dish) => (
                      <tr key={dish.id}>
                        <td>#{dish.id}</td>
                        <td>{dish.is_breakfast ? "🌅" : "🌞"}</td>
                        <td>{dish.name}</td>
                        <td className="max-w-xs truncate">
                          {dish.description}
                        </td>
                        <td>{dish.price} ₽</td>
                        <td>{dish.stock_quantity}</td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => setEditingDish({ ...dish })}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-sm btn-error btn-outline"
                              onClick={() => handleDeleteDish(dish.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модалка редактирования блюда */}
      {editingDish && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Редактировать блюдо</h3>
            <form onSubmit={handleUpdateDish} className="space-y-4 mt-4">
              <input
                type="text"
                placeholder="Название"
                className="input input-bordered w-full"
                value={editingDish.name}
                onChange={(e) =>
                  setEditingDish({ ...editingDish, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Описание"
                className="input input-bordered w-full"
                value={editingDish.description || ""}
                onChange={(e) =>
                  setEditingDish({
                    ...editingDish,
                    description: e.target.value,
                  })
                }
              />
              <input
                type="number"
                placeholder="Цена"
                className="input input-bordered w-full"
                value={editingDish.price}
                onChange={(e) =>
                  setEditingDish({ ...editingDish, price: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Количество"
                className="input input-bordered w-full"
                value={editingDish.stock_quantity}
                onChange={(e) =>
                  setEditingDish({
                    ...editingDish,
                    stock_quantity: e.target.value,
                  })
                }
              />
              <select
                className="select select-bordered w-full"
                value={editingDish.is_breakfast}
                onChange={(e) =>
                  setEditingDish({
                    ...editingDish,
                    is_breakfast: e.target.value === "true",
                  })
                }
              >
                <option value="true">🌅 Завтрак</option>
                <option value="false">🌞 Обед</option>
              </select>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setEditingDish(null)}
                >
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
