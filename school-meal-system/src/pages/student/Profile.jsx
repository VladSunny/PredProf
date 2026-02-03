import { useState } from "react";
import api from "../../api/config";
import { useAuth } from "../../context/AuthContext";
import { Layout } from "../../components/Layout";

export function Profile() {
  const { user, updateUser } = useAuth();
  const [allergies, setAllergies] = useState(user?.allergies || "");
  const [preferences, setPreferences] = useState(user?.preferences || "");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const response = await api.patch("/me/profile", {
        allergies,
        preferences,
      });
      updateUser(response.data);
      alert("Профиль обновлен!");
    } catch (error) {
      alert(error.response?.data?.detail || "Ошибка обновления");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalance = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Введите корректную сумму");
      return;
    }

    setBalanceLoading(true);
    try {
      const response = await api.post("/me/balance", {
        amount: parseFloat(amount),
      });
      updateUser(response.data);
      setAmount("");
      alert("Баланс пополнен!");
    } catch (error) {
      alert(error.response?.data?.detail || "Ошибка пополнения");
    } finally {
      setBalanceLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Мой профиль</h1>

        {/* Информация о пользователе */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">👤 Информация</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-base-content/70">Имя</p>
                <p className="font-semibold">{user?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Email</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Логин</p>
                <p className="font-semibold">{user?.username}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Роль</p>
                <p className="font-semibold badge badge-primary">Ученик</p>
              </div>
            </div>
          </div>
        </div>

        {/* Баланс */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">💰 Баланс</h2>
            <div className="flex items-center gap-4">
              <p className="text-4xl font-bold text-success">
                {user?.balance?.toFixed(2) || 0} ₽
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <input
                type="number"
                placeholder="Сумма пополнения"
                className="input input-bordered flex-1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
              />
              <button
                className="btn btn-primary"
                onClick={handleAddBalance}
                disabled={balanceLoading}
              >
                {balanceLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Пополнить"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Аллергии и предпочтения */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">🍽️ Пищевые особенности</h2>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Аллергии</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                placeholder="Например: орехи, молоко, глютен..."
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              ></textarea>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Предпочтения</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                placeholder="Например: вегетарианец, без острого..."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
              ></textarea>
            </div>

            <button
              className="btn btn-primary mt-4"
              onClick={handleProfileUpdate}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Сохранить"
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
