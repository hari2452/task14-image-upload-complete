import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import useToast from "../hooks/useToast";

const SERVER_URL = "http://localhost:5000";


function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const { toast, showToast } = useToast();

  const shownImage = useMemo(() => {
    if (previewUrl) return previewUrl;

    if (currentImageUrl) {
      return `${SERVER_URL}${currentImageUrl}`;
    }

    return "";
  }, [previewUrl, currentImageUrl]);

  useEffect(() => {
    if (!isEdit) return;

    const loadProduct = async () => {
      try {
        const response = await api.get(`/api/products/${id}`);
        const product = response.data.product;

        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price ?? "",
        });

        setCurrentImageUrl(product.image_url || "");
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
  }, [id, isEdit]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      showToast(
        "Only PNG, JPG, JPEG and WEBP images are allowed",
        "error"
      );
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be 2 MB or less", "error");
      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadSelectedImage = async () => {
    if (!selectedFile) {
      return currentImageUrl;
    }

    const imageData = new FormData();
    imageData.append("image", selectedFile);

    const response = await api.post(
      "/api/upload",
      imageData
    );

    return response.data.image_url;
  };

  const deletePhysicalImage = async (imageUrl) => {
    if (!imageUrl) return;

    try {
      await api.post("/api/delete-image", {
        image_url: imageUrl,
      });
    } catch (error) {
      console.error("Old image could not be deleted:", error);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImageUrl && !selectedFile) {
      showToast("No image to remove", "error");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove this image?"
    );

    if (!confirmed) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");

    if (isEdit && currentImageUrl) {
      try {
        await deletePhysicalImage(currentImageUrl);

        await api.put(`/api/products/${id}`, {
          ...formData,
          price: Number(formData.price),
          image_url: null,
        });

        setCurrentImageUrl("");
        showToast("Image removed successfully");
      } catch (error) {
        showToast(
          error.response?.data?.message || "Failed to remove image",
          "error"
        );
      }
    } else {
      setCurrentImageUrl("");
      showToast("Selected image removed");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      showToast("Product name is required", "error");
      return;
    }

    if (formData.price === "" || Number(formData.price) < 0) {
      showToast("Enter a valid price", "error");
      return;
    }

    if (!isEdit && !selectedFile) {
      showToast("Please select an image", "error");
      return;
    }

    try {
      setSaving(true);

      const oldImageUrl = currentImageUrl;
      const imageUrl = await uploadSelectedImage();

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        image_url: imageUrl || null,
      };

      if (isEdit) {
        await api.put(`/api/products/${id}`, payload);

        if (
          selectedFile &&
          oldImageUrl &&
          oldImageUrl !== imageUrl
        ) {
          await deletePhysicalImage(oldImageUrl);
        }

        showToast("Product updated successfully");
      } else {
        await api.post("/api/products", payload);
        showToast("Product added successfully");
      }

      setTimeout(() => {
        navigate("/");
      }, 900);

    } catch (error) {
      showToast(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Something went wrong",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="status-text">Loading product...</p>;
  }

  return (
    <>
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="form-shell">
        <div className="form-heading">
          <p className="eyebrow">
            {isEdit ? "Edit Mode" : "New Product"}
          </p>

          <h1>
            {isEdit ? "Update Product" : "Add Product"}
          </h1>

          <p>
            Choose a real image file. The preview appears immediately before
            the file is uploaded.
          </p>
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
          <label>
            Product Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Product description"
              rows="4"
            />
          </label>

          <label>
            Price
            <input
              type="number"
              min="0"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
            />
          </label>

          <label>
            Product Image
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={handleImageChange}
            />
          </label>

          <p className="helper-text">
            Allowed: PNG, JPG, JPEG, WEBP. Maximum size: 2 MB.
          </p>

          <div className="preview-box">
            {shownImage ? (
              <>
                <img
                  src={shownImage}
                  alt="Product preview"
                />

                <button
                  className="btn danger"
                  type="button"
                  onClick={handleRemoveImage}
                >
                  Remove Image
                </button>
              </>
            ) : (
              <div className="no-image large">
                No image selected
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              className="btn secondary"
              type="button"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>

            <button
              className="btn primary"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Product"
                  : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default ProductForm;
