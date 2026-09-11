import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api";
import useToast from "../hooks/useToast";
import { useDebounce } from "../hooks/useDebounce";
import { useAdmin } from "../context/AdminContext";
import Pagination from "../components/Pagination";

const SERVER_URL = "http://localhost:5000";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { toast, showToast } = useToast();
  const { admin } = useAdmin();

  // -----------------------------------------
  // Load products
  // -----------------------------------------
  const loadProducts = async (
    page = 1,
    searchValue = ""
  ) => {
    try {
      setLoading(true);

      const response = await api.get(
        "/api/products",
        {
          params: {
            page: page,
            limit: 8,
            search: searchValue,
          },
        }
      );

      setProducts(
        response.data.products || []
      );

      setTotal(
        response.data.total || 0
      );

      setTotalPages(
        response.data.total_pages || 1
      );
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "Failed to load products",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // Fetch when page or search changes
  // -----------------------------------------
  useEffect(() => {
    loadProducts(
      currentPage,
      debouncedSearch
    );
  }, [currentPage, debouncedSearch]);

  // -----------------------------------------
  // Reset to page 1 when search changes
  // -----------------------------------------
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // -----------------------------------------
  // Delete product
  // -----------------------------------------
  const handleDelete = async (product) => {
    if (!admin) {
      showToast(
        "Admin login required",
        "error"
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/api/products/${product.id}`
      );

      showToast(
        "Product deleted successfully"
      );

      loadProducts(
        currentPage,
        debouncedSearch
      );
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "Delete failed",
        "error"
      );
    }
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          className={`toast ${toast.type}`}
        >
          {toast.message}
        </div>
      )}

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">
            PREMIUM COLLECTION
          </p>

          <h1>
            Discover products you'll love.
          </h1>

          <p>
            Explore our latest collection
            with high-quality product images
            and details.
          </p>
        </div>

        {admin && (
          <Link
            className="btn primary"
            to="/add-product"
          >
            + Add Product
          </Link>
        )}
      </section>

      {/* Product Header */}
      <section className="shop-toolbar">
        <div>
          <p className="eyebrow">
            OUR PRODUCTS
          </p>

          <h2>
            Explore the collection
          </h2>

          {!loading && (
            <p className="shop-count">
              Showing {products.length} of{" "}
              {total}{" "}
              {total === 1
                ? "product"
                : "products"}
            </p>
          )}
        </div>

        {/* Search */}
        <div className="search-box">
          <span className="search-icon">
            ⌕
          </span>

          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() =>
                setSearch("")
              }
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </section>

      {/* Loading */}
      {loading ? (
        <div className="loading-area">
          <div className="loading-spinner" />

          <p className="status-text">
            Loading products...
          </p>
        </div>
      ) : products.length === 0 &&
        debouncedSearch ? (
        /* No Search Result */
        <div className="empty-state">
          <div className="empty-icon">
            ⌕
          </div>

          <h2>
            No matching products
          </h2>

          <p>
            We couldn't find a product
            matching "{debouncedSearch}".
          </p>

          <button
            type="button"
            className="btn secondary"
            onClick={() =>
              setSearch("")
            }
          >
            Clear Search
          </button>
        </div>
      ) : products.length === 0 ? (
        /* No Products */
        <div className="empty-state">
          <div className="empty-icon">
            ◇
          </div>

          <h2>
            No products yet
          </h2>

          {admin ? (
            <>
              <p>
                Start your collection by
                adding your first product.
              </p>

              <Link
                className="btn primary"
                to="/add-product"
              >
                + Add Product
              </Link>
            </>
          ) : (
            <p>
              No products are currently
              available.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Product Grid */}
          <div className="product-grid">
            {products.map(
              (product, index) => (
                <article
                  className="product-card"
                  key={product.id}
                  style={{
                    animationDelay: `${
                      index * 70
                    }ms`,
                  }}
                >
                  {/* Image */}
                  <Link
                    to={`/products/${product.id}`}
                    className="image-wrap"
                  >
                    {product.image_url ? (
                      <img
                        src={`${SERVER_URL}${product.image_url}`}
                        alt={product.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="no-image">
                        No image
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="product-card-body">
                    <div className="product-info">
                      <h3>
                        {product.name}
                      </h3>

                      <p className="description">
                        {product.description ||
                          "No description"}
                      </p>
                    </div>

                    <p className="price">
                      ₹
                      {Number(
                        product.price
                      ).toFixed(2)}
                    </p>

                    <div className="card-actions">
                      <Link
                        className="btn secondary"
                        to={`/products/${product.id}`}
                      >
                        View Product
                      </Link>

                      {admin && (
                        <>
                          <Link
                            className="btn secondary"
                            to={`/products/${product.id}/edit`}
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            className="btn danger"
                            onClick={() =>
                              handleDelete(
                                product
                              )
                            }
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              )
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={
              currentPage
            }
            totalPages={
              totalPages
            }
            onPageChange={
              setCurrentPage
            }
          />
        </>
      )}
    </>
  );
}

export default Home;