import { useEffect, useState } from "react";
import {
  fetchAllProducts,
  updateProducts,
  deleteProductFromDb,
  addProductsToDb,
} from "../fetch";
import { Card, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", image: "" });

  const submitAdd = async () => {
    try {
      await addProductsToDb(newProduct);
      const updated = await fetchAllProducts();
      setProducts(updated);
      setNewProduct({ name: "", price: "", image: "" });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetchAllProducts();
      setProducts(res);
    }
    fetchProducts();
  }, []);

  const submitEdit = async function () {
    try {
      await updateProducts(editProduct.id, editProduct);
      setProducts((prev) =>
        prev.map((p) => (p.id === editProduct.id ? { ...p, ...editProduct } : p))
      );
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const edit = async function (item) {
    setEditProduct(item);
    setShowEditModal(true);
  };

  const deleteProduct = async function (id) {
    try {
      await deleteProductFromDb(id);
      const response = await fetchAllProducts();
      setProducts(response);
    } catch {
      console.log("error in deleting product");
    }
  };

  return (
    <div className="container-fluid py-5" style={{ background: "#f5f5f7", minHeight: "100vh" }}>
      {/* Title */}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap">
        <h1 className="fw-semibold mb-3" style={{ fontFamily: "SF Pro Display, sans-serif", fontSize: "2rem", letterSpacing: "-0.5px" }}>
          Products
        </h1>

        {/* Add Product Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="btn shadow-sm mb-3"
          style={{
            background: "linear-gradient(135deg, #f5f5f7, #e0e0e5)",
            border: "1px solid #d1d1d6",
            borderRadius: "12px",
            padding: "10px 22px",
            fontFamily: "SF Pro Display, sans-serif",
            fontWeight: 500,
            fontSize: "15px",
            color: "#000",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #e8e8ec, #d7d7db)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #f5f5f7, #e0e0e5)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <i className="bi bi-plus-lg me-2"></i> Add Product
        </button>
      </div>

      {/* Product Cards */}
      <div className="row g-4">
        {products &&
          [...products].reverse().map((item) => (
            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12" key={item.id}>
              <Card
                className="h-100 border-0 shadow-sm rounded-4 product-card"
                style={{ transition: "all 0.3s ease", cursor: "pointer", background: "#fff" }}
              >
                {/* Image */}
                <div className="d-flex justify-content-center align-items-center bg-light" style={{ height: "230px", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }}>
                  <Card.Img
                    variant="top"
                    src={item.image}
                    style={{ maxHeight: "200px", width: "auto", objectFit: "contain" }}
                  />
                </div>

                {/* Body */}
                <Card.Body className="d-flex flex-column text-center px-3">
                  <Card.Title className="fw-semibold mb-2 text-truncate">{item.name}</Card.Title>
                  <Card.Text className="text-muted mb-4 fw-medium">₹{item.price}</Card.Text>

                  {/* Actions */}
                  <div className="mt-auto d-flex justify-content-center gap-2 flex-wrap">
                    <Button onClick={() => edit(item)} variant="outline-dark" size="sm" className="rounded-pill px-3">
                      Edit
                    </Button>
                    <Button onClick={() => deleteProduct(item.id)} variant="danger" size="sm" className="rounded-pill px-3">
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
      </div>

      {/* Modals (Edit & Add) */}
      {showEditModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content rounded-4 shadow-sm border-0">
              {/* Header */}
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-semibold w-100 text-center" style={{ fontFamily: "SF Pro Display, sans-serif", fontSize: "1.25rem", color: "#111" }}>
                  Edit Product
                </h5>
                <button type="button" className="btn-close position-absolute end-0 me-3 mt-2" onClick={() => setShowEditModal(false)}></button>
              </div>

              {/* Body */}
              <div className="modal-body px-4 py-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Product Name</label>
                    <input
                      type="text"
                      className="form-control rounded-4 shadow-sm border-light"
                      style={{ fontSize: "0.95rem", padding: "0.6rem 1rem" }}
                      value={editProduct.name}
                      onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Price (₹)</label>
                    <input
                      type="number"
                      className="form-control rounded-4 shadow-sm border-light"
                      style={{ fontSize: "0.95rem", padding: "0.6rem 1rem" }}
                      value={editProduct.price}
                      onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-muted">Image URL</label>
                    <input
                      type="text"
                      className="form-control rounded-4 shadow-sm border-light"
                      style={{ fontSize: "0.95rem", padding: "0.6rem 1rem" }}
                      value={editProduct.image}
                      onChange={(e) => setEditProduct({ ...editProduct, image: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer border-0 px-4 pb-4 pt-0">
                <Button variant="light" className="rounded-pill px-4 shadow-sm" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button variant="dark" className="rounded-pill px-4 shadow-sm" onClick={() => submitEdit()}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content rounded-4 shadow-sm border-0">
              {/* Header */}
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-semibold text-center w-100" style={{ fontFamily: "SF Pro Display, sans-serif", fontSize: "1.25rem", color: "#111" }}>
                  Add Product
                </h5>
                <button type="button" className="btn-close position-absolute end-0 me-3 mt-2" onClick={() => setShowAddModal(false)}></button>
              </div>

              {/* Body & Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitAdd();
                }}
              >
                <div className="modal-body px-4 py-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Product Name</label>
                      <input
                        required
                        type="text"
                        className="form-control rounded-4 shadow-sm border-light"
                        placeholder="Enter product name"
                        style={{ fontSize: "0.95rem", padding: "0.6rem 1rem" }}
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Price (₹)</label>
                      <input
                        required
                        type="number"
                        className="form-control rounded-4 shadow-sm border-light"
                        placeholder="Enter price"
                        style={{ fontSize: "0.95rem", padding: "0.6rem 1rem" }}
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small text-muted">Image URL</label>
                      <input
                        required
                        type="text"
                        className="form-control rounded-4 shadow-sm border-light"
                        placeholder="Paste image link"
                        style={{ fontSize: "0.95rem", padding: "0.6rem 1rem" }}
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer border-0 px-4 pb-4 pt-0">
                  <button
                    type="button"
                    className="btn rounded-pill px-4 shadow-sm"
                    style={{ background: "#f5f5f7", border: "1px solid #e0e0e5" }}
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn rounded-pill px-4 shadow-sm" style={{ background: "#000", color: "#fff" }}>
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Premium Card Hover CSS */}
      <style>{`
        .product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.12);
        }
        @media (max-width: 768px) {
          .product-card {
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
