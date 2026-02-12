import { useState, useEffect } from "react";
import { chefApi } from "../../api/chef";
import toast from "react-hot-toast";
import StatCard from "../../components/common/StatCard";
import DataStatsGrid from "../../components/dashboard/DataStatsGrid";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import { Package, AlertTriangle, CheckCircle } from "lucide-react";

const StockPage = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      const data = await chefApi.getDishesWithStock();
      setDishes(data);
    } catch (error) {
      toast.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0)
      return { label: "Нет в наличии", color: "badge-error", icon: "❌" };
    if (quantity < 5)
      return { label: "Мало", color: "badge-warning", icon: "⚠️" };
    if (quantity < 20)
      return { label: "Нормально", color: "badge-info", icon: "✓" };
    return { label: "Много", color: "badge-success", icon: "" };
  };

  const filteredDishes = dishes.filter((dish) => {
    if (filter === "all") return true;
    if (filter === "low") return dish.stock_quantity < 5;
    if (filter === "out") return dish.stock_quantity === 0;
    if (filter === "breakfast") return dish.is_breakfast;
    if (filter === "lunch") return !dish.is_breakfast;
    return true;
  });

  const outOfStock = dishes.filter((d) => d.stock_quantity === 0).length;
  const lowStock = dishes.filter(
    (d) => d.stock_quantity > 0 && d.stock_quantity < 5,
  ).length;
  const normalStock = dishes.filter((d) => d.stock_quantity >= 5).length;

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
        title="Контроль остатков"
        subtitle="Мониторинг остатков готовых блюд"
      />

      {/* Stats */}
      <DataStatsGrid
        layout="vertical"
        stats={[
          {
            title: "Всего блюд",
            value: dishes.length,
            figure: <Package className="h-8 w-8" />,
            color: "primary",
          },
          {
            title: "В наличии",
            value: normalStock,
            figure: <CheckCircle className="h-8 w-8" />,
            color: "success",
          },
          {
            title: "Мало",
            value: lowStock,
            figure: <AlertTriangle className="h-8 w-8" />,
            color: "warning",
          },
          {
            title: "Нет в наличии",
            value: outOfStock,
            figure: <Package className="h-8 w-8" />,
            color: "error",
          },
        ]}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          {
            key: "all",
            label: "Все",
            activeButtonClass: "btn-primary",
            inactiveButtonClass: "btn-outline",
          },
          {
            key: "low",
            label: `Мало (${lowStock})`,
            activeButtonClass: "btn-warning",
            inactiveButtonClass: "btn-outline btn-warning",
          },
          {
            key: "out",
            label: `Нет в наличии (${outOfStock})`,
            activeButtonClass: "btn-error",
            inactiveButtonClass: "btn-outline btn-error",
          },
          {
            key: "breakfast",
            label: "🌅 Завтраки",
            activeButtonClass: "btn-info",
            inactiveButtonClass: "btn-outline btn-info",
          },
          {
            key: "lunch",
            label: "🌞 Обеды",
            activeButtonClass: "btn-secondary",
            inactiveButtonClass: "btn-outline btn-secondary",
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

      {/* Dishes Table */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <DataTable
            headers={[
              "ID",
              "Название",
              "Тип",
              "Цена",
              "Аллергены",
              "Остаток",
              "Статус",
            ]}
            rows={filteredDishes.map((dish) => {
              const status = getStockStatus(dish.stock_quantity);
              return [
                dish.id,
                <div
                  className="flex items-center gap-2"
                  key={`name-${dish.id}`}
                >
                  <span className="text-xl">
                    {dish.is_breakfast ? "🥐" : "🍝"}
                  </span>
                  <div>
                    <div className="font-bold">{dish.name}</div>
                    <div className="text-sm text-base-content/60">
                      {dish.description}
                    </div>
                  </div>
                </div>,
                <span
                  className={`badge ${dish.is_breakfast ? "badge-warning" : "badge-info"}`}
                  key={`type-${dish.id}`}
                >
                  {dish.is_breakfast ? "Завтрак" : "Обед"}
                </span>,
                <span className="font-semibold" key={`price-${dish.id}`}>
                  {dish.price} ₽
                </span>,
                dish.allergens ? (
                  <span
                    className="text-sm text-error"
                    key={`allergen-${dish.id}`}
                  >
                    {dish.allergens}
                  </span>
                ) : (
                  <span
                    className="text-sm text-base-content/40"
                    key={`allergen-${dish.id}`}
                  >
                    -
                  </span>
                ),
                <span
                  className={`text-lg font-bold ${
                    dish.stock_quantity === 0
                      ? "text-error"
                      : dish.stock_quantity < 5
                        ? "text-warning"
                        : "text-success"
                  }`}
                  key={`stock-${dish.id}`}
                >
                  {dish.stock_quantity}
                </span>,
                <span
                  className={`badge ${status.color} gap-1`}
                  key={`status-${dish.id}`}
                >
                  {status.icon} {status.label}
                </span>,
              ];
            })}
            emptyMessage="Блюд не найдено"
            showEmptyRow={false}
          />

          {filteredDishes.length === 0 && (
            <p className="text-center py-8 text-base-content/60">
              Блюд не найдено
            </p>
          )}
        </div>
      </div>

      {/* Alert for low stock */}
      {(outOfStock > 0 || lowStock > 0) && (
        <div className="alert alert-warning">
          <AlertTriangle className="h-6 w-6" />
          <div>
            <h3 className="font-bold">Рекомендуется пополнить запасы</h3>
            <p>
              {outOfStock > 0 && `${outOfStock} блюд нет в наличии. `}
              {lowStock > 0 && `${lowStock} блюд имеют низкий остаток.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPage;
