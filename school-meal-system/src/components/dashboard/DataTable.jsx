import React from "react";

const DataTable = ({
  headers,
  rows,
  emptyMessage = "Данных нет",
  tableClass = "table table-zebra",
  showEmptyRow = true,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className={tableClass}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))
          ) : showEmptyRow ? (
            <tr>
              <td
                colSpan={headers.length}
                className="text-center py-8 text-base-content/60"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
