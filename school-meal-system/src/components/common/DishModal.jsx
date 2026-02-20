import { X } from "lucide-react";
import { SunriseIcon, SunIcon } from "./Icons";

const DishModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingDish,
  formData,
  setFormData,
  allergens,
  selectedAllergenIds,
  toggleAllergen,
  submitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box animate-scale-in">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 transition-all duration-200 hover:scale-110 hover:bg-base-200"
          onClick={onClose}
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            className={`btn btn-primary transition-all duration-200 hover:scale-105 ${submitting ? "loading" : ""}`}
            onClick={onSubmit}
            disabled={submitting}
          >
            {editingDish ? "Сохранить" : "Добавить"}
          </button>
        </div>
      </div>
      <div
        className="modal-backdrop bg-black/50"
        onClick={onClose}
      ></div>
    </div>
  );
};

export default DishModal;
