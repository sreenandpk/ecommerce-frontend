import Navbar from "../../Navbar/Navbar";
import Footer from "../Home/Footer";

export default function About() {
  return (

    <>
    <Navbar/>
    <div
      style={{
        minHeight: "100vh",
       
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        fontFamily: "'San Francisco', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          width: "100%",
          backgroundColor: "white",
          borderRadius: "28px",
          padding: "50px 40px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "30px",
        }}
      >
        {/* Heading */}
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "600",
            color: "#2c2c2e",
            textAlign: "center",
          }}
        >
          About Our Dairy Products
        </h1>

        {/* Subheading */}
        <p
          style={{
            fontSize: "18px",
            color: "#4a4a4a",
            textAlign: "center",
            maxWidth: "700px",
            margin: "0 auto",
            lineHeight: "1.6",
          }}
        >
          We are committed to delivering the freshest, highest quality dairy
          products directly to your home. From creamy milkshakes to rich
          cheeses and butter, our products are crafted with care and
          love, ensuring every sip and bite is pure satisfaction.
        </p>

        {/* Dairy Product Features */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-around",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {/* Example Product Card */}
          <div
            style={{
              backgroundColor: "#fdfdfd",
              borderRadius: "20px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
              width: "250px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              transition: "transform 0.3s ease",
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <img
              src="https://media.istockphoto.com/id/1255401209/photo/glass-with-strawberry-smoothie-or-milkshake.jpg?s=612x612&w=0&k=20&c=hgognYCh-DQ5aw9XrPyZOg8XeRctG2DK5csLCQParZs="
              alt="Milkshake"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "50%",
                marginBottom: "15px",
                boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
              }}
            />
            <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#2c2c2e" }}>
              Strawberry Milkshake
            </h3>
            <p style={{ fontSize: "14px", color: "#6b6b6b", marginTop: "5px" }}>
              Freshly blended with real strawberries and creamy milk for a rich taste.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#fdfdfd",
              borderRadius: "20px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
              width: "250px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              transition: "transform 0.3s ease",
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <img
              src="https://t3.ftcdn.net/jpg/09/60/78/54/360_F_960785479_duR0GPpLbu7WaQMJPsg2Tn2Dp9NXSxz0.jpg"
              alt="Vanilla Milkshake"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "50%",
                marginBottom: "15px",
                boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
              }}
            />
            <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#2c2c2e" }}>
              Vanilla Milkshake
            </h3>
            <p style={{ fontSize: "14px", color: "#6b6b6b", marginTop: "5px" }}>
              Smooth and creamy vanilla milkshake made with pure dairy cream.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#fdfdfd",
              borderRadius: "20px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
              width: "250px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              transition: "transform 0.3s ease",
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <img
              src="https://www.indianhealthyrecipes.com/wp-content/uploads/2022/05/chocolate-milkshake.webp"
              alt="Chocolate Milkshake"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "50%",
                marginBottom: "15px",
                boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
              }}
            />
            <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#2c2c2e" }}>
              Chocolate Milkshake
            </h3>
            <p style={{ fontSize: "14px", color: "#6b6b6b", marginTop: "5px" }}>
              Rich chocolate flavor blended with fresh milk for the perfect treat.
            </p>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    
    </>
    
  );
}
