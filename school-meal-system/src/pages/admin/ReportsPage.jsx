import { useState, useEffect } from "react";
import { adminApi } from "../../api/admin";
import toast from "react-hot-toast";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

const ReportsPage = () => {
  const [paymentStats, setPaymentStats] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [payment, attendance] = await Promise.all([
        adminApi.getPaymentStatistics(),
        adminApi.getAttendanceStatistics(),
      ]);
      setPaymentStats(payment);
      setAttendanceStats(attendance);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const data = await adminApi.getPaymentReport(
        dateRange.startDate || null,
        dateRange.endDate || null,
      );
      setReport(data);
      toast.success("Отчет сформирован!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setGenerating(false);
    }
  };

  const exportToCSV = () => {
    if (!report || !report.orders) return;

    const headers = ["ID", "Ученик ID", "Блюдо", "Цена", "Тип оплаты", "Дата"];
    const rows = report.orders.map((order) => [
      order.id,
      order.student_id,
      order.dish_name,
      order.price,
      order.payment_type === "subscription" ? "Абонемент" : "Разовый",
      new Date(order.created_at).toLocaleString("ru-RU"),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute(
      "download",
      `report_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Отчет экспортирован!");
  };

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
        <h1 className="text-2xl font-bold">Отчеты</h1>
        <p className="text-base-content/60">
          Формирование отчетов по питанию и затратам
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card linear-to-r from-primary to-primary-focus text-primary-content">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <Wallet className="h-12 w-12 opacity-80" />
              <div>
                <p className="text-sm opacity-80">Общий доход</p>
                <p className="text-3xl font-bold">
                  {paymentStats?.total_revenue?.toFixed(2) || 0} ₽
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card linear-to-r from-secondary to-secondary-focus text-secondary-content">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-12 w-12 opacity-80" />
              <div>
                <p className="text-sm opacity-80">Средний чек</p>
                <p className="text-3xl font-bold">
                  {paymentStats?.average_order_value?.toFixed(2) || 0} ₽
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-linear-to-r from-accent to-accent-focus text-accent-content">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <Users className="h-12 w-12 opacity-80" />
              <div>
                <p className="text-sm opacity-80">Активных учеников</p>
                <p className="text-3xl font-bold">
                  {attendanceStats?.unique_users || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Generator */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">
            <FileText className="h-5 w-5" />
            Формирование отчета
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Начальная дата</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/60" />
                <input
                  type="date"
                  className="input input-bordered w-full pl-10"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Конечная дата</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/60" />
                <input
                  type="date"
                  className="input input-bordered w-full pl-10"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">&nbsp;</span>
              </label>
              <button
                className={`btn btn-primary ${generating ? "loading" : ""}`}
                onClick={generateReport}
                disabled={generating}
              >
                <FileText className="h-5 w-5" />
                Сформировать
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Results */}
      {report && (
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <h2 className="card-title">Результаты отчета</h2>
              <button className="btn btn-outline btn-sm" onClick={exportToCSV}>
                <Download className="h-4 w-4" />
                Экспорт CSV
              </button>
            </div>

            {/* Report Stats */}
            <div className="stats stats-vertical lg:stats-horizontal shadow my-4">
              <div className="stat">
                <div className="stat-title">Общий доход</div>
                <div className="stat-value text-primary">
                  {report.statistics?.total_revenue?.toFixed(2) || 0} ₽
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Количество заказов</div>
                <div className="stat-value text-secondary">
                  {report.statistics?.orders_count || 0}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Средний чек</div>
                <div className="stat-value text-accent">
                  {report.statistics?.average_order_value?.toFixed(2) || 0} ₽
                </div>
              </div>
            </div>

            {/* Orders Table */}
            {report.orders && report.orders.length > 0 && (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Ученик ID</th>
                      <th>Блюдо</th>
                      <th>Цена</th>
                      <th>Тип оплаты</th>
                      <th>Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.orders.slice(0, 50).map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.student_id}</td>
                        <td>{order.dish_name}</td>
                        <td>{order.price} ₽</td>
                        <td>
                          <span
                            className={`badge ${
                              order.payment_type === "subscription"
                                ? "badge-secondary"
                                : "badge-primary"
                            }`}
                          >
                            {order.payment_type === "subscription"
                              ? "Абонемент"
                              : "Разовый"}
                          </span>
                        </td>
                        <td>
                          {new Date(order.created_at).toLocaleString("ru-RU")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {report.orders.length > 50 && (
                  <p className="text-center text-base-content/60 mt-4">
                    Показано 50 из {report.orders.length} заказов. Экспортируйте
                    CSV для полного списка.
                  </p>
                )}
              </div>
            )}

            {(!report.orders || report.orders.length === 0) && (
              <p className="text-center py-8 text-base-content/60">
                Нет данных за выбранный период
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
