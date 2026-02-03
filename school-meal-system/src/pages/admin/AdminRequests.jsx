import { useState, useEffect } from "react";
import api from "../../api/config";
import { Layout } from "../../components/Layout";

export function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = "/admin/purchase-requests";
      if (filter !== "all") url += `?status=${filter}`;
      const response = await api.get(url);
      setRequests(response.data);
    } catch (error) {
      console.error("Ошибка загрузки заявок:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await api.patch(`/admin/purchase-requests/${requestId}`, {
        status: newStatus,
      });
      fetchRequests();
      alert(`Заявка ${newStatus === "approved" ? "одобрена" : "отклонена"}!`);
    } catch (error) {
      alert(error.response?.data?.detail || "Ошибка");
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { label: "На рассмотрении", class: "badge-warning" },
      approved: { label: "Одобрена", class: "badge-success" },
      rejected: { label: "Отклонена", class: "badge-error" },
    };
    return statuses[status] || { label: status, class: "badge-ghost" };
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">📦 Заявки на закупку</h1>
          <div className="join">
            <button
              className={`btn join-item ${filter === "pending" ? "btn-active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              На рассмотрении
            </button>
            <button
              className={`btn join-item ${filter === "approved" ? "btn-active" : ""}`}
              onClick={() => setFilter("approved")}
            >
              Одобрены
            </button>
            <button
              className={`btn join-item ${filter === "rejected" ? "btn-active" : ""}`}
              onClick={() => setFilter("rejected")}
            >
              Отклонены
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-base-content/70">Заявок нет</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Продукт</th>
                  <th>Количество</th>
                  <th>Примечание</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const status = getStatusBadge(req.status);
                  return (
                    <tr key={req.id}>
                      <td className="font-mono">#{req.id}</td>
                      <td className="font-semibold">{req.product_name}</td>
                      <td>
                        {req.quantity} {req.unit}
                      </td>
                      <td className="text-base-content/70 max-w-xs truncate">
                        {req.notes || "—"}
                      </td>
                      <td>
                        <span className={`badge ${status.class}`}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        {new Date(req.created_at).toLocaleDateString("ru-RU")}
                      </td>
                      <td>
                        {req.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() =>
                                handleStatusUpdate(req.id, "approved")
                              }
                            >
                              ✓
                            </button>
                            <button
                              className="btn btn-error btn-sm"
                              onClick={() =>
                                handleStatusUpdate(req.id, "rejected")
                              }
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
