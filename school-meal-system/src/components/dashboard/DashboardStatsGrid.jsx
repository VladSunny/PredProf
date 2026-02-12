import React from "react";
import StatCard from "../common/StatCard";

const DashboardStatsGrid = ({ stats, layout = "four-col" }) => {
  // Determine grid classes based on layout prop
  const gridClass = layout === "two-col" 
    ? "grid grid-cols-1 sm:grid-cols-2 gap-4" 
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4";

  return (
    <div className={gridClass}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          figure={stat.figure}
          color={stat.color}
        />
      ))}
    </div>
  );
};

export default DashboardStatsGrid;