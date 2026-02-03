import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log(formData);

    try {
      await register(formData);
      navigate("/login", {
        state: { message: "Регистрация успешна! Войдите в систему." },
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Ошибка регистрации");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl">📝 Регистрация</h2>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Полное имя</span>
              </label>
              <input
                type="text"
                name="full_name"
                placeholder="Иванов Иван"
                className="input input-bordered"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Имя пользователя</span>
              </label>
              <input
                type="text"
                name="username"
                placeholder="username"
                className="input input-bordered"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                className="input input-bordered"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Пароль</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="input input-bordered"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Роль</span>
              </label>
              <select
                name="role"
                className="select select-bordered"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Ученик</option>
                <option value="chef">Повар</option>
                <option value="admin">Администратор</option>
              </select>
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full`}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Зарегистрироваться"
              )}
            </button>
          </form>

          <div className="divider">ИЛИ</div>

          <p className="text-center">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="link link-primary">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
