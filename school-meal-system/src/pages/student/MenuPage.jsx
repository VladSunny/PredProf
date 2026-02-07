import { useState, useEffect } from "react";
import { studentApi } from "../../api/student";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { ShoppingCart, Star, MessageSquare, X } from "lucide-react";

const MenuPage = () => {
  const { user, refreshUser } = useAuth();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedDish, setSelectedDish] = useState(null);
  const [orderModal, setOrderModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [paymentType, setPaymentType] = useState("one-time");
  const [orderDate, setOrderDate] = useState(""); // New state for order date
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    fetchDishes();
  }, [filter]);

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const isBreakfast = filter === "all" ? null : filter === "breakfast";
      const data = await studentApi.getMenu(isBreakfast);
      // Sort dishes alphabetically by name
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
      setDishes(sortedData);
    } catch (error) {
      toast.error("Ошибка загрузки меню");
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!selectedDish) return;

    try {
      await studentApi.createOrder(selectedDish.id, paymentType, orderDate);
      toast.success("Заказ успешно создан!");
      await refreshUser();
      setOrderModal(false);
      setOrderDate(""); // Reset order date after successful order
      fetchDishes();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openReviewModal = async (dish) => {
    setSelectedDish(dish);
    try {
      const data = await studentApi.getDishReviews(dish.id);
      // Sort reviews by created_at timestamp (newer first)
      const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setReviews(sortedData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
    setReviewModal(true);
  };

  const handleReviewSubmit = async () => {
    if (!selectedDish) return;

    try {
      await studentApi.createReview(
        selectedDish.id,
        reviewData.rating,
        reviewData.comment,
      );
      toast.success("Отзыв добавлен!");
      const data = await studentApi.getDishReviews(selectedDish.id);
      // Sort reviews by created_at timestamp (newer first)
      const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setReviews(sortedData);
      setReviewData({ rating: 5, comment: "" });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Меню</h1>
          <p className="text-base-content/60">Выберите блюда для заказа</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="badge badge-primary badge-lg text-xs sm:text-sm">
            Баланс: {user?.balance?.toFixed(2)} ₽
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="tabs tabs-boxed bg-base-100 w-fit">
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

      {/* Menu Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : dishes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-base-content/60">Блюда не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dishes.map((dish) => (
            <div key={dish.id} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="text-4xl">
                    {dish.is_breakfast ? "🥐" : "🍝"}
                  </div>
                  <div
                    className={`badge ${dish.is_breakfast ? "badge-warning" : "badge-info"} text-xs`}
                  >
                    {dish.is_breakfast ? "Завтрак" : "Обед"}
                  </div>
                </div>
                <h3 className="card-title text-sm sm:text-base">{dish.name}</h3>
                <p className="text-base-content/60 text-xs sm:text-sm">
                  {dish.description || "Вкусное блюдо"}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xl sm:text-2xl font-bold text-primary">
                    {dish.price} ₽
                  </span>
                  <div
                    className={`badge ${dish.stock_quantity > 0 ? "badge-success" : "badge-error"} gap-1 text-xs`}
                  >
                    {dish.stock_quantity > 0
                      ? `В наличии: ${dish.stock_quantity}`
                      : "Нет в наличии"}
                  </div>
                </div>
                <div className="card-actions justify-end mt-4 gap-2">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => openReviewModal(dish)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Отзывы
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={
                      dish.stock_quantity === 0 || dish.price > user?.balance
                    }
                    onClick={() => {
                      setSelectedDish(dish);
                      setOrderModal(true);
                    }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Заказать
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Modal */}
      {orderModal && selectedDish && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setOrderModal(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-lg">Оформление заказа</h3>
            <div className="py-4">
              <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                <div className="text-4xl">
                  {selectedDish.is_breakfast ? "🥐" : "🍝"}
                </div>
                <div>
                  <div className="font-semibold">{selectedDish.name}</div>
                  <div className="text-2xl font-bold text-primary">
                    {selectedDish.price} ₽
                  </div>
                </div>
              </div>

              <div className="form-control mt-4 flex flex-col">
                <label className="label">
                  <span className="label-text">Тип оплаты</span>
                </label>
                <div className="flex gap-4">
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="payment"
                      className="radio radio-primary"
                      checked={paymentType === "one-time"}
                      onChange={() => setPaymentType("one-time")}
                    />
                    <span>Разовый платеж</span>
                  </label>
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="payment"
                      className="radio radio-primary"
                      checked={paymentType === "subscription"}
                      onChange={() => setPaymentType("subscription")}
                    />
                    <span>Абонемент</span>
                  </label>
                </div>
              </div>

              <div className="form-control mt-4 flex flex-col">
                <label className="label">
                  <span className="label-text">Дата заказа</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} // Allow selecting today and future dates
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">Оставьте пустым, чтобы заказать на сегодня</span>
                </label>
              </div>

              <div className="mt-4 p-3 bg-info/10 rounded-lg">
                <p className="text-sm">
                  <strong>Ваш баланс:</strong> {user?.balance?.toFixed(2)} ₽
                </p>
                <p className="text-sm">
                  <strong>После оплаты:</strong>{" "}
                  {(user?.balance - selectedDish.price).toFixed(2)} ₽
                </p>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setOrderModal(false)}
              >
                Отмена
              </button>
              <button className="btn btn-primary" onClick={handleOrder}>
                Оплатить
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/50"
            onClick={() => setOrderModal(false)}
          ></div>
        </div>
      )}

      {/* Reviews Modal */}
      {reviewModal && selectedDish && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setReviewModal(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-lg">Отзывы о {selectedDish.name}</h3>

            {/* Add Review */}
            <div className="py-4 border-b border-base-200">
              <h4 className="font-semibold mb-2">Оставить отзыв</h4>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">Оценка:</span>
                <div className="rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <input
                      key={star}
                      type="radio"
                      name="rating"
                      className="mask mask-star-2 bg-warning"
                      checked={reviewData.rating === star}
                      onChange={() =>
                        setReviewData({ ...reviewData, rating: star })
                      }
                    />
                  ))}
                </div>
              </div>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Ваш комментарий..."
                value={reviewData.comment}
                onChange={(e) =>
                  setReviewData({ ...reviewData, comment: e.target.value })
                }
              />
              <button
                className="btn btn-primary btn-sm mt-2"
                onClick={handleReviewSubmit}
              >
                Отправить
              </button>
            </div>

            {/* Reviews List */}
            <div className="py-4 space-y-4 max-h-64 overflow-y-auto">
              {reviews.length === 0 ? (
                <p className="text-center text-base-content/60">
                  Пока нет отзывов
                </p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="p-3 bg-base-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="rating rating-sm">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <input
                            key={star}
                            type="radio"
                            className="mask mask-star-2 bg-warning"
                            checked={review.rating === star}
                            disabled
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm">{review.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setReviewModal(false)}>
                Закрыть
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/50"
            onClick={() => setReviewModal(false)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
