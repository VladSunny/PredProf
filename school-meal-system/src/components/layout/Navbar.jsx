import { useAuth } from "../../context/AuthContext";
import { Menu, LogOut, User } from "lucide-react";
import { RestaurantIcon } from "../common/Icons";

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
    <div className="navbar bg-primary text-primary-content shadow-lg transition-all duration-300">
      <div className="flex-none lg:hidden">
        <label htmlFor="sidebar-drawer" className="btn btn-square btn-ghost hover:bg-primary-focus transition-all duration-200">
          <Menu className="h-6 w-6" />
        </label>
      </div>
      <div className="flex-1 flex items-center gap-2">
        <RestaurantIcon className="h-6 w-6 transition-transform duration-300 hover:rotate-12" />
        <span className="text-xl font-bold">Школьная столовая</span>
      </div>
      <div className="flex-none gap-2">
        {/* Desktop view - show username and avatar */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="font-semibold">{user?.full_name}</span>
            <span className="text-xs opacity-80">
              {getRoleLabel(user?.role)}
            </span>
          </div>
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar transition-all duration-200 hover:scale-110"
            >
              <div className="bg-primary-content text-primary rounded-full w-10 flex items-center justify-center transition-all duration-200 hover:bg-primary-focus">
                <User className="h-6 w-6" />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow bg-base-100 text-base-content rounded-box w-52"
            >
              <li className="menu-title sm:hidden">
                <span>{user?.full_name}</span>
              </li>
              <li className="sm:hidden">
                <span className="text-xs opacity-60">
                  {getRoleLabel(user?.role)}
                </span>
              </li>
              <li>
                <button onClick={logout} className="text-error transition-all duration-200 hover:scale-105">
                  <LogOut className="h-4 w-4" />
                  Выйти
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile view - show only avatar */}
        <div className="sm:hidden flex items-center">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar transition-all duration-200 hover:scale-110"
            >
              <div className="bg-primary-content text-primary rounded-full w-10 flex items-center justify-center transition-all duration-200 hover:bg-primary-focus">
                <User className="h-6 w-6" />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow bg-base-100 text-base-content rounded-box w-52"
            >
              <li className="menu-title">
                <span>{user?.full_name}</span>
              </li>
              <li>
                <span className="text-xs opacity-60">
                  {getRoleLabel(user?.role)}
                </span>
              </li>
              <li>
                <button onClick={logout} className="text-error transition-all duration-200 hover:scale-105">
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
