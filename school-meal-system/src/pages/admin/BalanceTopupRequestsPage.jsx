import { useState, useEffect } from "react";
import { adminApi } from "../../api/admin";
import toast from "react-hot-toast";
import StatCard from "../../components/common/StatCard";
import DataStatsGrid from "../../components/dashboard/DataStatsGrid";
import PageHeader from "../../components/common/PageHeader";
import { Clock, CheckCircle, XCircle, Wallet } from "lucide-react";

const BalanceTopupRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [processing, setProcessing] = useState(null);
  const [adminComment, setAdminComment] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const [allRequests, setAllRequests] = useState([]);

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    try {
      const data = await adminApi.getAllBalanceTopupRequests(null);
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

  useEffect(() => {
    if (filter === "all") {
      setRequests(allRequests);
    } else {
      setRequests(allRequests.filter((r) => r.status === filter));
    }
  }, [filter, allRequests]);

  const handleApprove = async (requestId) => {
    setProcessing(requestId);
    try {
      await adminApi.updateBalanceTopupRequestStatus(requestId, "approved", "");
      toast.success("Заявка одобрена! Баланс студента пополнен.");
      fetchAllRequests();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClick = (requestId) => {
    setSelectedRequestId(requestId);
    setAdminComment("");
    setShowCommentModal(true);
  };

  const handleReject = async () => {
    if (!selectedRequestId) return;

    setProcessing(selectedRequestId);
    try {
      await adminApi.updateBalanceTopupRequestStatus(
        selectedRequestId,
        "rejected",
        adminComment,
      );
      toast.success("Заявка отклонена");
      fetchAllRequests();
      setShowCommentModal(false);
      setSelectedRequestId(null);
      setAdminComment("");
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
  const totalAmount = allRequests
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.amount, 0);

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
        title="Заявки на пополнение баланса"
        subtitle="Рассмотрение и согласование заявок от студентов"
      />

      {/* Stats */}
      <DataStatsGrid
        layout="vertical"
        stats={[
          {
            title: "Всего заявок",
            value: requests.length,
            figure: <Wallet className="h-8 w-8" />,
            color: "primary",
          },
          {
            title: "На рассмотрении",
            value: pendingCount,
            figure: <Clock className="h-8 w-8" />,
            color: "warning",
          },
          {
            title: "Одобрено",
            value: approvedCount,
            figure: <CheckCircle className="h-8 w-8" />,
            color: "success",
          },
          {
            title: "Отклонено",
            value: rejectedCount,
            figure: <XCircle className="h-8 w-8" />,
            color: "error",
          },
          {
            title: "Пополнено всего",
            value: `${totalAmount.toFixed(0)} ₽`,
            figure: <Wallet className="h-8 w-8" />,
            color: "secondary",
          },
        ]}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          {
            key: "all",
            label: `Все (${requests.length})`,
            activeButtonClass: "btn-primary",
            inactiveButtonClass: "btn-outline",
          },
          {
            key: "pending",
            label: `На рассмотрении (${pendingCount})`,
            activeButtonClass: "btn-warning",
            inactiveButtonClass: "btn-outline btn-warning",
          },
          {
            key: "approved",
            label: `Одобренные (${approvedCount})`,
            activeButtonClass: "btn-success",
            inactiveButtonClass: "btn-outline btn-success",
          },
          {
            key: "rejected",
            label: `Отклоненные (${rejectedCount})`,
            activeButtonClass: "btn-error",
            inactiveButtonClass: "btn-outline btn-error",
          },
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
          <Wallet className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
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
                      <div className="text-4xl">💰</div>
                      <div>
                        <h3 className="font-bold text-lg">
                          {request.amount.toFixed(2)} ₽
                        </h3>
                        <p className="text-base-content/60">
                          Студент:{" "}
                          {request.student?.full_name ||
                            `ID: ${request.student_id}`}
                        </p>
                        <p className="text-sm text-base-content/60">
                          Создано:{" "}
                          {new Date(request.created_at).toLocaleString("ru-RU")}
                        </p>
                        {request.admin_comment && (
                          <p className="text-sm text-base-content/70 mt-1">
                            <strong>Комментарий:</strong>{" "}
                            {request.admin_comment}
                          </p>
                        )}
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
                            onClick={() => handleApprove(request.id)}
                            disabled={processing === request.id}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Одобрить
                          </button>
                          <button
                            className={`btn btn-error btn-sm ${
                              processing === request.id ? "loading" : ""
                            }`}
                            onClick={() => handleRejectClick(request.id)}
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

      {/* Comment Modal for Rejection */}
      {showCommentModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              Отклонение заявки на пополнение
            </h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Комментарий для студента (необязательно)
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="Укажите причину отклонения"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
              />
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowCommentModal(false);
                  setSelectedRequestId(null);
                  setAdminComment("");
                }}
              >
                Отмена
              </button>
              <button
                className={`btn btn-error ${
                  processing === selectedRequestId ? "loading" : ""
                }`}
                onClick={handleReject}
                disabled={processing === selectedRequestId}
              >
                <XCircle className="h-4 w-4" />
                Отклонить
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button
              onClick={() => {
                setShowCommentModal(false);
                setSelectedRequestId(null);
                setAdminComment("");
              }}
            >
              close
            </button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default BalanceTopupRequestsPage;
