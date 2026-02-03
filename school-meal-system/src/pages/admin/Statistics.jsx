import { useState, useEffect } from "react";
import api from "../../api/config";
import { Layout } from "../../components/Layout";

export function Statistics() {
  const [paymentStats, setPaymentStats] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const [payments, attendance] = await Promise.all([
        api.get("/admin/statistics/payments"),
        api.get("/admin/statistics/attendance"),
      ]);
      setPaymentStats(payments.data);
      setAttendanceStats(attendance.data);
    } catch (error) {
      console.error("Ошибка загрузки статистики:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">📊 Статистика</h1>

        {/* Статистика оплат */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">💰 Оплаты</h2>
            <div className="stats stats-vertical lg:stats-horizontal shadow">
              <div className="stat">
                <div className="stat-title">Общая сумма</div>
                <div className="stat-value text-primary">
                  {paymentStats?.total_amount?.toFixed(2) || 0} ₽
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Всего заказов</div>
                <div className="stat-value">
                  {paymentStats?.total_orders || 0}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Средний чек</div>
                <div className="stat-value text-secondary">
                  {paymentStats?.average_order?.toFixed(2) || 0} ₽
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Статистика посещаемости */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">👥 Посещаемость</h2>
            <div className="stats stats-vertical lg:stats-horizontal shadow">
              <div className="stat">
                <div className="stat-title">Завтраки</div>
                <div className="stat-value text-warning">
                  {attendanceStats?.breakfast_count || 0}
                </div>
                <div className="stat-desc">выдано</div>
              </div>
              <div className="stat">
                <div className="stat-title">Обеды</div>
                <div className="stat-value text-info">
                  {attendanceStats?.lunch_count || 0}
                </div>
                <div className="stat-desc">выдано</div>
              </div>
              <div className="stat">
                <div className="stat-title">Уникальных учеников</div>
                <div className="stat-value">
                  {attendanceStats?.unique_students || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-primary text-primary-content">
            <div className="card-body">
              <h2 className="card-title">Сегодня</h2>
              <p>Активность столовой в реальном времени</p>
              <div className="card-actions justify-end">
                <button className="btn">Подробнее</button>
              </div>
            </div>
          </div>
          <div className="card bg-secondary text-secondary-content">
            <div className="card-body">
              <h2 className="card-title">За неделю</h2>
              <p>Тренды и динамика посещений</p>
              <div className="card-actions justify-end">
                <button className="btn">Подробнее</button>
              </div>
            </div>
          </div>
          <div className="card bg-accent text-accent-content">
            <div className="card-body">
              <h2 className="card-title">За месяц</h2>
              <p>Полный обзор работы столовой</p>
              <div className="card-actions justify-end">
                <button className="btn">Подробнее</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
