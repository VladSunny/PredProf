import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserPlus, Eye, EyeOff } from "lucide-react";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    allergies: "",
    preferences: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (formData.password.length < 8) {
      setError("Пароль должен содержать минимум 8 символов");
      return;
    }

    setLoading(true);

    const result = await register({
      email: formData.email,
      username: formData.username,
      password: formData.password,
      role: "student",
      allergies: formData.allergies || null,
      preferences: formData.preferences || null,
    });

    if (result.success) {
      navigate("/login");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-r from-primary/10 via-base-100 to-secondary/10 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <h1 className="text-4xl mb-2">🍽️</h1>
            <h2 className="text-2xl font-bold">Регистрация</h2>
            <p className="text-base-content/60">Создайте аккаунт ученика</p>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control flex flex-col">
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

            <div className="form-control flex flex-col">
              <label className="label">
                <span className="label-text">Имя пользователя</span>
              </label>
              <input
                type="text"
                name="username"
                placeholder="Введите имя пользователя"
                className="input input-bordered"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control flex flex-col">
              <label className="label">
                <span className="label-text">Пароль</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Минимум 8 символов"
                  className="input input-bordered pr-10"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="form-control flex flex-col">
              <label className="label">
                <span className="label-text">Подтверждение пароля</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Повторите пароль"
                className="input input-bordered"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="collapse collapse-arrow bg-base-200">
              <input type="checkbox" />
              <div className="collapse-title font-medium">
                Дополнительная информация (необязательно)
              </div>
              <div className="collapse-content space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Пищевые аллергии</span>
                  </label>
                  <textarea
                    name="allergies"
                    placeholder="Укажите ваши аллергии"
                    className="textarea textarea-bordered"
                    value={formData.allergies}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Предпочтения в еде</span>
                  </label>
                  <textarea
                    name="preferences"
                    placeholder="Укажите ваши предпочтения"
                    className="textarea textarea-bordered"
                    value={formData.preferences}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Зарегистрироваться
                </>
              )}
            </button>
          </form>

          <div className="divider">или</div>

          <p className="text-center">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="link link-primary font-semibold">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
