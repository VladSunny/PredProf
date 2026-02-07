import React from 'react';
import { ShoppingCart, MessageSquare } from 'lucide-react';

const DishCard = ({ 
  dish, 
  onOrderClick, 
  onReviewClick, 
  balance = 0,
  className = '' 
}) => {
  const isAvailable = dish.stock_quantity > 0;
  const canAfford = dish.price <= balance;
  
  return (
    <div className={`card bg-base-100 shadow-lg ${className}`}>
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="text-4xl">
            {dish.is_breakfast ? "🥐" : "🍝"}
          </div>
          <div
            className={`badge ${dish.is_breakfast ? "badge-warning" : "badge-info"} text-xs`}
          >
            {dish.is_breakfast ? "Завтрак" : "Обед"}
          </div>
        </div>
        <h3 className="card-title text-sm sm:text-base">{dish.name}</h3>
        <p className="text-base-content/60 text-xs sm:text-sm">
          {dish.description || "Вкусное блюдо"}
        </p>
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
            className="btn btn-ghost btn-sm"
            onClick={() => onReviewClick && onReviewClick(dish)}
          >
            <MessageSquare className="h-4 w-4" />
            Отзывы
          </button>
          <button
            className="btn btn-primary btn-sm"
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