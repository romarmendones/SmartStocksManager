import React, { useState, useEffect } from "react";
import { supabase } from "../Back-end/supabaseClient";
import Sidebar from "../components/Sidebar";
import NotificationPanel from "../components/NotificationPanel";
import AddProductOverlay from "../components/AddProductOverlay";
import "../styles/InventoryScreen.css";

const InventoryScreen = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("");
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isPosOverlayVisible, setIsPosOverlayVisible] = useState(false); // POS modal state
  const [isEditOverlayVisible, setIsEditOverlayVisible] = useState(false);
  const [selectedProductData, setSelectedProductData] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // POS system state
  const [saleProducts, setSaleProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [receiptNumber, setReceiptNumber] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("inventory").select("*");
      if (error) throw error;
      setInventory(data);
    } catch (error) {
      console.error("Error fetching inventory:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchInventory();
  }, []);

  // Handle adding product to POS sale
  const handleAddToSale = async (productId, quantity) => {
    try {
      const { data: selectedProduct, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("id", parseInt(productId))
        .single();

      if (error || !selectedProduct) {
        alert("Product not found!");
        return;
      }

      if (selectedProduct.stock < quantity) {
        alert("Not enough stock available!");
        return;
      }

      const existingProduct = saleProducts.find(
        (item) => item.id === selectedProduct.id
      );

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        saleProducts.push({ ...selectedProduct, quantity });
      }

      setSaleProducts([...saleProducts]);
      setTotalAmount(
        saleProducts.reduce(
          (total, product) => total + product.price * product.quantity,
          0
        )
      );
    } catch (error) {
      console.error("Error adding product to sale:", error.message);
      alert("Failed to add product to sale.");
    }
  };

  // Update handleCompleteSale function in InventoryScreen.js
  const handleCompleteSale = async () => {
    if (saleProducts.length === 0) {
      alert("Please add products to the sale");
      return;
    }
  
    const receiptNum = `R-${Date.now().toString().slice(-6)}`;
    setReceiptNumber(receiptNum);
  
    try {
      for (const product of saleProducts) {
        const updatedStock = product.stock - product.quantity;
  
        // Validate stock
        if (updatedStock < 0) {
          alert(`Insufficient stock for product: ${product.product}`);
          return;
        }
  
        // Update inventory stock
        await supabase
          .from("inventory")
          .update({ stock: updatedStock })
          .eq("id", product.id);
  
        // Add notifications for low stock or out of stock
        if (updatedStock === 0) {
          await supabase.from("notifications").insert({
            type: "alert",
            message: `Out of Stock: ${product.product} is now out of stock.`,
          });
        } else if (updatedStock <= 5) {
          await supabase.from("notifications").insert({
            type: "alert",
            message: `Low Stock: ${product.product} has low stock. Remaining: ${updatedStock}.`,
          });
        }
      }
  
      // Log the sale
      const { error: salesError } = await supabase.from("sales").insert({
        price: totalAmount,
        created_at: new Date().toISOString(),
        product: saleProducts.map((p) => p.product).join(", "),
        quantity: saleProducts.reduce((total, p) => total + p.quantity, 0),
      });
  
      if (salesError) throw salesError;
  
      // Add notification for new sale
      await supabase.from("notifications").insert({
        type: "sales",
        message: `New Sale: Total revenue ₱${totalAmount.toFixed(2)}.`,
      });

    
  
      // Reset POS system
      setSaleProducts([]);
      setTotalAmount(0);
      alert("Sale completed successfully!");
      fetchInventory(); // Refresh inventory data
    } catch (error) {
      console.error("Error completing sale:", error.message);
      alert("Failed to complete sale.");
    }
  };
  
  
  
  
  const filteredData = inventory.filter((item) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!searchTerm && !filterBy) return true;

    if (filterBy) {
      const fieldValue = item[filterBy]?.toString().toLowerCase() || "";
      return fieldValue.includes(lowerSearchTerm);
    }

    return Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(lowerSearchTerm)
    );
  });

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const { error } = await supabase.from("inventory").delete().eq("id", id);
      if (error) throw error;
      fetchInventory();
    } catch (error) {
      console.error("Error deleting product:", error.message);
      alert("Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const openEditOverlay = (product) => {
    setSelectedProductData(product);
    setIsEditOverlayVisible(true);
  };

  return (
    <div className="inventory-container">
      <Sidebar />
      <main className="inventory-content">
        <div className="inventory-header">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="header-actions">
            <select
              className="filter-select"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <option value="">Filter: All</option>
              <option value="code">Code</option>
              <option value="product">Product</option>
              <option value="type">Type</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
            </select>
            <button
              className="add-product-button"
              onClick={() => setIsOverlayVisible(true)}
            >
              Add Product +
            </button>
            <button
              className="pos-button"
              onClick={() => setIsPosOverlayVisible(true)} // Open POS modal
            >
              POS System
            </button>
          </div>
        </div>

        {/* POS System */}
        {isPosOverlayVisible && (
          <div className="pos-overlay">
            <div className="pos-content">
              <h2>POS System</h2>
              <div className="pos-products">
                <select
                  className="product-select"
                  onChange={async (e) => {
                    const productId = parseInt(e.target.value);
                    const { data: product, error } = await supabase
                      .from("inventory")
                      .select("*")
                      .eq("id", productId)
                      .single();
                    if (error) {
                      console.error("Error fetching product:", error.message);
                      alert("Failed to fetch product");
                      return;
                    }
                    const quantity = 1; // Default quantity
                    handleAddToSale(product.id, quantity);
                  }}
                >
                  <option value="">Select Product</option>
                  {inventory.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.product}
                    </option>
                  ))}
                </select>
                <p>Total Amount: ₱{totalAmount.toFixed(2)}</p>
                <button onClick={handleCompleteSale}>Complete Sale</button>
              </div>

              {receiptNumber && (
                <div className="receipt">
                  <h3>Receipt #{receiptNumber}</h3>
                  <ul>
                    {saleProducts.map((product, index) => (
                      <li key={index}>
                        {product.product} (x{product.quantity}) - ₱
                        {(product.price * product.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <h4>Total: ₱{totalAmount.toFixed(2)}</h4>
                </div>
              )}
              <button onClick={() => setIsPosOverlayVisible(false)}>
                Close POS
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="inventory-table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
              {filteredData.map((item, index) => (
    <tr key={index}>
      <td>{item.code}</td>
      <td>{item.product}</td>
      <td>{item.type}</td>
      <td>₱{Number(item.price || 0).toFixed(2)}</td> {/* Ensure price is a number */}
      <td>{item.stock}</td>
      <td>
        <button
          className="action-button edit"
          onClick={() => openEditOverlay(item)} // Opens the edit overlay
        >
          ✏️
        </button>
        <button
          className="action-button delete"
          onClick={() => handleDelete(item.id)}
        >
          🗑️
        </button>
      </td>
    </tr>
  ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <NotificationPanel />

      {isOverlayVisible && (
        <AddProductOverlay
          onClose={() => setIsOverlayVisible(false)}
          onAdd={fetchInventory}
        />
      )}

      {isEditOverlayVisible && selectedProductData && (
        <AddProductOverlay
          isEditMode={true}
          selectedProductData={selectedProductData}
          onClose={() => setIsEditOverlayVisible(false)}
          onAdd={fetchInventory}
        />
      )}
    </div>
  );
};

export default InventoryScreen;
