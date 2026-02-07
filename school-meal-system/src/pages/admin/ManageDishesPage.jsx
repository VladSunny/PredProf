import { useState, useEffect } from "react";
import { adminApi } from "../../api/admin";
import { studentApi } from "../../api/student";
import toast from "react-hot-toast";
import StatCard from "../../components/common/StatCard";
import { Plus, Edit2, Trash2, X, UtensilsCrossed } from "lucide-react";

const ManageDishesPage = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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
      const data = await studentApi.getMenu();
      setDishes(data);
    } catch (error) {
      toast.error("Ошибка загрузки меню");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      is_breakfast: true,
      stock_quantity: "",
    });
    setEditingDish(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (dish) => {
    setFormData({
      name: dish.name,
      description: dish.description || "",
      price: dish.price.toString(),
      is_breakfast: dish.is_breakfast,
      stock_quantity: dish.stock_quantity.toString(),
    });
    setEditingDish(dish);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.price || !formData.stock_quantity) {
      toast.error("Заполните обязательные поля");
      return;
    }

    setSubmitting(true);
    try {
      const dishData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        is_breakfast: formData.is_breakfast,
        stock_quantity: parseInt(formData.stock_quantity),
      };

      if (editingDish) {
        await adminApi.updateDish(editingDish.id, dishData);
        toast.success("Блюдо обновлено!");
      } else {
        await adminApi.createDish(dishData);
        toast.success("Блюдо добавлено!");
      }

      setShowModal(false);
      resetForm();
      fetchDishes();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (dishId) => {
    if (!confirm("Вы уверены, что хотите удалить это блюдо?")) return;

    try {
      await adminApi.deleteDish(dishId);
      toast.success("Блюдо удалено!");
      fetchDishes();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const breakfastDishes = dishes.filter((d) => d.is_breakfast);
  const lunchDishes = dishes.filter((d) => !d.is_breakfast);

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Управление меню</h1>
          <p className="text-base-content/60">
            Добавление и редактирование блюд
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus className="h-5 w-5" />
          Добавить блюдо
        </button>
      </div>

      {/* Stats */}
      <div className="stats shadow w-full">
        <StatCard
          title="Всего блюд"
          value={dishes.length}
          figure={<UtensilsCrossed className="h-8 w-8" />}
          color="primary"
        />
        <StatCard
          title="Завтраков"
          value={breakfastDishes.length}
          figure={<UtensilsCrossed className="h-8 w-8" />}
          color="warning"
        />
        <StatCard
          title="Обедов"
          value={lunchDishes.length}
          figure={<UtensilsCrossed className="h-8 w-8" />}
          color="info"
        />
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
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {dishes.map((dish) => (
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
                        className={`badge ${
                          dish.stock_quantity === 0
                            ? "badge-error"
                            : dish.stock_quantity < 5
                              ? "badge-warning"
                              : "badge-success"
                        }`}
                      >
                        {dish.stock_quantity}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEditModal(dish)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm text-error"
                          onClick={() => handleDelete(dish.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {dishes.length === 0 && (
            <div className="text-center py-12">
              <UtensilsCrossed className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
              <p className="text-base-content/60">Блюд пока нет</p>
              <button className="btn btn-primary mt-4" onClick={openAddModal}>
                Добавить первое блюдо
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowModal(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-lg">
              {editingDish ? "Редактировать блюдо" : "Добавить блюдо"}
            </h3>
            <div className="py-4 space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Название *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="Название блюда"
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
                  placeholder="Описание блюда"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Цена (₽) *</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Количество *</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    placeholder="0"
                    min="0"
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
                <label className="label">
                  <span className="label-text">Тип блюда</span>
                </label>
                <div className="flex gap-4">
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="meal-type"
                      className="radio radio-warning"
                      checked={formData.is_breakfast}
                      onChange={() =>
                        setFormData({ ...formData, is_breakfast: true })
                      }
                    />
                    <span>🌅 Завтрак</span>
                  </label>
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="meal-type"
                      className="radio radio-info"
                      checked={!formData.is_breakfast}
                      onChange={() =>
                        setFormData({ ...formData, is_breakfast: false })
                      }
                    />
                    <span>🌞 Обед</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Отмена
              </button>
              <button
                className={`btn btn-primary ${submitting ? "loading" : ""}`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {editingDish ? "Сохранить" : "Добавить"}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/50"
            onClick={() => setShowModal(false)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default ManageDishesPage;
