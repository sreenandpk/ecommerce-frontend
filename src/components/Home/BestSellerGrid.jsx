import { useNavigate } from "react-router-dom";

export default function BestSellerGrid({ products }) {
    const navigate = useNavigate();

    if (!products || products.length === 0) return null;

    return (
        <div className="container">
            <div className="row g-4 justify-content-center">
                {products.map((item) => (
                    <div
                        key={item.id}
                        className="col-6 col-sm-4 col-md-3 col-lg-2"
                        data-aos="fade-up"
                    >
                        <div
                            onClick={() => item.stock > 0 && navigate(`/productDetails/${item.slug}`)}
                            className={`card border-0 h-100 ${item.stock > 0 ? 'best-seller-hover' : ''}`}
                            style={{
                                borderRadius: "24px",
                                cursor: item.stock === 0 ? "default" : "pointer",
                                overflow: "hidden",
                                backgroundColor: "rgba(255, 248, 240, 0.6)",
                                backdropFilter: "blur(12px) saturate(180%)",
                                WebkitBackdropFilter: "blur(12px) saturate(180%)",
                                border: "1px solid rgba(255, 255, 255, 0.25)",
                                transition: "all 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
                                opacity: item.stock === 0 ? 0.8 : 1,
                                position: "relative",
                                boxShadow: item.stock === 0 ? "none" : "0 10px 30px rgba(0,0,0,0.04)"
                            }}
                        >
                            {/* SOLD OUT OVERLAY */}
                            {item.stock === 0 && (
                                <div
                                    className="position-absolute d-flex align-items-center justify-content-center"
                                    style={{
                                        inset: 0,
                                        background: "rgba(255, 255, 255, 0.15)",
                                        backdropFilter: "blur(2px)",
                                        zIndex: 3,
                                    }}
                                >
                                    <span
                                        className="sold-out-badge"
                                        style={{
                                            background: "rgba(0, 0, 0, 0.65)",
                                            color: "#fff",
                                            padding: "4px 12px",
                                            borderRadius: "50px",
                                            fontSize: "0.65rem",
                                            fontWeight: "700",
                                            letterSpacing: "0.5px",
                                            textTransform: "uppercase",
                                            boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
                                        }}
                                    >
                                        Sold Out
                                    </span>
                                </div>
                            )}

                            <img
                                src={item.image}
                                className="card-img-top"
                                alt={item.name}
                                style={{
                                    height: "130px",
                                    objectFit: "contain",
                                    padding: "10px",
                                    filter: item.stock === 0 ? "grayscale(1) opacity(0.6)" : "none",
                                    transition: "all 0.4s ease"
                                }}
                            />
                            <div className="card-body text-center p-2">
                                <h6
                                    className="card-title mb-1 text-truncate"
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: item.stock === 0 ? "#888" : "#0a2141",
                                    }}
                                >
                                    {item.name}
                                </h6>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
                .best-seller-hover:hover {
                    transform: translateY(-10px);
                    background-color: rgba(255, 248, 240, 0.8) !important;
                    box-shadow: 0 25px 50px rgba(93, 55, 43, 0.1) !important;
                    border-color: rgba(93, 55, 43, 0.15) !important;
                }
                .best-seller-hover:hover .card-img-top {
                    transform: scale(1.1) translateY(-5px);
                }

                @keyframes soldOutPulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }

                .sold-out-badge {
                    animation: soldOutPulse 2s infinite ease-in-out;
                    display: inline-block;
                }
            `}</style>
        </div>
    );
}
