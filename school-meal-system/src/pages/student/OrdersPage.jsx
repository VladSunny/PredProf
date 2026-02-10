import { useState, useEffect } from "react";
import { studentApi } from "../../api/student";
import toast from "react-hot-toast";
import OrderCard from "../../components/common/OrderCard";
import FilterTabs from "../../components/common/FilterTabs";
import StatCard from "../../components/common/StatCard";
import OrderCalendar from "../../components/common/OrderCalendar";
import { CheckCircle, Clock, Package, Calendar, List } from "lucide-react";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await studentApi.getMyOrders();
      // Sort orders by order_date (if available) or created_at timestamp (newer first)
      const sortedData = data.sort((a, b) => {
        const dateA = a.order_date ? new Date(a.order_date) : new Date(a.created_at);
        const dateB = b.order_date ? new Date(b.order_date) : new Date(b.created_at);
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
            className={`join-item btn btn-sm ${viewMode === 'list' ? 'btn-active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-1" />
            Список
          </button>
          <button
            className={`join-item btn btn-sm ${viewMode === 'calendar' ? 'btn-active' : ''}`}
            onClick={() => setViewMode('calendar')}
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
      {viewMode === 'list' ? (
        <>
          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-base-100 rounded-box">
              <Package className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
              <p className="text-base-content/60">Заказов нет</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onReceiveClick={handleReceive}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <OrderCalendar orders={filteredOrders} userType="student" />
      )}
    </div>
  );
};

export default OrdersPage;
