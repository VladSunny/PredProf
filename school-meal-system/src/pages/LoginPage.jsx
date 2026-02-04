import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    role: "student",
    allergies: "",
    preferences: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await register(formData);
      } else {
        await login(formData.username, formData.password);
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl justify-center mb-4">
            🍽️ Школьная столовая
          </h2>

          <div className="tabs tabs-boxed mb-4">
            <button
              className={`tab flex-1 ${!isRegister ? "tab-active" : ""}`}
              onClick={() => setIsRegister(false)}
            >
              Вход
            </button>
            <button
              className={`tab flex-1 ${isRegister ? "tab-active" : ""}`}
              onClick={() => setIsRegister(true)}
            >
              Регистрация
            </button>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Имя пользователя</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input input-bordered"
                required
              />
            </div>

            {isRegister && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input input-bordered"
                  required
                />
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text">Пароль</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input input-bordered"
                required
                minLength={8}
              />
            </div>

            {isRegister && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Роль</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="select select-bordered"
                  >
                    <option value="student">Ученик</option>
                    <option value="chef">Повар</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>

                {formData.role === "student" && (
                  <>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Аллергии</span>
                      </label>
                      <input
                        type="text"
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleChange}
                        className="input input-bordered"
                        placeholder="Например: орехи, молоко"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Предпочтения</span>
                      </label>
                      <input
                        type="text"
                        name="preferences"
                        value={formData.preferences}
                        onChange={handleChange}
                        className="input input-bordered"
                        placeholder="Например: вегетарианец"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <button
              type="submit"
              className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading
                ? "Загрузка..."
                : isRegister
                  ? "Зарегистрироваться"
                  : "Войти"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
