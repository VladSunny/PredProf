import React from "react";
import { CheckCircle, Clock, Calendar } from "lucide-react";

const OrderCard = ({
  order,
  onReceiveClick,
  showStudentId = false,
  className = "",
}) => {
  const isReceived = order.is_received;

  return (
    <div
      className={`card bg-base-100 shadow ${
        !isReceived ? "border-l-4 border-warning" : "border-l-4 border-success"
      } ${className}`}
    >
      <div className="card-body">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{isReceived ? "✅" : "⏳"}</div>
            <div>
              <h3 className="font-bold">Заказ #{order.id}</h3>
              {showStudentId && (
                <p className="text-sm text-base-content/60">
                  Ученик ID: {order.student_id}
                </p>
              )}
              <p className="text-sm text-base-content/60">
                Блюдо: {order.dish?.name || `ID: ${order.dish_id}`}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {order.order_date
                    ? `Заказано на: ${new Date(order.order_date).toLocaleDateString("ru-RU")}`
                    : `Заказано на: ${new Date(order.created_at).toLocaleDateString("ru-RU")}`}
                </span>
              </div>
              <p className="text-sm text-base-content/60">
                Создано: {new Date(order.created_at).toLocaleString("ru-RU")}
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
                className={`badge ml-2 ${isReceived ? "badge-success" : "badge-warning"}`}
              >
                {isReceived ? "Получено" : "Ожидает"}
              </div>
            </div>

            {!isReceived && onReceiveClick && (
              <button
                className="btn btn-success btn-sm"
                onClick={() => onReceiveClick(order.id)}
              >
                <CheckCircle className="h-4 w-4" />
                Получить
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
