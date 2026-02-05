import { useAuth } from "../../context/AuthContext";
import { Menu, LogOut, User } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();

  const getRoleLabel = (role) => {
    switch (role) {
      case "student":
        return "Ученик";
      case "chef":
        return "Повар";
      case "admin":
        return "Администратор";
      default:
        return role;
    }
  };

  return (
    <div className="navbar bg-primary text-primary-content shadow-lg">
      <div className="flex-none lg:hidden">
        <label htmlFor="sidebar-drawer" className="btn btn-square btn-ghost">
          <Menu className="h-6 w-6" />
        </label>
      </div>
      <div className="flex-1">
        <span className="text-xl font-bold">🍽️ Школьная столовая</span>
      </div>
      <div className="flex-none gap-2">
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="font-semibold">{user?.username}</span>
            <span className="text-xs opacity-80">{getRoleLabel(user?.role)}</span>
          </div>
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="bg-primary-content text-primary rounded-full w-10 flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow bg-base-100 text-base-content rounded-box w-52"
            >
              <li className="menu-title sm:hidden">
                <span>{user?.username}</span>
              </li>
              <li className="sm:hidden">
                <span className="text-xs opacity-60">
                  {getRoleLabel(user?.role)}
                </span>
              </li>
              <li>
                <button onClick={logout} className="text-error">
                  <LogOut className="h-4 w-4" />
                  Выйти
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
