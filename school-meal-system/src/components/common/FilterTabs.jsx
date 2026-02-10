import React from "react";

const FilterTabs = ({
  filters,
  activeFilter,
  onFilterChange,
  className = "",
}) => {
  return (
    <div className={`tabs tabs-boxed bg-base-100 ${className}`}>
      {filters.map((filter) => (
        <button
          key={filter.key}
          className={`tab ${activeFilter === filter.key ? "tab-active" : ""}`}
          onClick={() => onFilterChange(filter.key)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
