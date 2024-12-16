import React, { useState, useEffect } from 'react';
import { supabase } from '../Back-end/supabaseClient'; // Adjust path to your Supabase client
import '../styles/EditProductOverlay.css'; // Adjust path to your CSS

const EditProduct = ({ productId, onClose }) => {
  const [productData, setProductData] = useState({
    code: '',
    product: '',
    type: '',
    price: '',
    stock: '',
    image: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (productId) {
      const fetchProductData = async () => {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) {
          console.error('Error fetching product data:', error.message);
        } else {
          console.log('Fetched Product Data:', data); // Check the fetched data
          setProductData(data); // Set the fetched data into state
          setSelectedImage(data.image); // Set the initial image (URL or base64 string)
        }
      };

      fetchProductData();
    }
  }, [productId]); // Ensure the effect runs when productId changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result); // Set the selected image as a base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async () => {
    const { code, product, type, price, stock } = productData;
    if (productId && code && product && type && price && stock !== undefined) {
      const { error } = await supabase
        .from('products')
        .update({
          code: productData.code,
          product: productData.product,
          type: productData.type,
          price: productData.price,
          stock: productData.stock,
          image: selectedImage,
        })
        .eq('id', productId);

      if (error) {
        console.error('Error saving product:', error.message);
      } else {
        console.log('Product updated successfully');
        onClose();
      }
    } else {
      console.log('Please fill out all fields');
    }
  };

  if (!productData.code) {
    return <div>Loading...</div>;
  }

  return (
    <div className="edit-product-overlay">
      <div className="edit-product-content">
        <h2>Edit Product</h2>
        <div className="edit-product-form">
          <div className="edit-product-image-section">
            {selectedImage ? (
              <img src={selectedImage} alt="Product" className="edit-product-image" />
            ) : (
              <div className="edit-product-placeholder">No image selected</div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="image-input"
            />
            <p className="image-guideline">Recommended image size: 150x150px</p>
          </div>

          <div className="edit-product-form-section">
            <div className="form-group">
              <label htmlFor="code">Product Code</label>
              <input
                type="text"
                id="code"
                name="code"
                value={productData.code}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="product">Product Name</label>
              <input
                type="text"
                id="product"
                name="product"
                value={productData.product}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Product Type</label>
              <input
                type="text"
                id="type"
                name="type"
                value={productData.type}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={productData.price}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={productData.stock}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="form-buttons">
          <button onClick={handleSaveProduct} className="save-button">Save</button>
          <button onClick={onClose} className="close-button">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
