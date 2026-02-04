import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../api";

export const StudentDashboard = () => {
  const { user, refreshUser } = useAuth();
  const [dishes, setDishes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedDish, setSelectedDish] = useState(null);
  const [paymentType, setPaymentType] = useState("one-time");
  const [reviewModal, setReviewModal] = useState({ open: false, dish: null });
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [balanceAmount, setBalanceAmount] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchData = async () => {
    try {
      const [menuData, ordersData] = await Promise.all([
        api.getMenu(),
        api.getMyOrders(),
      ]);
      setDishes(menuData);
      setOrders(ordersData);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOrder = async () => {
    if (!selectedDish) return;
    try {
      await api.createOrder({
        dish_id: selectedDish.id,
        payment_type: paymentType,
      });
      setMessage({ type: "success", text: "Заказ успешно создан!" });
      setSelectedDish(null);
      fetchData();
      refreshUser();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleReceive = async (orderId) => {
    try {
      await api.markOrderReceived(orderId);
      setMessage({ type: "success", text: "Заказ отмечен как полученный!" });
      fetchData();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleReview = async () => {
    try {
      await api.createReview({
        dish_id: reviewModal.dish.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      setMessage({ type: "success", text: "Отзыв успешно добавлен!" });
      setReviewModal({ open: false, dish: null });
      setReviewData({ rating: 5, comment: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleAddBalance = async () => {
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: "error", text: "Введите корректную сумму" });
      return;
    }
    try {
      await api.addBalance(amount);
      setMessage({ type: "success", text: `Баланс пополнен на ${amount} ₽` });
      setBalanceAmount("");
      refreshUser();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const filteredDishes = dishes.filter((dish) => {
    if (filter === "breakfast") return dish.is_breakfast;
    if (filter === "lunch") return !dish.is_breakfast;
    return true;
  });

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

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

      {/* Баланс */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">
            💰 Баланс: {user?.balance?.toFixed(2)} ₽
          </h2>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Сумма пополнения"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
              className="input input-bordered flex-1"
            />
            <button className="btn btn-primary" onClick={handleAddBalance}>
              Пополнить
            </button>
          </div>
        </div>
      </div>

      {/* Меню */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">📋 Меню</h2>
          <div className="tabs tabs-boxed mb-4">
            <button
              className={`tab ${filter === "all" ? "tab-active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Все
            </button>
            <button
              className={`tab ${filter === "breakfast" ? "tab-active" : ""}`}
              onClick={() => setFilter("breakfast")}
            >
              🌅 Завтраки
            </button>
            <button
              className={`tab ${filter === "lunch" ? "tab-active" : ""}`}
              onClick={() => setFilter("lunch")}
            >
              🌞 Обеды
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDishes.map((dish) => (
              <div key={dish.id} className="card bg-base-200 shadow">
                <div className="card-body">
                  <h3 className="card-title text-lg">
                    {dish.is_breakfast ? "🌅" : "🌞"} {dish.name}
                  </h3>
                  <p className="text-sm opacity-70">{dish.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold">{dish.price} ₽</span>
                    <span className="badge badge-outline">
                      В наличии: {dish.stock_quantity}
                    </span>
                  </div>
                  <div className="card-actions justify-end mt-2">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => setReviewModal({ open: true, dish })}
                    >
                      ⭐ Отзыв
                    </button>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => setSelectedDish(dish)}
                      disabled={dish.stock_quantity === 0}
                    >
                      🛒 Заказать
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Мои заказы */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">📦 Мои заказы</h2>
          {orders.length === 0 ? (
            <p className="opacity-70">У вас пока нет заказов</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Тип оплаты</th>
                    <th>Статус</th>
                    <th>Дата</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        {order.payment_type === "one-time"
                          ? "Разовый"
                          : "Абонемент"}
                      </td>
                      <td>
                        <span
                          className={`badge ${order.is_received ? "badge-success" : "badge-warning"}`}
                        >
                          {order.is_received ? "Получено" : "Ожидает"}
                        </span>
                      </td>
                      <td>
                        {new Date(order.created_at).toLocaleDateString("ru")}
                      </td>
                      <td>
                        {!order.is_received && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleReceive(order.id)}
                          >
                            ✓ Получить
                          </button>
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

      {/* Модалка заказа */}
      {selectedDish && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Заказать: {selectedDish.name}</h3>
            <p className="py-4">Цена: {selectedDish.price} ₽</p>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Тип оплаты</span>
              </label>
              <select
                className="select select-bordered"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              >
                <option value="one-time">Разовый платеж</option>
                <option value="subscription">Абонемент</option>
              </select>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedDish(null)}>
                Отмена
              </button>
              <button className="btn btn-primary" onClick={handleOrder}>
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка отзыва */}
      {reviewModal.open && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Отзыв: {reviewModal.dish?.name}
            </h3>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Оценка</span>
              </label>
              <div className="rating rating-lg">
                {[1, 2, 3, 4, 5].map((star) => (
                  <input
                    key={star}
                    type="radio"
                    name="rating"
                    className="mask mask-star-2 bg-orange-400"
                    checked={reviewData.rating === star}
                    onChange={() =>
                      setReviewData({ ...reviewData, rating: star })
                    }
                  />
                ))}
              </div>
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Комментарий</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                placeholder="Ваш отзыв..."
                value={reviewData.comment}
                onChange={(e) =>
                  setReviewData({ ...reviewData, comment: e.target.value })
                }
              />
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setReviewModal({ open: false, dish: null })}
              >
                Отмена
              </button>
              <button className="btn btn-primary" onClick={handleReview}>
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
