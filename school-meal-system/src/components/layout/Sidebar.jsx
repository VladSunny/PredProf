import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Home,
  UtensilsCrossed,
  ShoppingCart,
  User,
  ChefHat,
  Package,
  ClipboardList,
  BarChart3,
  FileText,
  Settings,
} from "lucide-react";

const Sidebar = () => {
  const { user } = useAuth();

  const getMenuItems = () => {
    switch (user?.role) {
      case "student":
        return [
          { to: "/student", icon: Home, label: "Главная", end: true },
          { to: "/student/menu", icon: UtensilsCrossed, label: "Меню" },
          { to: "/student/orders", icon: ShoppingCart, label: "Мои заказы" },
          { to: "/student/profile", icon: User, label: "Профиль" },
        ];
      case "chef":
        return [
          { to: "/chef", icon: Home, label: "Главная", end: true },
          { to: "/chef/stock", icon: Package, label: "Остатки" },
          {
            to: "/chef/requests",
            icon: ClipboardList,
            label: "Заявки на закупку",
          },
        ];
      case "admin":
        return [
          { to: "/admin", icon: Home, label: "Главная", end: true },
          {
            to: "/admin/dishes",
            icon: UtensilsCrossed,
            label: "Управление меню",
          },
          {
            to: "/admin/requests",
            icon: ClipboardList,
            label: "Заявки на закупку",
          },
          { to: "/admin/reports", icon: FileText, label: "Отчеты" },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="drawer-side z-40">
      <label htmlFor="sidebar-drawer" className="drawer-overlay"></label>
      <aside className="bg-base-100 w-64 min-h-full shadow-lg">
        <div className="p-4 border-b border-base-200">
          <div className="flex items-center gap-2">
            {user?.role === "student" && (
              <User className="h-6 w-6 text-primary" />
            )}
            {user?.role === "chef" && (
              <ChefHat className="h-6 w-6 text-primary" />
            )}
            {user?.role === "admin" && (
              <Settings className="h-6 w-6 text-primary" />
            )}
            <span className="font-semibold text-lg">
              {user?.role === "student" && "Кабинет ученика"}
              {user?.role === "chef" && "Кабинет повара"}
              {user?.role === "admin" && "Панель администратора"}
            </span>
          </div>
        </div>
        <ul className="menu p-4 gap-1">
          {menuItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 ${isActive ? "active" : ""}`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        {user?.role === "student" && (
          <div className="p-4 border-t border-base-200 mt-auto">
            <div className="stats bg-primary text-primary-content w-full">
              <div className="stat">
                <div className="stat-title text-primary-content/70">Баланс</div>
                <div className="stat-value text-2xl">
                  {user?.balance?.toFixed(2)} ₽
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default Sidebar;
