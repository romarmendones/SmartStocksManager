import React, { useState, useEffect } from 'react';
import { supabase } from '../Back-end/supabaseClient';
import "../styles/AddProductOverlay.css";

const AddProductOverlay = ({ onClose, onAdd, isEditMode, selectedProductData }) => {
  const [code, setCode] = useState(isEditMode ? selectedProductData.code : "");
  const [product, setProduct] = useState(isEditMode ? selectedProductData.product : "");
  const [type, setType] = useState(isEditMode ? selectedProductData.type : "");
  const [price, setPrice] = useState(isEditMode ? selectedProductData.price : "");
  const [stock, setStock] = useState(isEditMode ? selectedProductData.stock : "");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isEditMode && selectedProductData) {
      setCode(selectedProductData.code);
      setProduct(selectedProductData.product);
      setType(selectedProductData.type);
      setPrice(selectedProductData.price);
      setStock(selectedProductData.stock);
    }
  }, [isEditMode, selectedProductData]);

  const handleSaveProduct = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!code || !product || !type || !price || !stock) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);

    if (isNaN(parsedPrice) || isNaN(parsedStock)) {
      setErrorMessage("Price and stock must be valid numbers.");
      return;
    }

    try {
      if (isEditMode) {
        const { data, error } = await supabase
          .from("inventory")
          .update({
            code,
            product,
            type,
            price: parsedPrice,
            stock: parsedStock,
          })
          .eq("id", selectedProductData.id);

        if (error) {
          throw new Error(error.message);
        }

        setSuccessMessage("Product updated successfully!");
      } else {
        const { data, error } = await supabase.from("inventory").insert([
          {
            code,
            product,
            type,
            price: parsedPrice,
            stock: parsedStock,
          },
        ]);

        if (error) {
          throw new Error(error.message);
        }

        setSuccessMessage("Product added successfully!");
      }

      setTimeout(() => {
        onAdd();
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error saving product:", error.message);
      setErrorMessage(`Failed to save product: ${error.message}`);
    }
  };

  return (
    <div className="add-product-overlay">
      <div className="add-product-content">
        <h2>{isEditMode ? "Edit Product" : "Add Product"}</h2>
        <div className="add-product-form">
          <div className="product-info-section">
            <input
              type="text"
              placeholder="Code"
              className="form-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <input
              type="text"
              placeholder="Product"
              className="form-input"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            />
            <input
              type="text"
              placeholder="Type"
              className="form-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
            <input
              type="text"
              placeholder="Price"
              className="form-input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Stock"
              className="form-input"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <div className="button-group">
          <button className="save-button" onClick={handleSaveProduct}>
            Save
          </button>
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductOverlay;
