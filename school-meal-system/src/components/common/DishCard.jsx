import React from "react";
import { ShoppingCart, MessageSquare } from "lucide-react";
import { CroissantIcon, PlateIcon } from "./Icons";

const DishCard = ({
  dish,
  onOrderClick,
  onReviewClick,
  balance = 0,
  className = "",
}) => {
  const isAvailable = dish.stock_quantity > 0;
  const canAfford = dish.price <= balance;

  return (
    <div className={`card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 ${className} animate-fade-in`}>
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className={`${dish.is_breakfast ? "text-warning" : "text-info"} transition-transform duration-300 hover:scale-110`}>
            {dish.is_breakfast ? <CroissantIcon className="h-10 w-10" /> : <PlateIcon className="h-10 w-10" />}
          </div>
          <div
            className={`badge ${dish.is_breakfast ? "badge-warning" : "badge-info"} text-xs transition-all duration-200`}
          >
            {dish.is_breakfast ? "Завтрак" : "Обед"}
          </div>
        </div>
        <h3 className="card-title text-sm sm:text-base">{dish.name}</h3>
        <p className="text-base-content/60 text-xs sm:text-sm">
          {dish.description || "Вкусное блюдо"}
        </p>
        {(dish.allergens || (dish.allergens_rel && dish.allergens_rel.length > 0)) && (
          <div className="mt-2">
            <div className="text-xs font-medium text-error flex items-center gap-1 flex-wrap">
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
                    <span key={allergen.id} className="badge badge-error badge-sm">
                      {allergen.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span>{dish.allergens}</span>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xl sm:text-2xl font-bold text-primary">
            {dish.price} ₽
          </span>
          <div
            className={`badge ${isAvailable ? "badge-success" : "badge-error"} gap-1 text-xs`}
          >
            {isAvailable
              ? `В наличии: ${dish.stock_quantity}`
              : "Нет в наличии"}
          </div>
        </div>
        <div className="card-actions justify-end mt-4 gap-2">
          <button
            className="btn btn-ghost btn-sm transition-all duration-200 hover:bg-base-200"
            onClick={() => onReviewClick && onReviewClick(dish)}
          >
            <MessageSquare className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            Отзывы
          </button>
          <button
            className="btn btn-primary btn-sm transition-all duration-200 hover:scale-105"
            disabled={!isAvailable || !canAfford}
            onClick={() => onOrderClick && onOrderClick(dish)}
          >
            <ShoppingCart className="h-4 w-4" />
            Заказать
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
