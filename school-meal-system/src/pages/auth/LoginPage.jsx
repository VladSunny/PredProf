import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogIn, Eye, EyeOff, Home } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      switch (result.role) {
        case "admin":
          navigate("/admin");
          break;
        case "chef":
          navigate("/chef");
          break;
        default:
          navigate("/student");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-200 shadow-xl">
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
            <h2 className="text-2xl font-bold">Школьная столовая</h2>
            <p className="text-base-content/60">Войдите в свой аккаунт</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control flex flex-col">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="Введите email"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Введите пароль"
                  className="input input-bordered pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Войти
                </>
              )}
            </button>
          </form>

          <div className="divider">или</div>

          <p className="text-center">
            Нет аккаунта?{" "}
            <Link to="/register" className="link link-primary font-semibold">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
