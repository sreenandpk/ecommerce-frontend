import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default function FlavorSection({ icecream1, icecream2 }) {
  useEffect(() => {
    const el = document.getElementById("flavorCarousel");
    if (el && window.bootstrap) {
      const carousel = new window.bootstrap.Carousel(el, {
        interval: 2000,   // autoplay every 2s
        ride: "carousel",
        wrap: true,       // infinite loop
        pause: false,     // don't stop on hover
      });
    }
  }, []);

  return (
    <div
      id="flavorCarousel"
      className="carousel slide"
      style={{ flex: "1 1 400px", textAlign: "center" }}
    >
      <div className="carousel-inner" style={{ borderRadius: "20px" }}>
        <div className="carousel-item active">
          <img
            src={icecream1}
            className="d-block w-100"
            alt="Icecream 1"
            style={{
              maxWidth: "700px",
              margin: "0 auto",
              borderRadius: "20px",
              objectFit: "cover",
            }}
          />
        </div>

        <div className="carousel-item">
          <img
            src={icecream2}
            className="d-block w-100"
            alt="Icecream 2"
            style={{
              maxWidth: "700px",
              margin: "0 auto",
              borderRadius: "20px",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    </div>
  );
}
