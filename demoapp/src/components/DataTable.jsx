import React, { useState } from 'react';
import './DataTable.css';

export const DataTable = ({ columns, data, onEdit, onDelete, itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="data-table-container">
      <table className="data-table" data-testid="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} data-testid={`table-header-${column.key}`}>
                {column.label}
              </th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} data-testid={`table-row-${rowIndex}`}>
                {columns.map((column) => (
                  <td key={column.key} data-testid={`table-cell-${column.key}-${rowIndex}`}>
                    {row[column.key]}
                  </td>
                ))}
                <td className="table-actions">
                  {onEdit && (
                    <button
                      className="btn-edit"
                      onClick={() => onEdit(row)}
                      data-testid={`btn-edit-${row.id || rowIndex}`}
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="btn-delete"
                      onClick={() => onDelete(row)}
                      data-testid={`btn-delete-${row.id || rowIndex}`}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="table-empty" data-testid="table-empty">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="table-pagination" data-testid="table-pagination">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            data-testid="pagination-prev"
          >
            Previous
          </button>
          <span className="pagination-info" data-testid="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            data-testid="pagination-next"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
