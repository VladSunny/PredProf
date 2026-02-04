import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const roleNames = {
  student: "Ученик",
  chef: "Повар",
  admin: "Администратор",
};

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="navbar bg-primary text-primary-content">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          🍽️ Школьная столовая
        </Link>
      </div>
      <div className="flex-none gap-2">
        {user && (
          <>
            <div className="badge badge-secondary">{roleNames[user.role]}</div>
            {user.role === "student" && (
              <div className="badge badge-accent">
                Баланс: {user.balance?.toFixed(2)} ₽
              </div>
            )}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar placeholder"
              >
                <div className="bg-neutral text-neutral-content w-10 rounded-full">
                  <span>{user.username?.[0]?.toUpperCase()}</span>
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow text-base-content"
              >
                <li className="menu-title">{user.username}</li>
                {user.role === "student" && (
                  <li>
                    <Link to="/profile">Профиль</Link>
                  </li>
                )}
                <li>
                  <button onClick={handleLogout}>Выйти</button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
