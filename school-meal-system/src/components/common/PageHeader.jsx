import React from "react";

const PageHeader = ({ title, subtitle, actions = null, className = "" }) => {
  return (
    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${className}`}>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-base-content/60">{subtitle}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
};

export default PageHeader;