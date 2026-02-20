import React from "react";
import { useAuth } from "../../context/AuthContext";

const DashboardWelcomeSection = ({
  title,
  subtitle,
  icon,
  roleSpecificMessage = null,
}) => {
  const { user } = useAuth();

  return (
    <div className="bg-purple-700 text-white rounded-box p-6">
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 opacity-90">
            {subtitle}
            {roleSpecificMessage &&
              user?.role &&
              roleSpecificMessage[user?.role] && (
                <span> {roleSpecificMessage[user?.role]}</span>
              )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardWelcomeSection;
