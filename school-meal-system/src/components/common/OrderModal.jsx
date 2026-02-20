import { Croissant, Utensils } from "lucide-react";

const OrderModal = ({
  isOpen,
  onClose,
  dish,
  user,
  paymentType,
  setPaymentType,
  orderDate,
  setOrderDate,
  subscriptionWeeks,
  setSubscriptionWeeks,
  onOrder,
}) => {
  if (!isOpen || !dish) return null;

  const isBreakfast = dish.meal_types?.some((mt) => mt.name === "breakfast");

  const calculateBalanceAfter = () => {
    if (paymentType === "subscription") {
      return (user?.balance - dish.price * subscriptionWeeks).toFixed(2);
    }
    return (user?.balance - dish.price).toFixed(2);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box animate-scale-in">
        <h3 className="font-bold text-lg mb-4">Оформление заказа</h3>

        <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg transition-all duration-200 hover:bg-base-300">
          <div
            className={`${isBreakfast ? "text-warning" : "text-info"} transition-transform duration-200 hover:scale-110`}
          >
            {isBreakfast ? (
              <Croissant className="h-12 w-12" />
            ) : (
              <Utensils className="h-12 w-12" />
            )}
          </div>
          <div>
            <div className="font-semibold">{dish.name}</div>
            <div className="text-2xl font-bold text-primary">{dish.price} ₽</div>
            {(dish.allergens ||
              (dish.allergens_rel && dish.allergens_rel.length > 0)) && (
              <div className="text-sm text-error mt-1 flex items-center gap-1 flex-wrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Аллергены:</span>
                {dish.allergens_rel && dish.allergens_rel.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {dish.allergens_rel.map((allergen) => (
                      <span
                        key={allergen.id}
                        className="badge badge-error badge-sm"
                      >
                        {allergen.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span>{dish.allergens}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="form-control mt-4 flex flex-col">
          <label className="label">
            <span className="label-text">Тип оплаты</span>
          </label>
          <div className="flex gap-4">
            <label className="label cursor-pointer gap-2">
              <input
                type="radio"
                name="payment"
                className="radio radio-primary"
                checked={paymentType === "one-time"}
                onChange={() => setPaymentType("one-time")}
              />
              <span>Разовый платеж</span>
            </label>
            <label className="label cursor-pointer gap-2">
              <input
                type="radio"
                name="payment"
                className="radio radio-primary"
                checked={paymentType === "subscription"}
                onChange={() => setPaymentType("subscription")}
              />
              <span>Абонемент</span>
            </label>
          </div>
        </div>

        {paymentType === "subscription" && (
          <div className="form-control mt-4 flex flex-col">
            <label className="label">
              <span className="label-text">Количество недель</span>
            </label>
            <select
              className="select select-bordered"
              value={subscriptionWeeks}
              onChange={(e) => setSubscriptionWeeks(parseInt(e.target.value))}
            >
              {[1, 2, 3].map((week) => (
                <option key={week} value={week}>
                  {week} недел{week > 1 ? "и" : "я"}
                </option>
              ))}
            </select>
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                Выберите количество недель (до 3)
              </span>
            </label>
          </div>
        )}

        <div className="form-control mt-4 flex flex-col">
          <label className="label">
            <span className="label-text">Дата заказа</span>
          </label>
          <input
            type="date"
            className="input input-bordered"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Оставьте пустым, чтобы заказать на сегодня
            </span>
          </label>
        </div>

        <div className="mt-4 p-3 bg-info/10 rounded-lg">
          <p className="text-sm">
            <strong>Ваш баланс:</strong> {user?.balance?.toFixed(2)} ₽
          </p>
          <p className="text-sm">
            <strong>После оплаты:</strong> {calculateBalanceAfter()} ₽
          </p>
        </div>

        <div className="modal-action">
          <button
            className="btn btn-ghost transition-all duration-200 hover:scale-105"
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            className="btn btn-primary transition-all duration-200 hover:scale-105"
            onClick={onOrder}
          >
            Оплатить
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/50 animate-fade-in" onClick={onClose}></div>
    </div>
  );
};

export default OrderModal;
