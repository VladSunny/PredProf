import React from "react";

const StatCard = ({
  title,
  value,
  figure,
  color = "primary",
  className = "",
}) => {
  return (
    <div className={`stat bg-base-100 rounded-box shadow ${className}`}>
      <div className={`stat-figure text-${color}`}>{figure}</div>
      <div className="stat-title">{title}</div>
      <div className={`stat-value text-${color} text-sm sm:text-base`}>
        {value}
      </div>
    </div>
  );
};

export default StatCard;
