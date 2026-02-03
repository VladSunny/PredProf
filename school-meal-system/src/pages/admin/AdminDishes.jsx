import { useState, useEffect } from "react";
import api from "../../api/config";
import { Layout } from "../../components/Layout";

export function AdminDishes() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    is_breakfast: true,
    stock_quantity: "",
  });

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      const response = await api.get("/admin/dishes"); // Changed to match backend endpoint
      setDishes(response.data);
    } catch (error) {
      console.error("Ошибка загрузки блюд:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (dish = null) => {
    if (dish) {
      setEditingDish(dish);
      setFormData({
        name: dish.name,
        description: dish.description || "",
        price: dish.price.toString(),
        is_breakfast: dish.is_breakfast,
        stock_quantity: dish.stock_quantity.toString(),
      });
    } else {
      setEditingDish(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        is_breakfast: true,
        stock_quantity: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        is_breakfast: formData.is_breakfast,
        allergens: formData.allergens,
        stock_quantity: parseInt(formData.stock_quantity),
      };

      if (editingDish) {
        await api.patch(`/admin/dishes/${editingDish.id}`, data);
        alert("Блюдо обновлено!");
      } else {
        await api.post("/admin/dishes", data);
        alert("Блюдо создано!");
      }

      setShowModal(false);
      fetchDishes();
    } catch (error) {
      alert(error.response?.data?.detail || "Ошибка");
    }
  };

  const handleDelete = async (dishId) => {
    if (!confirm("Удалить это блюдо?")) return;

    try {
      await api.delete(`/admin/dishes/${dishId}`);
      fetchDishes();
      alert("Блюдо удалено!");
    } catch (error) {
      alert(error.response?.data?.detail || "Ошибка");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">🍽️ Управление меню</h1>
          <button className="btn btn-primary" onClick={() => openModal()}>
            + Добавить блюдо
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Тип</th>
                  <th>Цена</th>
                  <th>Остаток</th>
                  <th>Аллергены</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {dishes.map((dish) => (
                  <tr key={dish.id}>
                    <td className="font-mono">#{dish.id}</td>
                    <td>
                      <div className="font-semibold">{dish.name}</div>
                      <div className="text-sm text-base-content/50">
                        {dish.description}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${dish.is_breakfast ? "badge-warning" : "badge-info"}`}
                      >
                        {dish.is_breakfast ? "🌅 Завтрак" : "☀️ Обед"}
                      </span>
                    </td>
                    <td className="font-semibold">{dish.price} ₽</td>
                    <td>
                      <span
                        className={`badge ${dish.stock_quantity < 10 ? "badge-error" : "badge-success"}`}
                      >
                        {dish.stock_quantity}
                      </span>
                    </td>
                    <td className="max-w-xs truncate">
                      {dish.allergens || "—"}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openModal(dish)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-ghost btn-sm text-error"
                          onClick={() => handleDelete(dish.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальное окно */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {editingDish ? "Редактировать блюдо" : "Новое блюдо"}
            </h3>

            <div className="space-y-4 mt-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Название</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Описание</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="flex gap-4">
                <div className="form-control flex-1">
                  <label className="label">
                    <span className="label-text">Цена (₽)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>
                <div className="form-control flex-1">
                  <label className="label">
                    <span className="label-text">Остаток</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.stock_quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock_quantity: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Тип блюда</span>
                  <div className="join">
                    <button
                      className={`btn join-item btn-sm ${formData.is_breakfast ? "btn-active" : ""}`}
                      onClick={() =>
                        setFormData({ ...formData, is_breakfast: true })
                      }
                    >
                      🌅 Завтрак
                    </button>
                    <button
                      className={`btn join-item btn-sm ${!formData.is_breakfast ? "btn-active" : ""}`}
                      onClick={() =>
                        setFormData({ ...formData, is_breakfast: false })
                      }
                    >
                      ☀️ Обед
                    </button>
                  </div>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Аллергены</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="молоко, орехи, глютен..."
                  value={formData.allergens}
                  onChange={(e) =>
                    setFormData({ ...formData, allergens: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setShowModal(false)}>
                Отмена
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editingDish ? "Сохранить" : "Создать"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </Layout>
  );
}
