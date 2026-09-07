import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import useToast from "../hooks/useToast";

const SERVER_URL = "http://localhost:5000";

function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const { toast, showToast } = useToast();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await api.get(`/api/products/${id}`);

        setProduct(response.data.product);
      } catch (error) {
        showToast(
          error.response?.data?.message || "Failed to load product",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return <p className="status-text">Loading product...</p>;
  }

  if (!product) {
    return <p className="status-text">Product not found.</p>;
  }

  return (
    <>
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="detail-card">
        <div className="detail-image">
          {product.image_url ? (
            <img
              src={`${SERVER_URL}${product.image_url}`}
              alt={product.name}
            />
          ) : (
            <div className="no-image large">No image</div>
          )}
        </div>

        <div className="detail-content">
          <p className="eyebrow">Product #{product.id}</p>
          <h1>{product.name}</h1>

          <p className="detail-description">
            {product.description || "No description"}
          </p>

          <p className="detail-price">
            ₹{Number(product.price).toFixed(2)}
          </p>

          <div className="detail-actions">
            <Link className="btn secondary" to="/">
              Back
            </Link>

            <Link
              className="btn primary"
              to={`/products/${product.id}/edit`}
            >
              Edit Product
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetail;
