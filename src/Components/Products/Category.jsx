import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../SearchContext/SearchContext";
import { fetchByCategory } from "../Fetch/FetchUser";
import Footer from "../Home/Footer";


export default function Category() {
  const [products, setProducts] = useState([]);
  const { category } = useContext(SearchContext);

  useEffect(() => {
    async function getCategory() {
      const res = await fetchByCategory(category);
      setProducts(res);
    }
    getCategory();
  }, [category]); // ✅ avoids infinite loop

  return (
    <>
        <div className="container my-5">
      {/* Heading */}
      <div className="text-center mb-4">
        <h1 className="fw-bold text-capitalize">{category}</h1>
        <p className="text-muted">Explore our {category} collection</p>
      </div>

      {/* Responsive Grid */}
      <div className="row g-4">
        {products && products.length > 0 ? (
          products.map((item) => (
            <div
              key={item.id}
              className="col-12 col-sm-6 col-md-4 col-lg-3"
            >
              <div
                className="card h-100 text-center border-0 shadow-sm"
                style={{ background: "#fff8f0", borderRadius: "12px" }}
              >
                {item.image && (
                  <div
                    style={{
                      height: "220px", // fixed container height
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      padding: "10px",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain", // keep natural aspect ratio
                      }}
                    />
                  </div>
                )}
                <div className="card-body">
                  <h5 className="card-title fw-semibold">{item.name}</h5>
                  <p className="text-muted">₹{item.price}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted">No products found.</p>
        )}
      </div>
      
    </div>
    <Footer/>
    </>

    
  );
}
