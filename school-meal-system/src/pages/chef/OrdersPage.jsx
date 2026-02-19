import { useState, useEffect, useMemo } from "react";
import { chefApi } from "../../api/chef";
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
  Search,
  ChefHat,
  Utensils,
} from "lucide-react";

const ChefOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateGroupFilter, setDateGroupFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await chefApi.getAllOrders();
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

  // Helper to get order date
  const getOrderDate = (order) => {
    return order.order_date
      ? new Date(order.order_date)
      : new Date(order.created_at);
  };

  // Helper to check if date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Helper to check if date is tomorrow
  const isTomorrow = (date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    );
  };

  // Group orders by date
  const groupedOrders = useMemo(() => {
    const groups = {
      today: [],
      tomorrow: [],
      future: [],
    };

    orders.forEach((order) => {
      const orderDate = getOrderDate(order);
      if (isToday(orderDate)) {
        groups.today.push(order);
      } else if (isTomorrow(orderDate)) {
        groups.tomorrow.push(order);
      } else {
        groups.future.push(order);
      }
    });

    // Sort each group by date descending
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => getOrderDate(b) - getOrderDate(a));
    });

    return groups;
  }, [orders]);

  // Calculate dish summary for today's pending orders
  const todayDishSummary = useMemo(() => {
    const summary = {};
    groupedOrders.today
      .filter((order) => !order.is_received)
      .forEach((order) => {
        const dishName = order.dish?.name || `Блюдо #${order.dish_id}`;
        if (!summary[dishName]) {
          summary[dishName] = {
            name: dishName,
            count: 0,
            orders: [],
          };
        }
        summary[dishName].count++;
        summary[dishName].orders.push(order);
      });
    return Object.values(summary).sort((a, b) => b.count - a.count);
  }, [groupedOrders.today]);

  // Filter orders based on all criteria
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Apply status filter
    if (filter === "pending") {
      result = result.filter((order) => !order.is_received);
    } else if (filter === "received") {
      result = result.filter((order) => order.is_received);
    }

    // Apply date group filter
    if (dateGroupFilter === "today") {
      result = result.filter((order) => isToday(getOrderDate(order)));
    } else if (dateGroupFilter === "tomorrow") {
      result = result.filter((order) => isTomorrow(getOrderDate(order)));
    } else if (dateGroupFilter === "future") {
      result = result.filter(
        (order) => !isToday(getOrderDate(order)) && !isTomorrow(getOrderDate(order)),
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((order) => {
        const studentName = order.student?.full_name?.toLowerCase() || "";
        return studentName.includes(query);
      });
    }

    return result;
  }, [orders, filter, dateGroupFilter, searchQuery]);

  const pendingCount = orders.filter((o) => !o.is_received).length;
  const receivedCount = orders.filter((o) => o.is_received).length;
  const todayPendingCount = groupedOrders.today.filter(
    (o) => !o.is_received,
  ).length;

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
          <h1 className="text-2xl font-bold">Все заказы</h1>
          <p className="text-base-content/60">Список всех заказов в системе</p>
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
      <div className="stats shadow w-full bg-base-100">
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
        <StatCard
          title="Сегодня к приготовлению"
          value={todayPendingCount}
          figure={<ChefHat className="h-8 w-8" />}
          color="error"
        />
      </div>

      {/* Today's Dish Summary */}
      {todayDishSummary.length > 0 && viewMode === "list" && (
        <div className="card bg-gradient-to-br from-error/10 to-error/5 shadow-lg border border-error/20">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-2">
              <Utensils className="h-6 w-6 text-error" />
              <h2 className="text-xl font-bold text-error">
                Приготовить сегодня
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {todayDishSummary.map((dish) => (
                <div
                  key={dish.name}
                  className="bg-base-100 rounded-lg p-4 shadow-sm border border-base-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-base-content line-clamp-2">
                      {dish.name}
                    </h3>
                    <div className="badge badge-error badge-lg">
                      {dish.count}
                    </div>
                  </div>
                  <p className="text-sm text-base-content/60">
                    {dish.count === 1
                      ? "1 порция"
                      : `${dish.count} порции`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/40" />
          <input
            type="text"
            placeholder="Поиск по ФИО ученика..."
            className="input input-bordered w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>

        {/* Date Group Filter */}
        <FilterTabs
          filters={[
            { key: "all", label: `Все даты (${orders.length})` },
            { key: "today", label: `Сегодня (${groupedOrders.today.length})` },
            {
              key: "tomorrow",
              label: `Завтра (${groupedOrders.tomorrow.length})`,
            },
            {
              key: "future",
              label: `Позже (${groupedOrders.future.length})`,
            },
          ]}
          activeFilter={dateGroupFilter}
          onFilterChange={setDateGroupFilter}
        />

        {/* Status Filter */}
        <FilterTabs
          filters={[
            { key: "all", label: `Все (${filteredOrders.length})` },
            {
              key: "pending",
              label: `Ожидают (${orders.filter((o, i) => !o.is_received && filteredOrders.includes(o)).length})`,
            },
            {
              key: "received",
              label: `Получены (${orders.filter((o) => o.is_received && filteredOrders.includes(o)).length})`,
            },
          ]}
          activeFilter={filter}
          onFilterChange={setFilter}
        />
      </div>

      {/* Orders Display based on view mode */}
      {viewMode === "list" ? (
        <>
          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-base-100 rounded-box">
              <Package className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
              <p className="text-base-content/60">
                {searchQuery
                  ? "Заказов не найдено"
                  : "Заказов нет"}
              </p>
              {searchQuery && (
                <button
                  className="btn btn-sm btn-ghost mt-2"
                  onClick={() => setSearchQuery("")}
                >
                  Сбросить поиск
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Group by date when not searching */}
              {!searchQuery && dateGroupFilter === "all" ? (
                <>
                  {groupedOrders.today.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <ChefHat className="h-5 w-5 text-error" />
                        Сегодня
                      </h3>
                      <div className="space-y-4">
                        {groupedOrders.today
                          .filter((order) => {
                            if (filter === "pending")
                              return !order.is_received;
                            if (filter === "received")
                              return order.is_received;
                            return true;
                          })
                          .map((order) => (
                            <OrderCard
                              key={order.id}
                              order={order}
                              showStudentId={true}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                  {groupedOrders.tomorrow.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-warning" />
                        Завтра
                      </h3>
                      <div className="space-y-4">
                        {groupedOrders.tomorrow
                          .filter((order) => {
                            if (filter === "pending")
                              return !order.is_received;
                            if (filter === "received")
                              return order.is_received;
                            return true;
                          })
                          .map((order) => (
                            <OrderCard
                              key={order.id}
                              order={order}
                              showStudentId={true}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                  {groupedOrders.future.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Package className="h-5 w-5 text-info" />
                        Позже
                      </h3>
                      <div className="space-y-4">
                        {groupedOrders.future
                          .filter((order) => {
                            if (filter === "pending")
                              return !order.is_received;
                            if (filter === "received")
                              return order.is_received;
                            return true;
                          })
                          .map((order) => (
                            <OrderCard
                              key={order.id}
                              order={order}
                              showStudentId={true}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      showStudentId={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <OrderCalendar orders={filteredOrders} userType="chef" />
      )}
    </div>
  );
};

export default ChefOrdersPage;
