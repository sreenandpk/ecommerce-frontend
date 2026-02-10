import { useEffect } from "react";
import { Carousel as BootstrapCarousel } from "bootstrap";

export default function ImageCarousel({ id, images }) {
    useEffect(() => {
        const carouselElement = document.getElementById(id);
        if (carouselElement) {
            new BootstrapCarousel(carouselElement, {
                interval: 4000,
                ride: "carousel",
            });
        }
    }, [id]);

    return (
        <div
            id={id}
            className="carousel slide shadow-lg rounded"
            style={{
                width: "100%",
                maxWidth: "1100px",
            }}
        >
            <div className="carousel-inner">
                {images.map((img, index) => (
                    <div
                        key={index}
                        className={`carousel-item ${index === 0 ? "active" : ""}`}
                    >
                        <img
                            src={img}
                            className="d-block w-100"
                            alt={`Icecream ${index + 1}`}
                            style={{
                                borderRadius: "15px",
                                height: "clamp(550px, 50vh, 500px)",
                                objectFit: "cover",
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* controls – unchanged */}
            <button
                className="carousel-control-prev"
                type="button"
                data-bs-target={`#${id}`}
                data-bs-slide="prev"
            >
                <span
                    className="carousel-control-prev-icon"
                    aria-hidden="true"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
                />
                <span className="visually-hidden">Previous</span>
            </button>

            <button
                className="carousel-control-next"
                type="button"
                data-bs-target={`#${id}`}
                data-bs-slide="next"
            >
                <span
                    className="carousel-control-next-icon"
                    aria-hidden="true"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
                />
                <span className="visually-hidden">Next</span>
            </button>
        </div>
    );
}
