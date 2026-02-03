import { useState } from "react";
import api from "../../api/config";
import { Layout } from "../../components/Layout";

export function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      let url = "/admin/reports/payments";
      const params = [];
      if (startDate) params.push(`start_date=${startDate}T00:00:00`);
      if (endDate) params.push(`end_date=${endDate}T23:59:59`);
      if (params.length > 0) url += "?" + params.join("&");

      const response = await api.get(url);
      setReport(response.data);
    } catch (error) {
      alert(error.response?.data?.detail || "Ошибка генерации отчета");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    let content = "ОТЧЕТ ПО ПИТАНИЮ И ЗАТРАТАМ\n";
    content += "=".repeat(50) + "\n\n";

    if (report.period.start_date || report.period.end_date) {
      content += `Период: ${report.period.start_date || "начало"} - ${report.period.end_date || "конец"}\n\n`;
    }

    content += "СТАТИСТИКА:\n";
    content += `-  Общая сумма: ${report.statistics.total_amount?.toFixed(2) || 0} ₽\n`;
    content += `-  Всего заказов: ${report.statistics.total_orders || 0}\n`;
    content += `-  Средний чек: ${report.statistics.average_order?.toFixed(2) || 0} ₽\n\n`;

    content += "ДЕТАЛИЗАЦИЯ ЗАКАЗОВ:\n";
    content += "-".repeat(50) + "\n";

    report.orders.forEach((order) => {
      content += `#${order.id} | ${order.dish_name} | ${order.price} ₽ | ${order.payment_type} | ${order.created_at}\n`;
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">📋 Отчеты</h1>

        {/* Фильтры */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Параметры отчета</h2>

            <div className="flex flex-wrap gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Дата начала</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Дата окончания</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="form-control justify-end">
                <button
                  className="btn btn-primary"
                  onClick={generateReport}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Сформировать"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Результаты */}
        {report && (
          <div className="space-y-4">
            {/* Статистика */}
            <div className="stats shadow w-full">
              <div className="stat">
                <div className="stat-title">Общая сумма</div>
                <div className="stat-value text-primary">
                  {report.statistics.total_amount?.toFixed(2) || 0} ₽
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Всего заказов</div>
                <div className="stat-value">
                  {report.statistics.total_orders || 0}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Средний чек</div>
                <div className="stat-value text-secondary">
                  {report.statistics.average_order?.toFixed(2) || 0} ₽
                </div>
              </div>
            </div>

            {/* Таблица заказов */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <h2 className="card-title">Детализация заказов</h2>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={downloadReport}
                  >
                    📥 Скачать отчет
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Блюдо</th>
                        <th>Цена</th>
                        <th>Тип оплаты</th>
                        <th>Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.orders.slice(0, 50).map((order) => (
                        <tr key={order.id}>
                          <td className="font-mono">#{order.id}</td>
                          <td>{order.dish_name}</td>
                          <td>{order.price} ₽</td>
                          <td>
                            <span className="badge badge-ghost">
                              {order.payment_type === "single"
                                ? "Разовый"
                                : "Абонемент"}
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
                    <p className="text-center text-base-content/50 mt-4">
                      Показано 50 из {report.orders.length} записей
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
