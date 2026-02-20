const CreatePurchaseRequestModal = ({
  isOpen,
  onClose,
  onSubmit,
  dishes,
  newRequest,
  setNewRequest,
  submitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box animate-scale-in">
        <h3 className="font-bold text-lg mb-4">Новая заявка на закупку</h3>

        <div className="space-y-6">
          <div className="form-control">
            <div className="mb-2">
              <span className="text-base font-medium">Блюдо</span>
            </div>
            <select
              className="select select-bordered"
              value={newRequest.item_name}
              onChange={(e) =>
                setNewRequest({ ...newRequest, item_name: e.target.value })
              }
            >
              <option value="" disabled>
                Выберите блюдо
              </option>
              {dishes.map((dish) => (
                <option key={dish.id} value={dish.name}>
                  {dish.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <div className="mb-2">
              <span className="text-base font-medium">Количество</span>
            </div>
            <input
              type="text"
              className="input input-bordered"
              placeholder="3"
              value={newRequest.quantity}
              onChange={(e) =>
                setNewRequest({ ...newRequest, quantity: e.target.value })
              }
            />
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button
            className={`btn btn-primary ${submitting ? "loading" : ""}`}
            onClick={onSubmit}
            disabled={submitting}
          >
            Создать заявку
          </button>
        </div>
      </div>
      <div
        className="modal-backdrop bg-black/50 animate-fade-in"
        onClick={onClose}
      ></div>
    </div>
  );
};

export default CreatePurchaseRequestModal;
