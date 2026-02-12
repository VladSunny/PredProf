import { useState, useEffect } from "react";
import { adminApi } from "../../api/admin";
import toast from "react-hot-toast";
import StatCard from "../../components/common/StatCard";
import DataStatsGrid from "../../components/dashboard/DataStatsGrid";
import PageHeader from "../../components/common/PageHeader";
import { Clock, CheckCircle, XCircle, ClipboardList } from "lucide-react";

const ManageRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [processing, setProcessing] = useState(null);

  const [allRequests, setAllRequests] = useState([]);

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    try {
      // Fetch all requests regardless of status
      const data = await adminApi.getAllPurchaseRequests(null);
      // Sort requests by created_at timestamp (newer first)
      const sortedData = data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setAllRequests(sortedData);
      setRequests(sortedData); // Initially show all requests
    } catch (error) {
      toast.error("Ошибка загрузки заявок");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply filter locally based on all requests
    if (filter === "all") {
      setRequests(allRequests);
    } else {
      setRequests(allRequests.filter((r) => r.status === filter));
    }
  }, [filter, allRequests]);

  const handleStatusUpdate = async (requestId, status) => {
    setProcessing(requestId);
    try {
      await adminApi.updatePurchaseRequestStatus(requestId, status);
      toast.success(
        status === "approved" ? "Заявка одобрена!" : "Заявка отклонена!",
      );
      fetchAllRequests();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessing(null);
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
      <PageHeader 
        title="Заявки на закупку"
        subtitle="Рассмотрение и согласование заявок от поваров"
      />

      {/* Stats */}
      <DataStatsGrid 
        layout="vertical"
        stats={[
          {
            title: "Всего заявок",
            value: requests.length,
            figure: <ClipboardList className="h-8 w-8" />,
            color: "primary"
          },
          {
            title: "На рассмотрении",
            value: pendingCount,
            figure: <Clock className="h-8 w-8" />,
            color: "warning"
          },
          {
            title: "Одобрено",
            value: approvedCount,
            figure: <CheckCircle className="h-8 w-8" />,
            color: "success"
          },
          {
            title: "Отклонено",
            value: rejectedCount,
            figure: <XCircle className="h-8 w-8" />,
            color: "error"
          }
        ]}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: `Все (${requests.length})`, activeButtonClass: "btn-primary", inactiveButtonClass: "btn-outline" },
          { key: "pending", label: `На рассмотрении (${pendingCount})`, activeButtonClass: "btn-warning", inactiveButtonClass: "btn-outline btn-warning" },
          { key: "approved", label: `Одобренные (${approvedCount})`, activeButtonClass: "btn-success", inactiveButtonClass: "btn-outline btn-success" },
          { key: "rejected", label: `Отклоненные (${rejectedCount})`, activeButtonClass: "btn-error", inactiveButtonClass: "btn-outline btn-error" },
        ].map((filterItem) => (
          <button
            key={filterItem.key}
            className={`btn btn-sm ${
              filter === filterItem.key
                ? filterItem.activeButtonClass
                : filterItem.inactiveButtonClass
            }`}
            onClick={() => setFilter(filterItem.key)}
          >
            {filterItem.label}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-box">
          <ClipboardList className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
          <p className="text-base-content/60">Заявок нет</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => {
            const status = getStatusBadge(request.status);
            const StatusIcon = status.icon;
            const isPending = request.status === "pending";

            return (
              <div
                key={request.id}
                className={`card bg-base-100 shadow ${
                  isPending ? "border-l-4 border-warning" : ""
                }`}
              >
                <div className="card-body">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">📦</div>
                      <div>
                        <h3 className="font-bold text-lg">
                          {request.item_name}
                        </h3>
                        <p className="text-base-content/60">
                          Количество: {request.quantity}
                        </p>
                        <p className="text-sm text-base-content/60">
                          Повар ID: {request.chef_id} | Создано:{" "}
                          {new Date(request.created_at).toLocaleString("ru-RU")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`badge ${status.color} gap-2 p-3`}>
                        <StatusIcon className="h-4 w-4" />
                        {status.label}
                      </div>

                      {isPending && (
                        <div className="flex gap-2">
                          <button
                            className={`btn btn-success btn-sm ${
                              processing === request.id ? "loading" : ""
                            }`}
                            onClick={() =>
                              handleStatusUpdate(request.id, "approved")
                            }
                            disabled={processing === request.id}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Одобрить
                          </button>
                          <button
                            className={`btn btn-error btn-sm ${
                              processing === request.id ? "loading" : ""
                            }`}
                            onClick={() =>
                              handleStatusUpdate(request.id, "rejected")
                            }
                            disabled={processing === request.id}
                          >
                            <XCircle className="h-4 w-4" />
                            Отклонить
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageRequestsPage;
