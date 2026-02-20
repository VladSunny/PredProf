import { XCircle } from "lucide-react";

const RejectRequestModal = ({
  isOpen,
  onClose,
  onSubmit,
  adminComment,
  setAdminComment,
  processing,
}) => {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          Отклонение заявки на пополнение
        </h3>
        <div className="form-control">
          <label className="label">
            <span className="label-text">
              Комментарий для студента (необязательно)
            </span>
          </label>
          <textarea
            className="textarea textarea-bordered h-24"
            placeholder="Укажите причину отклонения"
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
          />
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Отмена
          </button>
          <button
            className={`btn btn-error ${processing ? "loading" : ""}`}
            onClick={onSubmit}
            disabled={processing}
          >
            <XCircle className="h-4 w-4" />
            Отклонить
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default RejectRequestModal;
