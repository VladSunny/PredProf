import { useState, useEffect } from "react";
import api from "../../api/config";
import { useAuth } from "../../context/AuthContext";
import { Layout } from "../../components/Layout";

export function Menu() {
  const [dishes, setDishes] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const { user, updateUser } = useAuth();

  useEffect(() => {
    fetchDishes();
  }, [filter]);

  const fetchDishes = async () => {
    setLoading(true);
    try {
      let url = "/menu";
      if (filter === "breakfast") url += "?is_breakfast=true";
      else if (filter === "lunch") url += "?is_breakfast=false";

      const response = await api.get(url);
      setDishes(response.data);
    } catch (error) {
      console.error("Ошибка загрузки меню:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (dishId, paymentType = "single") => {
    setOrderLoading(dishId);
    try {
      await api.post("/orders", { dish_id: dishId, payment_type: paymentType });

      // Обновляем баланс пользователя
      const userResponse = await api.get("/me");
      updateUser(userResponse.data);

      alert("Заказ успешно создан!");
    } catch (error) {
      alert(error.response?.data?.detail || "Ошибка создания заказа");
    } finally {
      setOrderLoading(null);
    }
  };

  const openDishDetails = async (dish) => {
    setSelectedDish(dish);
    try {
      const response = await api.get(`/dishes/${dish.id}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error("Ошибка загрузки отзывов:", error);
    }
  };

  const submitReview = async () => {
    try {
      await api.post("/reviews", {
        dish_id: selectedDish.id,
        rating: newReview.rating,
        comment: newReview.comment,
      });

      const response = await api.get(`/dishes/${selectedDish.id}/reviews`);
      setReviews(response.data);
      setNewReview({ rating: 5, comment: "" });
      alert("Отзыв добавлен!");
    } catch (error) {
      alert(error.response?.data?.detail || "Ошибка добавления отзыва");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Меню</h1>
          <div className="join">
            <button
              className={`btn join-item ${filter === "all" ? "btn-active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Все
            </button>
            <button
              className={`btn join-item ${filter === "breakfast" ? "btn-active" : ""}`}
              onClick={() => setFilter("breakfast")}
            >
              🌅 Завтраки
            </button>
            <button
              className={`btn join-item ${filter === "lunch" ? "btn-active" : ""}`}
              onClick={() => setFilter("lunch")}
            >
              ☀️ Обеды
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : dishes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-base-content/70">Меню пока пусто</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dishes.map((dish) => (
              <div key={dish.id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <h2 className="card-title">{dish.name}</h2>
                    <span
                      className={`badge ${dish.is_breakfast ? "badge-warning" : "badge-info"}`}
                    >
                      {dish.is_breakfast ? "🌅 Завтрак" : "☀️ Обед"}
                    </span>
                  </div>
                  <p className="text-base-content/70">{dish.description}</p>

                  {dish.allergens && (
                    <div className="flex flex-wrap gap-1">
                      {dish.allergens.split(",").map((allergen, idx) => (
                        <span key={idx} className="badge badge-error badge-sm">
                          {allergen.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-bold text-primary">
                      {dish.price} ₽
                    </span>
                    <span className="text-sm text-base-content/50">
                      Осталось: {dish.stock_quantity}
                    </span>
                  </div>

                  <div className="card-actions justify-end mt-4">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => openDishDetails(dish)}
                    >
                      Отзывы
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleOrder(dish.id, "single")}
                      disabled={
                        orderLoading === dish.id ||
                        dish.stock_quantity === 0 ||
                        user.balance < dish.price
                      }
                    >
                      {orderLoading === dish.id ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        "Заказать"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно с отзывами */}
      {selectedDish && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{selectedDish.name} - Отзывы</h3>

            <div className="py-4 space-y-4 max-h-60 overflow-y-auto">
              {reviews.length === 0 ? (
                <p className="text-center text-base-content/70">
                  Отзывов пока нет
                </p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border-b pb-2">
                    <div className="flex items-center gap-2">
                      <div className="rating rating-sm">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <input
                            key={star}
                            type="radio"
                            className="mask mask-star-2 bg-orange-400"
                            checked={review.rating === star}
                            readOnly
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1">{review.comment}</p>
                  </div>
                ))
              )}
            </div>

            <div className="divider">Оставить отзыв</div>

            <div className="space-y-2">
              <div className="rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <input
                    key={star}
                    type="radio"
                    className="mask mask-star-2 bg-orange-400"
                    checked={newReview.rating === star}
                    onChange={() =>
                      setNewReview({ ...newReview, rating: star })
                    }
                  />
                ))}
              </div>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Ваш отзыв..."
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview({ ...newReview, comment: e.target.value })
                }
              ></textarea>
              <button className="btn btn-primary btn-sm" onClick={submitReview}>
                Отправить
              </button>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedDish(null)}>
                Закрыть
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setSelectedDish(null)}>close</button>
          </form>
        </dialog>
      )}
    </Layout>
  );
}
