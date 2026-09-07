import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api";
import useToast from "../hooks/useToast";
import { useAdmin } from "../context/AdminContext";

const SERVER_URL = "http://localhost:5000";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const { toast, showToast } = useToast();
  const { admin } = useAdmin();

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/products");

      setProducts(response.data.products || []);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to load products",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return products;
    }

    return products.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const description =
        product.description?.toLowerCase() || "";

      return (
        name.includes(keyword) ||
        description.includes(keyword)
      );
    });
  }, [products, search]);

  const handleDelete = async (product) => {
    if (!admin) {
      showToast("Admin login required", "error");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/products/${product.id}`);

      showToast("Product deleted successfully");

      loadProducts();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Delete failed",
        "error"
      );
    }
  };

  return (
    <>
      {toast && (
        <div className={`toast ${toast.type}`}>
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
            Explore our latest collection with
            high-quality product images and details.
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

      {/* Product Section Header */}
      {!loading && products.length > 0 && (
        <section className="shop-toolbar">
          <div>
            <p className="eyebrow">
              OUR PRODUCTS
            </p>

            <h2>Explore the collection</h2>

            <p className="shop-count">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "product"
                : "products"}{" "}
              available
            </p>
          </div>

          <div className="search-box">
            <span className="search-icon">
              ⌕
            </span>

            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </section>
      )}

      {/* Loading */}
      {loading ? (
        <div className="loading-area">
          <div className="loading-spinner" />

          <p className="status-text">
            Loading products...
          </p>
        </div>
      ) : products.length === 0 ? (
        /* Empty Products */
        <div className="empty-state">
          <div className="empty-icon">
            ◇
          </div>

          <h2>No products yet</h2>

          {admin ? (
            <>
              <p>
                Start your collection by adding
                your first product.
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
              No products are currently available.
            </p>
          )}
        </div>
      ) : filteredProducts.length === 0 ? (
        /* No Search Result */
        <div className="empty-state">
          <div className="empty-icon">
            ⌕
          </div>

          <h2>No matching products</h2>

          <p>
            We couldn't find a product matching
            "{search}".
          </p>

          <button
            type="button"
            className="btn secondary"
            onClick={() => setSearch("")}
          >
            Clear Search
          </button>
        </div>
      ) : (
        /* Product Grid */
        <div className="product-grid">
          {filteredProducts.map(
            (product, index) => (
              <article
                className="product-card"
                key={product.id}
                style={{
                  animationDelay: `${index * 70}ms`,
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
                    <h3>{product.name}</h3>

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
                            handleDelete(product)
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
      )}
    </>
  );
}

export default Home;