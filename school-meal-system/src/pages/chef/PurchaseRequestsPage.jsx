import { useState, useEffect } from "react";
import { chefApi } from "../../api/chef";
import toast from "react-hot-toast";
import {
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  ClipboardList,
  X,
} from "lucide-react";

const PurchaseRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [newRequest, setNewRequest] = useState({ item_name: "", quantity: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const status = filter === "all" ? null : filter;
      const data = await chefApi.getMyPurchaseRequests(status);
      // Sort requests by created_at timestamp (newer first)
      const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRequests(sortedData);
    } catch (error) {
      toast.error("Ошибка загрузки заявок");
    } finally {
      setLoading(false);
    }
  };

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
      fetchRequests();
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

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

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
        <div className="stat">
          <div className="stat-figure text-primary">
            <ClipboardList className="h-8 w-8" />
          </div>
          <div className="stat-title">Всего заявок</div>
          <div className="stat-value text-primary">{requests.length}</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-warning">
            <Clock className="h-8 w-8" />
          </div>
          <div className="stat-title">На рассмотрении</div>
          <div className="stat-value text-warning">{pendingCount}</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-success">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div className="stat-title">Одобрено</div>
          <div className="stat-value text-success">{approvedCount}</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-error">
            <XCircle className="h-8 w-8" />
          </div>
          <div className="stat-title">Отклонено</div>
          <div className="stat-value text-error">{rejectedCount}</div>
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
          className={`tab ${filter === "pending" ? "tab-active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          На рассмотрении
        </button>
        <button
          className={`tab ${filter === "approved" ? "tab-active" : ""}`}
          onClick={() => setFilter("approved")}
        >
          Одобренные
        </button>
        <button
          className={`tab ${filter === "rejected" ? "tab-active" : ""}`}
          onClick={() => setFilter("rejected")}
        >
          Отклоненные
        </button>
      </div>

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
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowModal(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-lg">Новая заявка на закупку</h3>
            <div className="py-4 space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Название продукта</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="Например: Молоко 3.2%"
                  value={newRequest.item_name}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, item_name: e.target.value })
                  }
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Количество</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="Например: 50 литров"
                  value={newRequest.quantity}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, quantity: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Отмена
              </button>
              <button
                className={`btn btn-primary ${submitting ? "loading" : ""}`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                Создать заявку
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/50"
            onClick={() => setShowModal(false)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequestsPage;
