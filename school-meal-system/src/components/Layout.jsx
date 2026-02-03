import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleLabel = (role) => {
    const roles = {
      student: "Ученик",
      chef: "Повар",
      admin: "Администратор",
    };
    return roles[role] || role;
  };

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case "student":
        return [
          { to: "/menu", label: "Меню" },
          { to: "/orders", label: "Мои заказы" },
          { to: "/profile", label: "Профиль" },
        ];
      case "chef":
        return [
          { to: "/chef/orders", label: "Заказы" },
          { to: "/chef/dishes", label: "Блюда" },
          { to: "/chef/requests", label: "Заявки на закупку" },
        ];
      case "admin":
        return [
          { to: "/admin/statistics", label: "Статистика" },
          { to: "/admin/requests", label: "Заявки" },
          { to: "/admin/dishes", label: "Управление меню" },
          { to: "/admin/reports", label: "Отчеты" },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-lg">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow bg-base-100 rounded-box w-52"
            >
              {getNavLinks().map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <Link to="/" className="btn btn-ghost text-xl">
            🍽️ Школьная столовая
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            {getNavLinks().map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="navbar-end">
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-semibold">{user.full_name}</span>
                <span className="badge badge-primary ml-2">
                  {getRoleLabel(user.role)}
                </span>
                {user.role === "student" && (
                  <span className="badge badge-success ml-2">
                    {user.balance?.toFixed(2) || 0} ₽
                  </span>
                )}
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Выйти
              </button>
            </div>
          )}
        </div>
      </div>
      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
}
