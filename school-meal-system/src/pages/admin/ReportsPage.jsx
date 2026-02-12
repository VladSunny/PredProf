import { useState, useEffect } from "react";
import { adminApi } from "../../api/admin";
import toast from "react-hot-toast";
import StatCard from "../../components/common/StatCard";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
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
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchStats();
      setLoading(false); // Set main loading to false after initial data is loaded
    };

    loadInitialData();
  }, []);

  const fetchStats = async () => {
    try {
      const [payment, attendance] = await Promise.all([
        adminApi.getPaymentStatistics(),
        adminApi.getAttendanceStatistics(),
      ]);
      console.log("Payment stats:", payment); // Debug log
      console.log("Attendance stats:", attendance); // Debug log
      setPaymentStats(payment);
      setAttendanceStats(attendance);
      setStatsError(null); // Clear any previous error
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStatsError(error.message || "Ошибка при загрузке статистики");
    } finally {
      setStatsLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const data = await adminApi.getPaymentReport(
        dateRange.startDate || null,
        dateRange.endDate || null,
      );
      // Sort orders by order_date (if available) or created_at timestamp (newer first)
      if (data.orders) {
        data.orders.sort((a, b) => {
          // Create date objects that represent the dates in local timezone to avoid timezone issues
          const dateA = a.order_date
            ? new Date(a.order_date)
            : new Date(a.created_at);
          const dateB = b.order_date
            ? new Date(b.order_date)
            : new Date(b.created_at);
          return dateB.getTime() - dateA.getTime();
        });
      }
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

    const headers = [
      "ID",
      "Ученик ID",
      "Блюдо",
      "Цена",
      "Тип оплаты",
      "Дата заказа",
      "Дата создания",
    ];
    const rows = report.orders.map((order) => [
      order.id,
      order.student_id,
      order.dish_name,
      order.price,
      order.payment_type === "subscription" ? "Абонемент" : "Разовый",
      order.order_date
        ? new Date(order.order_date).toLocaleDateString("ru-RU")
        : new Date(order.created_at).toLocaleDateString("ru-RU"),
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
      <PageHeader 
        title="Отчеты"
        subtitle="Формирование отчетов по питанию и затратам"
      />

      {/* Summary Stats */}
      {/* {statsLoading ? (
        <div className="flex justify-center items-center py-8">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : statsError ? (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Ошибка: {statsError}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Общий доход"
            value={`${paymentStats?.total_revenue?.toFixed(2) || paymentStats?.totalRevenue?.toFixed(2) || 0} ₽`}
            figure={<Wallet className="h-12 w-12" />}
            color="primary"
            className="bg-primary text-primary-content"
          />

          <StatCard
            title="Средний чек"
            value={`${paymentStats?.average_order_value?.toFixed(2) || paymentStats?.averageOrderValue?.toFixed(2) || 0} ₽`}
            figure={<TrendingUp className="h-12 w-12" />}
            color="secondary"
            className="bg-secondary text-secondary-content"
          />

          <StatCard
            title="Активных учеников"
            value={attendanceStats?.unique_users || attendanceStats?.uniqueUsers || 0}
            figure={<Users className="h-12 w-12" />}
            color="accent"
            className="bg-accent text-accent-content"
          />
        </div>
      )} */}
      {/* Debug info - remove in production */}
      {/* <div className="text-xs p-4 bg-gray-100 rounded">
        <div>Payment Stats: {JSON.stringify(paymentStats)}</div>
        <div>Attendance Stats: {JSON.stringify(attendanceStats)}</div>
      </div> */}

      {/* Report Generator */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">
            <FileText className="h-5 w-5" />
            Формирование отчета
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                <div className="stat-figure text-primary">
                  <Wallet className="h-8 w-8" />
                </div>
                <div className="stat-title">Общий доход</div>
                <div className="stat-value text-primary text-sm sm:text-base">
                  {`${report.statistics?.total_revenue?.toFixed(2) || 0} ₽`}
                </div>
              </div>
              <div className="stat">
                <div className="stat-figure text-secondary">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <div className="stat-title">Количество заказов</div>
                <div className="stat-value text-secondary text-sm sm:text-base">
                  {report.statistics?.orders_count || 0}
                </div>
              </div>
              <div className="stat">
                <div className="stat-figure text-accent">
                  <Users className="h-8 w-8" />
                </div>
                <div className="stat-title">Средний чек</div>
                <div className="stat-value text-accent text-sm sm:text-base">
                  {`${report.statistics?.average_order_value?.toFixed(2) || 0} ₽`}
                </div>
              </div>
            </div>

            <h2 className="card-title">Все заказы</h2>
            {/* Orders Table */}
            {report.orders && report.orders.length > 0 && (
              <DataTable 
                headers={["ID", "Ученик ID", "Блюдо", "Цена", "Тип оплаты", "Дата заказа", "Дата создания"]}
                rows={report.orders.slice(0, 50).map((order) => [
                  `#${order.id}`,
                  order.student_id,
                  order.dish_name,
                  `${order.price} ₽`,
                  <span
                    key={`payment-${order.id}`}
                    className={`badge ${
                      order.payment_type === "subscription"
                        ? "badge-secondary"
                        : "badge-primary"
                    }`}
                  >
                    {order.payment_type === "subscription"
                      ? "Абонемент"
                      : "Разовый"}
                  </span>,
                  order.order_date
                    ? new Date(order.order_date).toLocaleDateString("ru-RU")
                    : new Date(order.created_at).toLocaleDateString("ru-RU"),
                  new Date(order.created_at).toLocaleString("ru-RU")
                ])}
                emptyMessage="Нет данных за выбранный период"
                showEmptyRow={false}
              />
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
