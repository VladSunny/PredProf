import React from "react";
import StatCard from "../common/StatCard";

const DataStatsGrid = ({ stats, layout = "horizontal" }) => {
  // Determine grid classes based on layout prop
  const gridClass =
    layout === "vertical"
      ? "stats shadow w-full"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

  return (
    <div className={gridClass}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          figure={stat.figure}
          color={stat.color}
          className={stat.className}
        />
      ))}
    </div>
  );
};

export default DataStatsGrid;
