import React from "react";
import { useAuth } from "../../context/AuthContext";

const DashboardWelcomeSection = ({
  title,
  subtitle,
  icon,
  roleSpecificMessage = null,
}) => {
  const { user } = useAuth();

  // // Format the title and subtitle by replacing {user} with the actual user's name
  // const formattedTitle = title.replace("{user}", user?.full_name || "");
  // const formattedSubtitle = subtitle.replace("{user}", user?.full_name || "");

  return (
    <div className="bg-[#6B46C1] text-white rounded-box p-6">
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
