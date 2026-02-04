import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../api";

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    allergies: user?.allergies || "",
    preferences: user?.preferences || "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateProfile(formData);
      await refreshUser();
      setMessage({ type: "success", text: "Профиль успешно обновлен!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">👤 Мой профиль</h2>

          {message.text && (
            <div
              className={`alert ${message.type === "error" ? "alert-error" : "alert-success"} mb-4`}
            >
              <span>{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-sm opacity-70">Имя пользователя</span>
              <p className="font-medium">{user?.username}</p>
            </div>
            <div>
              <span className="text-sm opacity-70">Email</span>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <span className="text-sm opacity-70">Баланс</span>
              <p className="font-medium text-lg text-primary">
                {user?.balance?.toFixed(2)} ₽
              </p>
            </div>
            <div>
              <span className="text-sm opacity-70">Дата регистрации</span>
              <p className="font-medium">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("ru")
                  : "-"}
              </p>
            </div>
          </div>

          <div className="divider">Пищевые особенности</div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">🚫 Аллергии</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                placeholder="Укажите продукты, на которые у вас аллергия (например: орехи, молоко, глютен)"
                value={formData.allergies}
                onChange={(e) =>
                  setFormData({ ...formData, allergies: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">❤️ Предпочтения</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                placeholder="Укажите ваши пищевые предпочтения (например: вегетарианец, без свинины)"
                value={formData.preferences}
                onChange={(e) =>
                  setFormData({ ...formData, preferences: e.target.value })
                }
                rows={3}
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Сохранение..." : "Сохранить изменения"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
