import { useState, useEffect } from "react";
import { studentApi } from "../../api/student";
import toast from "react-hot-toast";
import { CheckCircle, Clock, Package } from "lucide-react";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await studentApi.getMyOrders();
      setOrders(data);
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
      <div>
        <h1 className="text-2xl font-bold">Мои заказы</h1>
        <p className="text-base-content/60">История ваших заказов</p>
      </div>

      {/* Stats */}
      <div className="stats shadow w-full">
        <div className="stat">
          <div className="stat-figure text-primary">
            <Package className="h-8 w-8" />
          </div>
          <div className="stat-title">Всего заказов</div>
          <div className="stat-value text-primary">{orders.length}</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-warning">
            <Clock className="h-8 w-8" />
          </div>
          <div className="stat-title">Ожидают получения</div>
          <div className="stat-value text-warning">{pendingCount}</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-success">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div className="stat-title">Получено</div>
          <div className="stat-value text-success">{receivedCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="tabs tabs-boxed bg-base-100 w-fit">
        <button
          className={`tab ${filter === "all" ? "tab-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Все ({orders.length})
        </button>
        <button
          className={`tab ${filter === "pending" ? "tab-active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Ожидают ({pendingCount})
        </button>
        <button
          className={`tab ${filter === "received" ? "tab-active" : ""}`}
          onClick={() => setFilter("received")}
        >
          Получены ({receivedCount})
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-box">
          <Package className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
          <p className="text-base-content/60">Заказов нет</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`card bg-base-100 shadow ${
                !order.is_received
                  ? "border-l-4 border-warning"
                  : "border-l-4 border-success"
              }`}
            >
              <div className="card-body">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">
                      {order.is_received ? "✅" : "⏳"}
                    </div>
                    <div>
                      <h3 className="font-bold">Заказ #{order.id}</h3>
                      <p className="text-sm text-base-content/60">
                        Блюдо: {order.dish?.name || `ID: ${order.dish_id}`}
                      </p>
                      <p className="text-sm text-base-content/60">
                        {new Date(order.created_at).toLocaleString("ru-RU")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div
                        className={`badge ${order.payment_type === "subscription" ? "badge-secondary" : "badge-primary"}`}
                      >
                        {order.payment_type === "subscription"
                          ? "Абонемент"
                          : "Разовый"}
                      </div>
                      <div
                        className={`badge ml-2 ${order.is_received ? "badge-success" : "badge-warning"}`}
                      >
                        {order.is_received ? "Получено" : "Ожидает"}
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
