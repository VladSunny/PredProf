import { useState, useEffect } from "react";
import { chefApi } from "../../api/chef";
import toast from "react-hot-toast";
import StatCard from "../../components/common/StatCard";
import FilterTabs from "../../components/common/FilterTabs";
import CreatePurchaseRequestModal from "../../components/common/CreatePurchaseRequestModal";
import {
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  ClipboardList,
} from "lucide-react";

const PurchaseRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [newRequest, setNewRequest] = useState({ item_name: "", quantity: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchAllRequests = async () => {
    try {
      const data = await chefApi.getMyPurchaseRequests(null);
      const sortedData = data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setAllRequests(sortedData);
      setRequests(sortedData);
    } catch (error) {
      toast.error("Ошибка загрузки заявок");
    } finally {
      setLoading(false);
    }
  };

  const fetchDishes = async () => {
    try {
      const data = await chefApi.getDishesWithStock();
      setDishes(data);
    } catch (error) {
      toast.error("Ошибка загрузки блюд");
    }
  };

  useEffect(() => {
    fetchAllRequests();
    fetchDishes();
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setRequests(allRequests);
    } else {
      setRequests(allRequests.filter((r) => r.status === filter));
    }
  }, [filter, allRequests]);

  const handleSubmit = async () => {
    if (!newRequest.item_name.trim() || !newRequest.quantity.trim()) {
      toast.error("Заполните все поля");
      return;
    }

    setSubmitting(true);
    try {
      await chefApi.createPurchaseRequest(
        newRequest.item_name,
        newRequest.quantity,
      );
      toast.success("Заявка создана!");
      setShowModal(false);
      setNewRequest({ item_name: "", quantity: "" });
      fetchAllRequests();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return {
          label: "На рассмотрении",
          color: "badge-warning",
          icon: Clock,
        };
      case "approved":
        return { label: "Одобрено", color: "badge-success", icon: CheckCircle };
      case "rejected":
        return { label: "Отклонено", color: "badge-error", icon: XCircle };
      default:
        return { label: status, color: "badge-ghost", icon: Clock };
    }
  };

  const pendingCount = allRequests.filter((r) => r.status === "pending").length;
  const approvedCount = allRequests.filter(
    (r) => r.status === "approved",
  ).length;
  const rejectedCount = allRequests.filter(
    (r) => r.status === "rejected",
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Заявки на закупку</h1>
          <p className="text-base-content/60">
            Управление заявками на закупку продуктов
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="h-5 w-5" />
          Новая заявка
        </button>
      </div>

      {/* Stats */}
      <div className="stats shadow w-full">
        <StatCard
          title="Всего заявок"
          value={requests.length}
          figure={<ClipboardList className="h-8 w-8" />}
          color="primary"
        />
        <StatCard
          title="На рассмотрении"
          value={pendingCount}
          figure={<Clock className="h-8 w-8" />}
          color="warning"
        />
        <StatCard
          title="Одобрено"
          value={approvedCount}
          figure={<CheckCircle className="h-8 w-8" />}
          color="success"
        />
        <StatCard
          title="Отклонено"
          value={rejectedCount}
          figure={<XCircle className="h-8 w-8" />}
          color="error"
        />
      </div>

      {/* Filters */}
      <FilterTabs
        filters={[
          { key: "all", label: `Все (${allRequests.length})` },
          { key: "pending", label: `На рассмотрении (${pendingCount})` },
          { key: "approved", label: `Одобренные (${approvedCount})` },
          { key: "rejected", label: `Отклоненные (${rejectedCount})` },
        ]}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-box">
          <ClipboardList className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
          <p className="text-base-content/60">Заявок нет</p>
          <button
            className="btn btn-primary mt-4"
            onClick={() => setShowModal(true)}
          >
            Создать первую заявку
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => {
            const status = getStatusBadge(request.status);
            const StatusIcon = status.icon;
            return (
              <div key={request.id} className="card bg-base-100 shadow">
                <div className="card-body">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">📦</div>
                      <div>
                        <h3 className="font-bold text-lg">
                          {request.item_name}
                        </h3>
                        <p className="text-base-content/60">
                          Количество: {request.quantity}
                        </p>
                        <p className="text-sm text-base-content/60">
                          Создано:{" "}
                          {new Date(request.created_at).toLocaleString("ru-RU")}
                        </p>
                      </div>
                    </div>
                    <div className={`badge ${status.color} gap-2 p-3`}>
                      <StatusIcon className="h-4 w-4" />
                      {status.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Request Modal */}
      <CreatePurchaseRequestModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        dishes={dishes}
        newRequest={newRequest}
        setNewRequest={setNewRequest}
        submitting={submitting}
      />
    </div>
  );
};

export default PurchaseRequestsPage;
