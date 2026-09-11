import React from "react";

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = [];

  for (let page = 1; page <= totalPages; page++) {
    pages.push(page);
  }

  return (
    <div className="pagination-wrapper">
      <div className="pagination">
        <button
          type="button"
          className="pagination-btn"
          disabled={currentPage === 1}
          onClick={() =>
            onPageChange(currentPage - 1)
          }
        >
          Previous
        </button>

        {pages.map((page) => (
          <button
            type="button"
            key={page}
            className={
              currentPage === page
                ? "pagination-btn active"
                : "pagination-btn"
            }
            onClick={() =>
              onPageChange(page)
            }
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          className="pagination-btn"
          disabled={
            currentPage === totalPages
          }
          onClick={() =>
            onPageChange(currentPage + 1)
          }
        >
          Next
        </button>
      </div>

      <p className="pagination-info">
        Page {currentPage} of {totalPages}
      </p>
    </div>
  );
}

export default Pagination;