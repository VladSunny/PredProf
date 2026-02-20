import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { allergenApi } from "../../api/allergen";
import { UserPlus, Eye, EyeOff, Home, X } from "lucide-react";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    parallel: "",
    password: "",
    confirmPassword: "",
    allergies: "",
    preferences: "",
  });
  const [allergens, setAllergens] = useState([]);
  const [selectedAllergenIds, setSelectedAllergenIds] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
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

  const toggleAllergen = (allergenId) => {
    setSelectedAllergenIds((prev) =>
      prev.includes(allergenId)
        ? prev.filter((id) => id !== allergenId)
        : [...prev, allergenId],
    );
  };

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
      full_name: formData.full_name,
      parallel: formData.parallel,
      password: formData.password,
      role: "student",
      allergen_ids: selectedAllergenIds.length > 0 ? selectedAllergenIds : null,
      preferences: formData.preferences || null,
    });

    if (result.success) {
      navigate("/login");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-purple-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <Link
              to="/"
              className="btn btn-ghost btn-sm gap-2 text-base-content/70"
            >
              <Home className="h-4 w-4" />
              На главную
            </Link>
          </div>
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
                <span className="label-text">ФИО</span>
              </label>
              <input
                type="text"
                name="full_name"
                placeholder="Введите ФИО (например, Иванов Иван Иванович)"
                className="input input-bordered"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control flex flex-col">
              <label className="label">
                <span className="label-text">Параллель</span>
              </label>
              <input
                type="text"
                name="parallel"
                placeholder="Введите параллель (например, 10Г)"
                className="input input-bordered"
                value={formData.parallel}
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
                  <p className="text-sm text-base-content/60 mb-2">
                    Выберите аллергены из списка
                  </p>
                  <div className="flex flex-wrap gap-2">
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
                    <div className="text-sm text-base-content/60 mt-2">
                      Выбрано: {selectedAllergenIds.length} аллерген(ов)
                    </div>
                  )}
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
