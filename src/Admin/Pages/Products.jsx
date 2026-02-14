import { useEffect, useState } from "react";
import {
  getAdminProducts,
  createProduct as createAdminProduct,
  updateProduct as updateAdminProduct,
  deleteProduct as deleteAdminProduct,
  getIngredients,
  getAllergens,
  getCities
} from "../../api/admin/products";
import { getAdminCategories } from "../../api/admin/categories";
import Select from "react-select";
import { Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LuPlus, LuPencil, LuTrash2,
  LuEyeOff, LuChevronLeft, LuChevronRight
} from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, X, Check, Save, Package, Tag, FileText, Activity
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggeredChildren: 0.05 }
  }
};

export default function Products() {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 10;

  // Auxiliary Data
  const [categories, setCategories] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [allAllergens, setAllAllergens] = useState([]);
  const [allCities, setAllCities] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Initial Form State
  const initialFormState = {
    name: "",
    slug: "",
    price: "",
    currency: "INR",
    category: "",
    image: null,
    description: "",
    story: "",
    stock: 0,
    is_active: true,
    ingredients: [],
    allergens: [],
    available_cities: [],
    nutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      sugar: 0,
    },
  };

  const [newProduct, setNewProduct] = useState(initialFormState);

  /* 🔒 HARD ADMIN GUARD */
  if (authLoading) return null;
  if (!isAdmin) {
    navigate("/login", { replace: true });
    return null;
  }

  /* ================= FETCH ================= */
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [prodData, catData, ingData, algData, cityData] = await Promise.all([
        getAdminProducts(1),
        getAdminCategories(),
        getIngredients(),
        getAllergens(),
        getCities(),
      ]);

      setProducts(prodData?.results ?? prodData ?? []);
      setTotalProducts(prodData?.count ?? (Array.isArray(prodData) ? prodData.length : 0));
      setCategories(catData?.results ?? catData ?? []);
      setAllIngredients(ingData ?? []);
      setAllAllergens(algData ?? []);
      setAllCities(cityData ?? []);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const prodData = await getAdminProducts(page);
      setProducts(prodData?.results ?? prodData ?? []);
      setTotalProducts(prodData?.count ?? (Array.isArray(prodData) ? prodData.length : 0));
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const loadData = () => fetchProducts(currentPage);

  const prepareFormData = (productState) => {
    const formData = new FormData();
    formData.append("name", productState.name);
    if (productState.slug) formData.append("slug", productState.slug);
    formData.append("price", productState.price);
    formData.append("currency", productState.currency);
    formData.append("description", productState.description);
    formData.append("story", productState.story);
    formData.append("stock", productState.stock);
    formData.append("is_active", productState.is_active);

    if (productState.category) {
      formData.append("category", productState.category);
    }

    if (productState.image instanceof File) {
      formData.append("image", productState.image);
    }

    productState.ingredients.forEach(id => formData.append("ingredients", id));
    productState.allergens.forEach(id => formData.append("allergens", id));
    productState.available_cities.forEach(id => formData.append("available_cities", id));

    formData.append("nutrition", JSON.stringify(productState.nutrition));

    return formData;
  };

  /* ================= CREATE ================= */
  const submitAdd = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category || !newProduct.image) {
      alert("Please fill essential fields: Name, Price, Category, and Image.");
      return;
    }

    try {
      const formData = prepareFormData(newProduct);
      await createAdminProduct(formData);
      setShowAdd(false);
      setNewProduct(initialFormState);
      loadData();
    } catch (err) {
      console.error("Create failed", err);
      alert("Failed to create product.");
    }
  };

  /* ================= UPDATE ================= */
  const openEdit = (p) => {
    setEditProduct({
      ...p,
      category: p.category_details?.id || p.category,
      ingredients: p.ingredients.map(i => i.id || i),
      allergens: p.allergens.map(a => a.id || a),
      available_cities: p.available_cities.map(c => c.id || c),
      nutrition: p.nutrition || initialFormState.nutrition,
    });
    setShowEdit(true);
  };

  const submitEdit = async () => {
    if (!editProduct) return;
    if (!editProduct.name || !editProduct.price || !editProduct.category) {
      alert("Please fill essential fields: Name, Price, and Category.");
      return;
    }

    try {
      const formData = prepareFormData(editProduct);
      await updateAdminProduct(editProduct.slug, formData);
      setShowEdit(false);
      setEditProduct(null);
      loadData();
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update product.");
    }
  };

  /* ================= DELETE ================= */
  const remove = async (slug) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteAdminProduct(slug);
      loadData();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const paginate = (pageNumber) => fetchProducts(pageNumber);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="admin-products-container custom-scrollbar"
    >
      {/* HEADER */}
      <div className="admin-header-glass d-flex flex-column flex-md-row justify-content-between mb-4 mb-md-5 align-items-md-center gap-3">
        <div>
          <h2 className="admin-title">Products Vault</h2>
          <p className="admin-subtitle">{totalProducts} exclusive creations managed</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAdd(true)}
          className="admin-add-btn"
        >
          <LuPlus className="me-2" size={20} /> Add Product
        </motion.button>
      </div>

      {/* LIST */}
      <div className="row g-3 g-md-4">
        {products.length ? (
          products.map((p, index) => (
            <motion.div
              key={p.id}
              className="col-6 col-md-4 col-lg-3 col-xl-2.5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className={`admin-product-card h-100 ${p.stock <= 0 ? 'out-of-stock' : ''}`}>
                <div className="admin-card-visual">
                  <img src={p.image} alt={p.name} className="admin-card-img" />

                  <div className="admin-badge-stack">
                    {!p.is_active && (
                      <span className="badge-glass inactive">
                        <LuEyeOff size={10} className="me-1" /> Hidden
                      </span>
                    )}
                    {p.stock <= 0 && (
                      <span className="badge-glass sold-out pulsing">
                        Sold Out
                      </span>
                    )}
                    {p.stock > 0 && p.stock <= 5 && (
                      <span className="badge-glass low-stock">
                        Low: {p.stock}
                      </span>
                    )}
                  </div>
                </div>

                <div className="admin-card-body">
                  <div className="mb-2">
                    <h6 className="admin-prod-name text-truncate">{p.name}</h6>
                    <span className="admin-prod-price small fw-bold">{p.currency === 'INR' ? '₹' : '$'}{p.price}</span>
                  </div>

                  <div className="admin-prod-meta mb-3">
                    <span className="admin-stock-val">Stock: {p.stock}</span>
                  </div>

                  <div className="admin-card-actions mt-auto d-flex flex-column flex-sm-row gap-2">
                    <button
                      className="admin-action-btn refine flex-fill"
                      onClick={() => openEdit(p)}
                    >
                      <LuPencil size={12} className="me-1" /> Edit
                    </button>
                    <button
                      className="admin-action-btn discard flex-fill"
                      onClick={() => remove(p.slug)}
                    >
                      <LuTrash2 size={12} className="me-1" /> Del
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-5 w-100">
            <p className="text-muted small">No products found in the vault.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalProducts > itemsPerPage && (
        <div className="d-flex justify-content-center mt-5 gap-2 align-items-center flex-wrap">
          <button
            className="pagination-btn"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <LuChevronLeft size={18} />
          </button>

          <div className="d-flex gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`pagination-number ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <LuChevronRight size={18} />
          </button>
        </div>
      )}

      <style>{`
        .admin-products-container {
          background: #fff8f0;
          min-height: 100vh;
          padding: 20px 15px;
          font-family: 'Poppins', sans-serif;
        }
        @media (min-width: 768px) {
          .admin-products-container { padding: 40px; }
        }

        .admin-header-glass {
          background: linear-gradient(135deg, rgba(93, 55, 43, 0.05) 0%, rgba(93, 55, 43, 0.02) 100%);
          backdrop-filter: blur(10px);
          padding: 20px;
          border-radius: 20px;
          border: 1px solid rgba(93, 55, 43, 0.1);
        }
        @media (min-width: 768px) {
          .admin-header-glass { padding: 30px; border-radius: 30px; }
        }

        .admin-title {
          font-family: 'Playfair Display', serif;
          font-weight: 800;
          color: #5D372B;
          margin: 0;
          font-size: 1.5rem;
        }
        @media (min-width: 768px) {
          .admin-title { font-size: 2.2rem; }
        }

        .admin-subtitle {
          color: #8d6e63;
          font-size: 0.8rem;
          margin: 0;
          font-weight: 500;
        }

        .admin-add-btn {
          background: #5D372B;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 50px;
          font-weight: 600;
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          justify-content: center;
        }

        .admin-product-card {
          background: white;
          border-radius: 20px;
          border: 1px solid rgba(93, 55, 43, 0.08);
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          display: flex;
          flex-direction: column;
        }
        .admin-product-card:hover { transform: translateY(-5px); }

        .admin-card-visual {
          height: 140px;
          background: #fafafa;
          margin: 8px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 768px) {
          .admin-card-visual { height: 180px; }
        }
        .admin-card-img {
          height: 80%;
          object-fit: contain;
        }

        .admin-badge-stack {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: flex-end;
        }
        .badge-glass {
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(4px);
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.6rem;
          font-weight: 700;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .badge-glass.inactive { background: rgba(0,0,0,0.6); color: white; }
        .badge-glass.sold-out { background: rgba(255, 71, 87, 0.1); color: #ff4757; }
        .badge-glass.low-stock { background: rgba(255, 159, 67, 0.1); color: #ff9f43; }

        .admin-card-body {
          padding: 12px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .admin-prod-name {
          font-weight: 700;
          color: #2d3436;
          margin: 0;
          font-size: 0.85rem;
        }
        .admin-prod-price { color: #5D372B; }
        .admin-prod-meta { font-size: 0.7rem; color: #8d6e63; }

        .admin-action-btn {
          border: none;
          padding: 6px;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 700;
          transition: 0.2s;
        }
        .admin-action-btn.refine { background: #5D372B; color: white; }
        .admin-action-btn.discard { background: #fee2e2; color: #dc2626; }

        .pagination-btn, .pagination-number {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid rgba(93, 55, 43, 0.1);
          background: white;
          color: #5D372B;
          font-weight: 600;
          font-size: 0.85rem;
        }
        .pagination-number.active { background: #5D372B; color: white; }
      `}</style>

      {/* ================= ADD MODAL ================= */}
      {showAdd && (
        <Modal title="Add Product" onClose={() => setShowAdd(false)}>
          <ProductForm
            state={newProduct}
            setState={setNewProduct}
            categories={categories}
            ingredients={allIngredients}
            allergens={allAllergens}
            cities={allCities}
            handleSubmit={submitAdd}
          />
        </Modal>
      )}

      {/* ================= EDIT MODAL ================= */}
      {showEdit && editProduct && (
        <Modal title="Edit Product" onClose={() => setShowEdit(false)}>
          <ProductForm
            state={editProduct}
            setState={setEditProduct}
            categories={categories}
            ingredients={allIngredients}
            allergens={allAllergens}
            cities={allCities}
            handleSubmit={submitEdit}
            isEdit
          />
        </Modal>
      )}
    </motion.div>
  );
}

function ProductForm({ state, setState, categories, ingredients, allergens, cities, handleSubmit, isEdit }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNutritionChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      nutrition: { ...prev.nutrition, [name]: value }
    }));
  };

  const handleSelectChange = (selectedOptions, field) => {
    const values = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
    setState(prev => ({ ...prev, [field]: values }));
  };

  const formatOptions = (items) => items.map(i => ({ value: i.id, label: i.name }));

  const formVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      className="pb-2"
    >
      <motion.div variants={itemVariants} className="mb-4">
        <h5 className="fw-bold mb-3 d-flex align-items-center text-dark border-bottom pb-2">
          <Package className="me-2 text-primary" size={18} /> Basic Essentials
        </h5>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-bold text-uppercase text-muted">Name <span className="text-danger">*</span></label>
            <input
              className="form-control"
              style={{ borderRadius: "10px", padding: "10px 15px", border: "1px solid #e1e4e8" }}
              name="name"
              value={state.name}
              onChange={handleChange}
              required
              placeholder="e.g. Classic Beef Burger"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-bold text-uppercase text-muted">Slug</label>
            <input
              className="form-control bg-light"
              style={{ borderRadius: "10px", padding: "10px 15px", border: "1px solid #e1e4e8" }}
              name="slug"
              value={state.slug}
              onChange={handleChange}
              disabled={isEdit}
              placeholder="auto-generated"
            />
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-bold text-uppercase text-muted">Price <span className="text-danger">*</span></label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 rounded-start-3" style={{ border: "1px solid #e1e4e8" }}>
                {state.currency === 'INR' ? '₹' : '$'}
              </span>
              <input
                className="form-control border-start-0 rounded-end-3"
                style={{ border: "1px solid #e1e4e8", padding: "10px 15px" }}
                type="number"
                name="price"
                value={state.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-bold text-uppercase text-muted">Currency</label>
            <select
              className="form-select"
              style={{ borderRadius: "10px", padding: "10px 15px", border: "1px solid #e1e4e8" }}
              name="currency"
              value={state.currency}
              onChange={handleChange}
            >
              <option value="INR">Indian Rupee (INR)</option>
              <option value="USD">US Dollar (USD)</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-bold text-uppercase text-muted">Category <span className="text-danger">*</span></label>
            <select
              className="form-select"
              style={{ borderRadius: "10px", padding: "10px 15px", border: "1px solid #e1e4e8" }}
              name="category"
              value={state.category}
              onChange={handleChange}
              required
            >
              <option value="">Choose Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-4">
        <h5 className="fw-bold mb-3 d-flex align-items-center text-dark border-bottom pb-2">
          <FileText className="me-2 text-warning" size={18} /> Content & Media
        </h5>
        <div className="mb-3">
          <label className="form-label small fw-bold text-uppercase text-muted">Promotional Story</label>
          <textarea
            className="form-control"
            style={{ borderRadius: "12px", border: "1px solid #e1e4e8" }}
            name="story"
            rows="2"
            value={state.story}
            onChange={handleChange}
            placeholder="The narrative behind this creation..."
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="form-label small fw-bold text-uppercase text-muted">Detailed Description</label>
          <textarea
            className="form-control"
            style={{ borderRadius: "12px", border: "1px solid #e1e4e8" }}
            name="description"
            rows="3"
            value={state.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="form-label small fw-bold text-uppercase text-muted">Product Image {!isEdit && <span className="text-danger">*</span>}</label>
          <div
            className="position-relative rounded-4 p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              border: '2px dashed #cbd5e0',
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <input
              className="d-none"
              id="imageUpload"
              type="file"
              onChange={(e) => setState(prev => ({ ...prev, image: e.target.files[0] }))}
              required={!isEdit}
            />
            <label htmlFor="imageUpload" className="w-100 h-100 d-flex flex-column align-items-center justify-content-center cursor-pointer">
              <Upload size={32} className="text-secondary mb-2" />
              {state.image && typeof state.image !== 'string' ? (
                <div className="text-success fw-bold d-flex align-items-center">
                  <Check size={16} className="me-1" /> {state.image.name}
                </div>
              ) : (
                <div className="text-muted">
                  <span className="fw-semibold text-primary">Click to upload</span> or drag and drop
                  {isEdit && state.image && (
                    <div className="small mt-1 text-secondary">Current: {state.image.split('/').pop()}</div>
                  )}
                </div>
              )}
            </label>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-4">
        <h5 className="fw-bold mb-3 d-flex align-items-center text-dark border-bottom pb-2">
          <Activity className="me-2 text-info" size={18} /> Inventory & Status
        </h5>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-bold text-uppercase text-muted">Internal Stock</label>
            <input
              className="form-control"
              type="number"
              name="stock"
              style={{ borderRadius: "10px", padding: "10px 15px", border: "1px solid #e1e4e8" }}
              value={state.stock}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-bold text-uppercase text-muted">Web Store Status</label>
            <div
              className={`d-flex align-items-center px-3 ${state.is_active ? "bg-success-subtle border-success-subtle" : "bg-light"}`}
              style={{ borderRadius: "10px", border: "1px solid #e1e4e8", height: "46px" }}
            >
              <div className="form-check form-switch m-0 d-flex align-items-center">
                <input
                  className="form-check-input m-0"
                  type="checkbox"
                  name="is_active"
                  checked={state.is_active}
                  onChange={handleChange}
                  id="activeCheck"
                  style={{ cursor: "pointer", width: "3em", height: "1.5em" }}
                />
              </div>
              <label className="form-check-label ms-3 fw-bold small text-uppercase flex-grow-1" htmlFor="activeCheck" style={{ cursor: "pointer" }}>
                {state.is_active ? "Active & Visible" : "Hidden from Store"}
              </label>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-4">
        <h5 className="fw-bold mb-3 d-flex align-items-center text-dark border-bottom pb-2">
          <Tag className="me-2 text-danger" size={18} /> Classifications
        </h5>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-bold text-uppercase text-muted">Ingredients</label>
            <Select
              isMulti
              options={formatOptions(ingredients)}
              styles={customSelectStyles}
              value={formatOptions(ingredients).filter(opt => state.ingredients.includes(opt.value))}
              onChange={(selected) => handleSelectChange(selected, 'ingredients')}
              placeholder="Select..."
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-bold text-uppercase text-muted">Allergens</label>
            <Select
              isMulti
              options={formatOptions(allergens)}
              styles={customSelectStyles}
              value={formatOptions(allergens).filter(opt => state.allergens.includes(opt.value))}
              onChange={(selected) => handleSelectChange(selected, 'allergens')}
              placeholder="Select..."
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-bold text-uppercase text-muted">Cities</label>
            <Select
              isMulti
              options={formatOptions(cities)}
              styles={customSelectStyles}
              value={formatOptions(cities).filter(opt => state.available_cities.includes(opt.value))}
              onChange={(selected) => handleSelectChange(selected, 'available_cities')}
              placeholder="Select..."
            />
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h5 className="fw-bold mb-3 d-flex align-items-center text-dark border-bottom pb-2">
          <Activity className="me-2 text-success" size={18} /> Nutrition Output
        </h5>
        <div className="row g-2 p-3 bg-light rounded-4 border">
          {['calories', 'protein', 'fat', 'carbs', 'sugar'].map(field => (
            <div className="col-md-2" key={field}>
              <label className="small fw-bold text-muted text-capitalize d-block mb-1">{field}</label>
              <input
                className="form-control form-control-sm border-0 shadow-none border-bottom rounded-0 bg-transparent"
                type="number"
                name={field}
                value={state.nutrition?.[field] || 0}
                onChange={handleNutritionChange}
              />
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-4 pt-4 border-top d-flex justify-content-end"
      >
        <button
          className="btn btn-dark rounded-pill px-5 py-2 fw-bold d-flex align-items-center shadow-lg"
          onClick={handleSubmit}
        >
          <Save size={20} className="me-2" />
          {isEdit ? "Update Product" : "Create Product"}
        </button>
      </motion.div>
    </motion.div>
  );
}

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: '10px',
    padding: '4px',
    borderColor: state.isFocused ? '#e63946' : '#e1e4e8',
    boxShadow: state.isFocused ? '0 0 0 4px rgba(230, 57, 70, 0.1)' : 'none',
    transition: 'all 0.2s',
    '&:hover': { borderColor: '#e63946' }
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#fff0f3',
    borderRadius: '8px',
    border: '1px solid #ffccd5',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#e63946',
    fontWeight: '600',
    fontSize: '0.85rem'
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#e63946',
    ':hover': { backgroundColor: '#e63946', color: 'white' }
  })
};

function Modal({ title, children, onClose }) {
  return (
    <AnimatePresence>
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ zIndex: 1060 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="position-absolute w-100 h-100 bg-dark bg-opacity-50"
          style={{ backdropFilter: "blur(8px)" }}
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white shadow-lg position-relative d-flex flex-column"
          style={{
            width: "95%",
            maxWidth: "850px",
            borderRadius: "24px",
            maxHeight: "90vh",
            overflow: "hidden"
          }}
        >
          <div className="px-4 py-3 d-flex justify-content-between align-items-center border-bottom bg-white" style={{ position: 'sticky', top: 0, zIndex: 20 }}>
            <h4 className="fw-bold m-0 text-dark d-flex align-items-center">
              {title}
            </h4>
            <button
              onClick={onClose}
              className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center"
              style={{ width: "40px", height: "40px" }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4" style={{ overflowY: "auto" }}>
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
