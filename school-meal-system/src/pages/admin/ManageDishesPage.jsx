import { useState, useEffect } from "react";
import { adminApi } from "../../api/admin";
import { studentApi } from "../../api/student";
import { allergenApi } from "../../api/allergen";
import toast from "react-hot-toast";
import StatCard from "../../components/common/StatCard";
import DataStatsGrid from "../../components/dashboard/DataStatsGrid";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import { Plus, Edit2, Trash2, X, UtensilsCrossed } from "lucide-react";
import {
  CroissantIcon,
  PlateIcon,
  SunriseIcon,
  SunIcon,
} from "../../components/common/Icons";

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
    meal_type_ids: [],
    stock_quantity: "",
    allergens: "",
  });
  const [allergens, setAllergens] = useState([]);
  const [selectedAllergenIds, setSelectedAllergenIds] = useState([]);

  useEffect(() => {
    fetchDishes();
    fetchAllergens();
  }, []);

  const fetchAllergens = async () => {
    try {
      const data = await allergenApi.getAllergens();
      setAllergens(data);
    } catch (error) {
      console.error("Error fetching allergens:", error);
    }
  };

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
      meal_type_ids: [],
      stock_quantity: "",
      allergens: "",
    });
    setSelectedAllergenIds([]);
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
      meal_type_ids: dish.meal_types ? dish.meal_types.map((mt) => mt.id) : [],
      stock_quantity: dish.stock_quantity.toString(),
      allergens: dish.allergens || "",
    });
    // Set selected allergen IDs from dish.allergens_rel if available
    if (dish.allergens_rel && dish.allergens_rel.length > 0) {
      setSelectedAllergenIds(dish.allergens_rel.map((a) => a.id));
    } else {
      setSelectedAllergenIds([]);
    }
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
        meal_type_ids:
          formData.meal_type_ids.length > 0 ? formData.meal_type_ids : null,
        stock_quantity: parseInt(formData.stock_quantity),
        allergen_ids:
          selectedAllergenIds.length > 0 ? selectedAllergenIds : null,
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

  const toggleAllergen = (allergenId) => {
    setSelectedAllergenIds((prev) =>
      prev.includes(allergenId)
        ? prev.filter((id) => id !== allergenId)
        : [...prev, allergenId],
    );
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

  const isBreakfast = (dish) =>
    dish.meal_types?.some((mt) => mt.name === "breakfast");
  const isLunch = (dish) => dish.meal_types?.some((mt) => mt.name === "lunch");
  const breakfastDishes = dishes.filter(isBreakfast);
  const lunchDishes = dishes.filter(isLunch);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <PageHeader
        title="Управление меню"
        subtitle="Добавление и редактирование блюд"
        actions={
          <button
            className="btn btn-primary transition-all duration-200 hover:scale-105"
            onClick={openAddModal}
          >
            <Plus className="h-5 w-5" />
            Добавить блюдо
          </button>
        }
      />

      {/* Stats */}
      <DataStatsGrid
        layout="vertical"
        stats={[
          {
            title: "Всего блюд",
            value: dishes.length,
            figure: <UtensilsCrossed className="h-8 w-8" />,
            color: "primary",
          },
          {
            title: "Завтраков",
            value: breakfastDishes.length,
            figure: <UtensilsCrossed className="h-8 w-8" />,
            color: "warning",
          },
          {
            title: "Обедов",
            value: lunchDishes.length,
            figure: <UtensilsCrossed className="h-8 w-8" />,
            color: "info",
          },
        ]}
      />

      {/* Dishes Table */}
      <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="card-body">
          <DataTable
            headers={[
              "ID",
              "Название",
              "Тип",
              "Цена",
              "Аллергены",
              "Остаток",
              "Действия",
            ]}
            rows={dishes.map((dish) => [
              dish.id,
              <div className="flex items-center gap-2" key={`name-${dish.id}`}>
                <div
                  className={`${isBreakfast(dish) ? "text-warning" : "text-info"} transition-transform duration-200 hover:scale-110`}
                >
                  {isBreakfast(dish) ? (
                    <CroissantIcon className="h-6 w-6" />
                  ) : (
                    <PlateIcon className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <div className="font-bold">{dish.name}</div>
                  <div className="text-sm text-base-content/60">
                    {dish.description}
                  </div>
                </div>
              </div>,
              <span
                className={`badge ${isBreakfast(dish) ? "badge-warning" : "badge-info"}`}
                key={`type-${dish.id}`}
              >
                {isBreakfast(dish) && isLunch(dish)
                  ? "Завтрак + Обед"
                  : isBreakfast(dish)
                    ? "Завтрак"
                    : "Обед"}
              </span>,
              <span className="font-semibold" key={`price-${dish.id}`}>
                {dish.price} ₽
              </span>,
              dish.allergens_rel && dish.allergens_rel.length > 0 ? (
                <div
                  className="flex flex-wrap gap-1"
                  key={`allergen-${dish.id}`}
                >
                  {dish.allergens_rel.map((allergen) => (
                    <span
                      key={allergen.id}
                      className="badge badge-error badge-sm"
                    >
                      {allergen.name}
                    </span>
                  ))}
                </div>
              ) : dish.allergens ? (
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
                className={`badge ${
                  dish.stock_quantity === 0
                    ? "badge-error"
                    : dish.stock_quantity < 5
                      ? "badge-warning"
                      : "badge-success"
                }`}
                key={`stock-${dish.id}`}
              >
                {dish.stock_quantity}
              </span>,
              <div className="flex gap-2" key={`actions-${dish.id}`}>
                <button
                  className="btn btn-ghost btn-sm transition-all duration-200 hover:scale-110 hover:bg-base-200"
                  onClick={() => openEditModal(dish)}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  className="btn btn-ghost btn-sm text-error transition-all duration-200 hover:scale-110 hover:bg-error/10"
                  onClick={() => handleDelete(dish.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>,
            ])}
            emptyMessage="Блюд пока нет"
            showEmptyRow={false}
          />

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
          <div className="modal-box animate-scale-in">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 transition-all duration-200 hover:scale-110 hover:bg-base-200"
              onClick={() => setShowModal(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-lg">
              {editingDish ? "Редактировать блюдо" : "Добавить блюдо"}
            </h3>
            <div className="py-4 space-y-4">
              <div className="form-control flex flex-col">
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

              <div className="form-control flex flex-col">
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

              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text">Аллергены</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {allergens.map((allergen) => (
                    <button
                      key={allergen.id}
                      type="button"
                      className={`badge badge-lg cursor-pointer ${
                        selectedAllergenIds.includes(allergen.id)
                          ? "badge-error"
                          : "badge-outline"
                      }`}
                      onClick={() => toggleAllergen(allergen.id)}
                    >
                      {allergen.name}
                      {selectedAllergenIds.includes(allergen.id) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
                {selectedAllergenIds.length > 0 && (
                  <div className="text-sm text-base-content/60">
                    Выбрано: {selectedAllergenIds.length} аллерген(ов)
                  </div>
                )}
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
                  <label className="label cursor-pointer gap-2 transition-all duration-200 hover:scale-105">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-warning"
                      checked={formData.meal_type_ids.includes(1)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            meal_type_ids: [...formData.meal_type_ids, 1],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            meal_type_ids: formData.meal_type_ids.filter(
                              (id) => id !== 1,
                            ),
                          });
                        }
                      }}
                    />
                    <SunriseIcon className="h-5 w-5 text-warning" />
                    <span>Завтрак</span>
                  </label>
                  <label className="label cursor-pointer gap-2 transition-all duration-200 hover:scale-105">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-info"
                      checked={formData.meal_type_ids.includes(2)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            meal_type_ids: [...formData.meal_type_ids, 2],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            meal_type_ids: formData.meal_type_ids.filter(
                              (id) => id !== 2,
                            ),
                          });
                        }
                      }}
                    />
                    <SunIcon className="h-5 w-5 text-info" />
                    <span>Обед</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost transition-all duration-200 hover:scale-105"
                onClick={() => setShowModal(false)}
              >
                Отмена
              </button>
              <button
                className={`btn btn-primary transition-all duration-200 hover:scale-105 ${submitting ? "loading" : ""}`}
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
