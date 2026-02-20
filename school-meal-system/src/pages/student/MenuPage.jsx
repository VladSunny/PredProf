import { useState, useEffect } from "react";
import { studentApi } from "../../api/student";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import DishCard from "../../components/common/DishCard";
import PageHeader from "../../components/common/PageHeader";
import WeeklyPlanner from "../../components/common/WeeklyPlanner";
import OrderModal from "../../components/common/OrderModal";
import ReviewsModal from "../../components/common/ReviewsModal";
import { Calendar, Grid } from "lucide-react";
import {
  CroissantIcon,
  PlateIcon,
  SunIcon,
  SunriseIcon,
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
      <OrderModal
        isOpen={orderModal}
        onClose={() => setOrderModal(false)}
        dish={selectedDish}
        user={user}
        paymentType={paymentType}
        setPaymentType={setPaymentType}
        orderDate={orderDate}
        setOrderDate={setOrderDate}
        subscriptionWeeks={subscriptionWeeks}
        setSubscriptionWeeks={setSubscriptionWeeks}
        onOrder={handleOrder}
      />

      {/* Reviews Modal */}
      <ReviewsModal
        isOpen={reviewModal}
        onClose={() => setReviewModal(false)}
        dish={selectedDish}
        reviews={reviews}
        reviewData={reviewData}
        setReviewData={setReviewData}
        onReviewSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default MenuPage;
