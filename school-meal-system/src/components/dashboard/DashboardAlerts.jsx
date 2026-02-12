import React from "react";
import { Link } from "react-router-dom";

const DashboardAlerts = ({ alerts }) => {
  return (
    <>
      {alerts.map((alert, index) => (
        <div key={index} className={`alert alert-${alert.type} shadow-lg`}>
          {alert.icon && <div>{alert.icon}</div>}
          <div>
            <h3 className="font-bold">{alert.title}</h3>
            <p>{alert.message}</p>
          </div>
          {alert.link && (
            <Link to={alert.link.to} className="btn btn-sm">
              {alert.link.text}
            </Link>
          )}
        </div>
      ))}
    </>
  );
};

export default DashboardAlerts;
