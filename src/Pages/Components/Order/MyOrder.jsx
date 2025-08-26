import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default function Orders() {
  return (
    <div className="container my-5">
      {/* Page Title */}
      <h2 className="fw-bold mb-4 text-center text-dark">My Orders</h2>

      {/* Orders Grid */}
      <div className="row g-4">
        {/* Order Card (Repeat with your DB data) */}
        <div className="col-12 col-md-6 col-lg-4">
          <div
            className="card shadow-sm border-0 h-100"
            style={{ borderRadius: "15px" }}
          >
            {/* Product Image */}
            <div
              style={{
                height: "200px",
                borderTopLeftRadius: "15px",
                borderTopRightRadius: "15px",
                overflow: "hidden",
              }}
            >
              <img
                src="your-product-image.jpg"
                alt="Product"
                className="w-100 h-100"
                style={{ objectFit: "cover" }}
              />
            </div>

            {/* Card Body */}
            <div className="card-body">
              <h5 className="card-title fw-bold">Product Name</h5>
              <p className="mb-1">
                <strong>Price:</strong> ₹XXX
              </p>
              <p className="mb-1">
                <strong>Date:</strong> YYYY-MM-DD
              </p>
              <p className="fw-bold text-success">Delivered</p>
              {/* Or use className="text-warning" for Pending */}
            </div>

            {/* Card Footer with Buttons */}
            <div className="card-footer bg-white border-0 d-flex justify-content-between">
              <button className="btn btn-outline-dark btn-sm rounded-pill">
                View
              </button>
              <button className="btn btn-danger btn-sm rounded-pill">
                Cancel
              </button>
            </div>
          </div>
        </div>
        {/* Repeat Ends */}
      </div>
    </div>
  );
}
