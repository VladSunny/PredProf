import React from "react";

const FilterTabs = ({ filters, activeFilter, onFilterChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.key}
          className={`btn btn-sm ${
            activeFilter === filter.key
              ? filter.activeButtonClass || "btn-primary"
              : filter.inactiveButtonClass || "btn-outline"
          }`}
          onClick={() => onFilterChange(filter.key)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;