import { useState, useEffect } from "react";
import { chefApi } from "../../api/chef";
import toast from "react-hot-toast";
import StatCard from "../../components/common/StatCard";
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
      <div>
        <h1 className="text-2xl font-bold">Контроль остатков</h1>
        <p className="text-base-content/60">Мониторинг остатков готовых блюд</p>
      </div>

      {/* Stats */}
      <div className="stats shadow w-full">
        <StatCard
          title="Всего блюд"
          value={dishes.length}
          figure={<Package className="h-8 w-8" />}
          color="primary"
        />
        <StatCard
          title="В наличии"
          value={normalStock}
          figure={<CheckCircle className="h-8 w-8" />}
          color="success"
        />
        <StatCard
          title="Мало"
          value={lowStock}
          figure={<AlertTriangle className="h-8 w-8" />}
          color="warning"
        />
        <StatCard
          title="Нет в наличии"
          value={outOfStock}
          figure={<Package className="h-8 w-8" />}
          color="error"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setFilter("all")}
        >
          Все
        </button>
        <button
          className={`btn btn-sm ${filter === "low" ? "btn-warning" : "btn-outline btn-warning"}`}
          onClick={() => setFilter("low")}
        >
          Мало ({lowStock})
        </button>
        <button
          className={`btn btn-sm ${filter === "out" ? "btn-error" : "btn-outline btn-error"}`}
          onClick={() => setFilter("out")}
        >
          Нет в наличии ({outOfStock})
        </button>
        <button
          className={`btn btn-sm ${filter === "breakfast" ? "btn-info" : "btn-outline btn-info"}`}
          onClick={() => setFilter("breakfast")}
        >
          🌅 Завтраки
        </button>
        <button
          className={`btn btn-sm ${filter === "lunch" ? "btn-secondary" : "btn-outline btn-secondary"}`}
          onClick={() => setFilter("lunch")}
        >
          🌞 Обеды
        </button>
      </div>

      {/* Dishes Table */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Тип</th>
                  <th>Цена</th>
                  <th>Остаток</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {filteredDishes.map((dish) => {
                  const status = getStockStatus(dish.stock_quantity);
                  return (
                    <tr key={dish.id}>
                      <td>{dish.id}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {dish.is_breakfast ? "🥐" : "🍝"}
                          </span>
                          <div>
                            <div className="font-bold">{dish.name}</div>
                            <div className="text-sm text-base-content/60">
                              {dish.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${dish.is_breakfast ? "badge-warning" : "badge-info"}`}
                        >
                          {dish.is_breakfast ? "Завтрак" : "Обед"}
                        </span>
                      </td>
                      <td className="font-semibold">{dish.price} ₽</td>
                      <td>
                        <span
                          className={`text-lg font-bold ${
                            dish.stock_quantity === 0
                              ? "text-error"
                              : dish.stock_quantity < 5
                                ? "text-warning"
                                : "text-success"
                          }`}
                        >
                          {dish.stock_quantity}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${status.color} gap-1`}>
                          {status.icon} {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

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
