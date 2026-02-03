import { useState, useEffect } from "react";
import api from "../../api/config";
import { Layout } from "../../components/Layout";

export function ChefDishes() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      const response = await api.get("/chef/dishes");
      setDishes(response.data);
    } catch (error) {
      console.error("Ошибка загрузки блюд:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: "Нет в наличии", class: "badge-error" };
    if (quantity < 10) return { label: "Мало", class: "badge-warning" };
    return { label: "В наличии", class: "badge-success" };
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">🍳 Контроль остатков</h1>

        {/* Краткая сводка */}
        <div className="stats shadow w-full">
          <div className="stat">
            <div className="stat-title">Всего блюд</div>
            <div className="stat-value">{dishes.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Нет в наличии</div>
            <div className="stat-value text-error">
              {dishes.filter((d) => d.stock_quantity === 0).length}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Мало остатков</div>
            <div className="stat-value text-warning">
              {
                dishes.filter(
                  (d) => d.stock_quantity > 0 && d.stock_quantity < 10,
                ).length
              }
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dishes.map((dish) => {
              const stockStatus = getStockStatus(dish.stock_quantity);
              return (
                <div key={dish.id} className="card bg-base-100 shadow-lg">
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <h2 className="card-title text-lg">{dish.name}</h2>
                      <span
                        className={`badge ${dish.is_breakfast ? "badge-warning" : "badge-info"}`}
                      >
                        {dish.is_breakfast ? "🌅" : "☀️"}
                      </span>
                    </div>

                    <p className="text-base-content/70 text-sm">
                      {dish.description}
                    </p>

                    <div className="flex justify-between items-center mt-4">
                      <div>
                        <p className="text-sm text-base-content/50">Остаток</p>
                        <p className="text-2xl font-bold">
                          {dish.stock_quantity}
                        </p>
                      </div>
                      <span className={`badge ${stockStatus.class}`}>
                        {stockStatus.label}
                      </span>
                    </div>

                    {dish.stock_quantity < 10 && (
                      <div className="mt-2">
                        <progress
                          className={`progress ${dish.stock_quantity === 0 ? "progress-error" : "progress-warning"} w-full`}
                          value={dish.stock_quantity}
                          max="20"
                        ></progress>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
