import { useState, useEffect } from "react";
import api from "../../api/config";
import { Layout } from "../../components/Layout";

export function PurchaseRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    product_name: "",
    quantity: "",
    unit: "шт",
    notes: "",
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get("/chef/purchase-requests/my");
      setRequests(response.data);
    } catch (error) {
      console.error("Ошибка загрузки заявок:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post("/chef/purchase-requests", {
        item_name: newRequest.product_name,
        quantity: parseInt(newRequest.quantity),
        unit: newRequest.unit,
        notes: newRequest.notes,
      });
      setShowModal(false);
      setNewRequest({ product_name: "", quantity: "", unit: "шт", notes: "" });
      fetchRequests();
      alert("Заявка создана!");
    } catch (error) {
      alert(error.response?.data?.detail || "Ошибка создания заявки");
      console.log(error);
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { label: "На рассмотрении", class: "badge-warning" },
      approved: { label: "Одобрена", class: "badge-success" },
      rejected: { label: "Отклонена", class: "badge-error" },
    };
    return statuses[status] || { label: status, class: "badge-ghost" };
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">📦 Заявки на закупку</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Новая заявка
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-base-content/70">Заявок нет</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Продукт</th>
                  <th>Количество</th>
                  <th>Примечание</th>
                  <th>Статус</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const status = getStatusBadge(req.status);
                  return (
                    <tr key={req.id}>
                      <td className="font-mono">#{req.id}</td>
                      <td className="font-semibold">{req.product_name}</td>
                      <td>
                        {req.quantity} {req.unit}
                      </td>
                      <td className="text-base-content/70">
                        {req.notes || "—"}
                      </td>
                      <td>
                        <span className={`badge ${status.class}`}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        {new Date(req.created_at).toLocaleDateString("ru-RU")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальное окно создания заявки */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Новая заявка на закупку</h3>

            <div className="space-y-4 mt-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Название продукта</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="Например: Молоко"
                  value={newRequest.product_name}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      product_name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex gap-4">
                <div className="form-control flex-1">
                  <label className="label">
                    <span className="label-text">Количество</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    placeholder="10"
                    value={newRequest.quantity}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, quantity: e.target.value })
                    }
                  />
                </div>
                <div className="form-control w-32">
                  <label className="label">
                    <span className="label-text">Единица</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={newRequest.unit}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, unit: e.target.value })
                    }
                  >
                    <option value="шт">шт</option>
                    <option value="кг">кг</option>
                    <option value="л">л</option>
                    <option value="уп">уп</option>
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Примечание</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  placeholder="Дополнительная информация..."
                  value={newRequest.notes}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, notes: e.target.value })
                  }
                ></textarea>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setShowModal(false)}>
                Отмена
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                Создать
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
