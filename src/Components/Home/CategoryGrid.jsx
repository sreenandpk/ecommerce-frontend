import { useNavigate } from "react-router-dom";

export default function CategoryGrid({ categories }) {
  const navigate = useNavigate();

  if (!Array.isArray(categories) || categories.length === 0) return null;

  return (
    <div className="container px-3 px-md-4 my-4 mt-5">
      <div className="row g-3 g-md-4 justify-content-center">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="col-6 col-md-4 col-lg-3"
            style={{
              borderRadius: "15px",
              overflow: "hidden",
              cursor: "pointer",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              position: "relative"
            }}
            onClick={() => navigate(`/category/${cat.slug}`)}
            data-aos="fade-up"
          >
            <div className="w-100 h-100 category-box-wrapper" style={{ borderRadius: "15px", overflow: "hidden" }}>
              <img
                src={cat.image}
                alt={cat.name}
                className="category-img"
                style={{
                  width: "100%",
                  height: "clamp(180px, 40vh, 350px)",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.5s ease",
                }}
              />
              {/* Overlay for better text readability if needed or just for aesthetics */}
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                padding: "15px",
                background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center"
              }}>
                <span style={{
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "clamp(0.9rem, 2vw, 1.2rem)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontFamily: "'Poppins', sans-serif"
                }}>
                  {cat.name}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .category-box-wrapper:hover .category-img {
          transform: scale(1.1);
        }
        .col-6.col-md-4.col-lg-3:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          z-index: 2;
        }
        @media (max-width: 576px) {
          .category-img {
            height: 200px !important;
          }
        }
      `}</style>
    </div>
  );
}
