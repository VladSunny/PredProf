import { useState, useEffect } from "react";
import { studentApi } from "../../api/student";
import toast from "react-hot-toast";
import OrderCard from "../../components/common/OrderCard";
import FilterTabs from "../../components/common/FilterTabs";
import StatCard from "../../components/common/StatCard";
import OrderCalendar from "../../components/common/OrderCalendar";
import {
  CheckCircle,
  Clock,
  Package,
  Calendar,
  List,
  Sun,
  Moon,
} from "lucide-react";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await studentApi.getMyOrders();
      const sortedData = data.sort((a, b) => {
        const dateA = a.order_date
          ? new Date(a.order_date)
          : new Date(a.created_at);
        const dateB = b.order_date
          ? new Date(b.order_date)
          : new Date(b.created_at);
        return dateB - dateA;
      });
      setOrders(sortedData);
    } catch (error) {
      toast.error("Ошибка загрузки заказов");
    } finally {
      setLoading(false);
    }
  };

  const handleReceive = async (orderId) => {
    try {
      await studentApi.markOrderReceived(orderId);
      toast.success("Заказ отмечен как полученный!");
      fetchOrders();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "pending") return !order.is_received;
    if (filter === "received") return order.is_received;
    return true;
  });

  const pendingCount = orders.filter((o) => !o.is_received).length;
  const receivedCount = orders.filter((o) => o.is_received).length;

  // Aggregate orders by date and meal type
  const getMealType = (order) => {
    const mealTypes = order.dish?.meal_types || [];
    const isBreakfast = mealTypes.some((mt) => mt.name === "breakfast");
    const isLunch = mealTypes.some((mt) => mt.name === "lunch");

    if (isBreakfast && isLunch) return "both";
    if (isBreakfast) return "breakfast";
    if (isLunch) return "lunch";
    return "other";
  };

  const getMealTypeLabel = (type) => {
    // switch (type) {
    //   case "breakfast":
    //     return { label: "Завтрак", icon: Sun };
    //   case "lunch":
    //     return { label: "Обед", icon: Moon };
    //   case "both":
    //     return { label: "Завтрак и Обед", icon: Sun };
    //   default:
    //     return { label: "Другое", icon: Package };
    // }
    return { label: "Блюда на сегодня", icon: Package };
  };

  const aggregateOrders = () => {
    const grouped = {};

    filteredOrders.forEach((order) => {
      const date = order.order_date
        ? new Date(order.order_date).toLocaleDateString("ru-RU")
        : new Date(order.created_at).toLocaleDateString("ru-RU");
      const mealType = getMealType(order);

      if (!grouped[date]) {
        grouped[date] = {};
      }
      if (!grouped[date][mealType]) {
        grouped[date][mealType] = [];
      }
      grouped[date][mealType].push(order);
    });

    return grouped;
  };

  const aggregatedOrders = aggregateOrders();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Мои заказы</h1>
          <p className="text-base-content/60">История ваших заказов</p>
        </div>

        {/* View Mode Toggle */}
        <div className="join">
          <button
            className={`join-item btn btn-sm ${viewMode === "list" ? "btn-active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4 mr-1" />
            Список
          </button>
          <button
            className={`join-item btn btn-sm ${viewMode === "calendar" ? "btn-active" : ""}`}
            onClick={() => setViewMode("calendar")}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Календарь
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats shadow w-full">
        <StatCard
          title="Всего заказов"
          value={orders.length}
          figure={<Package className="h-8 w-8" />}
          color="primary"
        />
        <StatCard
          title="Ожидают получения"
          value={pendingCount}
          figure={<Clock className="h-8 w-8" />}
          color="warning"
        />
        <StatCard
          title="Получено"
          value={receivedCount}
          figure={<CheckCircle className="h-8 w-8" />}
          color="success"
        />
      </div>

      {/* Filters */}
      <FilterTabs
        filters={[
          { key: "all", label: `Все (${orders.length})` },
          { key: "pending", label: `Ожидают (${pendingCount})` },
          { key: "received", label: `Получены (${receivedCount})` },
        ]}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      {/* Orders Display based on view mode */}
      {viewMode === "list" ? (
        <>
          {/* Aggregated Orders List */}
          {Object.keys(aggregatedOrders).length === 0 ? (
            <div className="text-center py-12 bg-base-100 rounded-box">
              <Package className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
              <p className="text-base-content/60">Заказов нет</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(aggregatedOrders).map(([date, mealTypes]) => (
                <div
                  key={date}
                  className="collapse collapse-arrow bg-base-100 shadow"
                >
                  <input type="checkbox" />
                  <div className="collapse-title text-xl font-bold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {date}
                  </div>
                  <div className="collapse-content">
                    <div className="space-y-2">
                      {Object.entries(mealTypes).map(([mealType, orders]) => {
                        const { label: mealLabel, icon: MealIcon } =
                          getMealTypeLabel(mealType);
                        return (
                          <div
                            key={mealType}
                            className="collapse collapse-plus bg-base-200"
                          >
                            <input type="checkbox" />
                            <div className="collapse-title font-medium flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <MealIcon className="h-4 w-4" />
                                {mealLabel}
                              </span>
                              <span className="badge badge-sm">
                                {orders.length}
                              </span>
                            </div>
                            <div className="collapse-content">
                              <div className="space-y-2">
                                {orders.map((order) => (
                                  <div
                                    key={order.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-base-100"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="text-2xl">
                                        {order.is_received ? "✅" : "⏳"}
                                      </div>
                                      <div>
                                        <p className="font-medium">
                                          {order.dish?.name ||
                                            `Блюдо #${order.dish_id}`}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-base-content/60">
                                          <span
                                            className={`badge ${order.payment_type === "subscription" ? "badge-secondary" : "badge-primary"} badge-xs`}
                                          >
                                            {order.payment_type ===
                                            "subscription"
                                              ? "Абонемент"
                                              : "Разовый"}
                                          </span>
                                          <span
                                            className={`badge ${order.is_received ? "badge-success" : "badge-warning"} badge-xs`}
                                          >
                                            {order.is_received
                                              ? "Получено"
                                              : "Ожидает"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    {!order.is_received && (
                                      <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => handleReceive(order.id)}
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                        Получить
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <OrderCalendar
          orders={filteredOrders}
          userType="student"
          onReceiveClick={handleReceive}
        />
      )}
    </div>
  );
};

export default OrdersPage;
