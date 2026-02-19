import { useState, useEffect } from "react";
import { studentApi } from "../../api/student";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import DishCard from "../../components/common/DishCard";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/common/PageHeader";
import WeeklyPlanner from "../../components/common/WeeklyPlanner";
import {
  ShoppingCart,
  Star,
  MessageSquare,
  X,
  Calendar,
  Grid,
} from "lucide-react";
import {
  CroissantIcon,
  PlateIcon,
  SunriseIcon,
  SunIcon,
} from "../../components/common/Icons";

const MenuPage = () => {
  const { user, refreshUser } = useAuth();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [excludeAllergens, setExcludeAllergens] = useState(true);
  const [selectedDish, setSelectedDish] = useState(null);
  const [orderModal, setOrderModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [paymentType, setPaymentType] = useState("one-time");
  const [orderDate, setOrderDate] = useState("");
  const [subscriptionWeeks, setSubscriptionWeeks] = useState(1);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [viewMode, setViewMode] = useState("planner"); // "planner" or "grid"

  const isBreakfast = (dish) =>
    dish.meal_types?.some((mt) => mt.name === "breakfast");
  const isLunch = (dish) => dish.meal_types?.some((mt) => mt.name === "lunch");

  useEffect(() => {
    fetchDishes();
  }, [filter, excludeAllergens, viewMode]);

  const fetchDishes = async () => {
    setLoading(true);
    try {
      // In planner mode, always fetch all dishes regardless of filter
      const mealType =
        viewMode === "planner" ? null : filter === "all" ? null : filter;
      const data = await studentApi.getMenu(mealType, excludeAllergens);
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
      let orderData = {
        dishId: selectedDish.id,
        paymentType: paymentType,
        orderDate: orderDate || null,
      };

      if (paymentType === "subscription") {
        orderData.subscriptionWeeks = subscriptionWeeks;
      }

      await studentApi.createOrder(orderData);
      toast.success("Заказ успешно создан!");
      await refreshUser();
      setOrderModal(false);
      setOrderDate("");
      setSubscriptionWeeks(1);
      fetchDishes();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleBulkOrder = async (orderData) => {
    await studentApi.createOrder(orderData);
    await refreshUser();
    fetchDishes();
  };

  const openReviewModal = async (dish) => {
    setSelectedDish(dish);
    try {
      const data = await studentApi.getDishReviews(dish.id);
      const sortedData = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
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
      const sortedData = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
      setReviews(sortedData);
      setReviewData({ rating: 5, comment: "" });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <PageHeader
        title="Меню"
        subtitle={
          viewMode === "planner"
            ? "Спланируйте питание на неделю"
            : "Выберите блюда для заказа"
        }
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="badge badge-primary badge-lg text-xs sm:text-sm justify-center sm:justify-start">
              Баланс: {user?.balance?.toFixed(2)} ₽
            </div>
            <div className="btn-group w-full sm:w-auto">
              <button
                className={`btn btn-sm flex-1 sm:flex-none ${
                  viewMode === "planner" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setViewMode("planner")}
                title="Планировщик недели"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Планировщик</span>
                <span className="sm:hidden">План</span>
              </button>
              <button
                className={`btn btn-sm flex-1 sm:flex-none ${
                  viewMode === "grid" ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setViewMode("grid")}
                title="Сетка блюд"
              >
                <Grid className="h-4 w-4" />
                <span className="hidden sm:inline">Сетка</span>
                <span className="sm:hidden">Список</span>
              </button>
            </div>
          </div>
        }
      />

      {/* Filters - Only show in grid view */}
      {viewMode === "grid" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {[
              {
                key: "all",
                label: "Все",
                icon: null,
                activeButtonClass: "btn-primary",
                inactiveButtonClass: "btn-outline",
              },
              {
                key: "breakfast",
                label: "Завтраки",
                icon: <SunriseIcon className="h-4 w-4" />,
                activeButtonClass: "btn-warning",
                inactiveButtonClass: "btn-outline btn-warning",
              },
              {
                key: "lunch",
                label: "Обеды",
                icon: <SunIcon className="h-4 w-4" />,
                activeButtonClass: "btn-info",
                inactiveButtonClass: "btn-outline btn-info",
              },
            ].map((filterItem) => (
              <button
                key={filterItem.key}
                className={`btn btn-sm transition-all duration-200 hover:scale-105 ${
                  filter === filterItem.key
                    ? filterItem.activeButtonClass
                    : filterItem.inactiveButtonClass
                }`}
                onClick={() => setFilter(filterItem.key)}
              >
                {filterItem.icon && (
                  <span className="mr-1">{filterItem.icon}</span>
                )}
                {filterItem.label}
              </button>
            ))}
          </div>

          {/* Allergy Filter */}
          {user?.allergens_rel && user.allergens_rel.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="label cursor-pointer gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-warning"
                  checked={excludeAllergens}
                  onChange={(e) => setExcludeAllergens(e.target.checked)}
                />
                <span className="label-text">
                  Скрыть блюда с моими аллергенами
                </span>
              </label>
              <div className="flex flex-wrap gap-1">
                {user.allergens_rel.map((allergen) => (
                  <span
                    key={allergen.id}
                    className="badge badge-error badge-sm"
                  >
                    {allergen.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content based on view mode */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : dishes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-base-content/60">Блюда не найдены</p>
        </div>
      ) : viewMode === "planner" ? (
        <WeeklyPlanner
          dishes={dishes}
          balance={user?.balance || 0}
          onBulkOrder={handleBulkOrder}
          user={user}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              balance={user?.balance || 0}
              onOrderClick={(dish) => {
                setSelectedDish(dish);
                setOrderModal(true);
              }}
              onReviewClick={openReviewModal}
            />
          ))}
        </div>
      )}

      {/* Order Modal */}
      {orderModal && selectedDish && (
        <Modal
          isOpen={orderModal}
          onClose={() => setOrderModal(false)}
          title="Оформление заказа"
        >
          <div>
            <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg transition-all duration-200 hover:bg-base-300">
              <div
                className={`${isBreakfast(selectedDish) ? "text-warning" : "text-info"} transition-transform duration-200 hover:scale-110`}
              >
                {isBreakfast(selectedDish) ? (
                  <CroissantIcon className="h-12 w-12" />
                ) : (
                  <PlateIcon className="h-12 w-12" />
                )}
              </div>
              <div>
                <div className="font-semibold">{selectedDish.name}</div>
                <div className="text-2xl font-bold text-primary">
                  {selectedDish.price} ₽
                </div>
                {(selectedDish.allergens ||
                  (selectedDish.allergens_rel &&
                    selectedDish.allergens_rel.length > 0)) && (
                  <div className="text-sm text-error mt-1 flex items-center gap-1 flex-wrap">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Аллергены:</span>
                    {selectedDish.allergens_rel &&
                    selectedDish.allergens_rel.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedDish.allergens_rel.map((allergen) => (
                          <span
                            key={allergen.id}
                            className="badge badge-error badge-sm"
                          >
                            {allergen.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span>{selectedDish.allergens}</span>
                    )}
                  </div>
                )}
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

            {paymentType === "subscription" && (
              <div className="form-control mt-4 flex flex-col">
                <label className="label">
                  <span className="label-text">Количество недель</span>
                </label>
                <select
                  className="select select-bordered"
                  value={subscriptionWeeks}
                  onChange={(e) =>
                    setSubscriptionWeeks(parseInt(e.target.value))
                  }
                >
                  {[1, 2, 3].map((week) => (
                    <option key={week} value={week}>
                      {week} недел{week > 1 ? "и" : "я"}
                    </option>
                  ))}
                </select>
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Выберите количество недель (до 3)
                  </span>
                </label>
              </div>
            )}

            <div className="form-control mt-4 flex flex-col">
              <label className="label">
                <span className="label-text">Дата заказа</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Оставьте пустым, чтобы заказать на сегодня
                </span>
              </label>
            </div>

            <div className="mt-4 p-3 bg-info/10 rounded-lg">
              <p className="text-sm">
                <strong>Ваш баланс:</strong> {user?.balance?.toFixed(2)} ₽
              </p>
              <p className="text-sm">
                <strong>После оплаты:</strong>{" "}
                {paymentType === "subscription"
                  ? (
                      user?.balance -
                      selectedDish.price * subscriptionWeeks
                    ).toFixed(2)
                  : (user?.balance - selectedDish.price).toFixed(2)}{" "}
                ₽
              </p>
            </div>
          </div>
          <div className="modal-action">
            <button
              className="btn btn-ghost transition-all duration-200 hover:scale-105"
              onClick={() => setOrderModal(false)}
            >
              Отмена
            </button>
            <button
              className="btn btn-primary transition-all duration-200 hover:scale-105"
              onClick={handleOrder}
            >
              Оплатить
            </button>
          </div>
        </Modal>
      )}

      {/* Reviews Modal */}
      {reviewModal && selectedDish && (
        <Modal
          isOpen={reviewModal}
          onClose={() => setReviewModal(false)}
          title={`Отзывы о ${selectedDish.name}`}
          size="max-w-2xl"
        >
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
              className="btn btn-primary btn-sm mt-2 transition-all duration-200 hover:scale-105"
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
            <button
              className="btn transition-all duration-200 hover:scale-105"
              onClick={() => setReviewModal(false)}
            >
              Закрыть
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MenuPage;
