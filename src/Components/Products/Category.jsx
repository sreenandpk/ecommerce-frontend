import { useEffect, useState, useContext } from "react";
import { SearchContext } from "../SearchContext/SearchContext";
import { fetchByCategory } from "../Fetch/FetchUser";
import Footer from "../Home/Footer";
import Navbar from "../../Navbar/Navbar";
import ScrollToTop from "../ScrollTop";

export default function Category() {
  const [products, setProducts] = useState([]);
  const { category } = useContext(SearchContext);

  useEffect(() => {
    async function getCategory() {
      const res = await fetchByCategory(category);
      setProducts(res);
    }
    getCategory();
  }, [category]);

  return (
    <>
      <Navbar />

      <div className="container my-5">
        {/* Heading */}
        <div className="text-center mb-4">
          <h1 className="fw-bold text-capitalize gradient-text">{category}</h1>
          <p className="text-muted">Explore our {category} collection</p>
        </div>

        {/* Responsive Grid */}
        <div className="row justify-content-center g-4">
          {products && products.length > 0 ? (
            products.map((item) => (
              <div key={item.id} className="col-6 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center">
                <div className="card category-card shadow-sm border-0">
                  {item.image && (
                    <div className="image-container">
                      <img src={item.image} alt={item.name} />
                    </div>
                  )}
                  <div className="card-body text-center">
                    <h5 className="card-title fw-semibold text-truncate" title={item.name}>
                      {item.name}
                    </h5>
                   
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted">No products found.</p>
          )}
        </div>
      </div>

      <Footer />
      <ScrollToTop />

      <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #ff7eb3, #ff758c, #ff6a88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: bold;
        }

        .category-card {
          max-width: 260px;
          border-radius: 20px;
          overflow: hidden;
          background-color: #fff;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }

        .category-card:hover {
          transform: scale(1.05);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .image-container {
          height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #fff8f0;
          padding: 10px;
        }

        .image-container img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }

        .image-container img:hover {
          transform: scale(1.05);
        }

        .card-body {
          background: #fff8f0;
          padding: 15px;
        }

        .card-title {
          font-size: 1rem;
          font-weight: 600;
          color: #2c2c2c;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .price {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c2c2c;
          letter-spacing: 0.5px;
          margin-top: 5px;
        }

        @media (max-width: 576px) {
          .category-card { max-width: 100% !important; }
        }
      `}</style>
    </>
  );
}
