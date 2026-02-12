import React from "react";
import { Link } from "react-router-dom";

const DashboardQuickActions = ({ actions }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((action, index) => (
        <Link
          key={index}
          to={action.to}
          className="card bg-base-100 shadow hover:shadow-lg transition-shadow"
        >
          <div className="card-body items-center text-center">
            {action.icon && <div className="text-2xl">{action.icon}</div>}
            <h3 className="card-title text-sm sm:text-base">{action.title}</h3>
            <p className="text-base-content/60 text-xs sm:text-sm">
              {action.description}
            </p>
            {action.buttonText && (
              <div className="card-actions">
                <button className={`btn ${action.buttonStyle || "btn-primary"} btn-sm`}>
                  {action.buttonText}
                </button>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default DashboardQuickActions;