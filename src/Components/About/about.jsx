import Navbar from "../../Navbar/Navbar";
import Footer from "../Home/Footer";
import icecreamG from "../../../homeImages/AboutImage1.jpg";
import icecreamGG from "../../../homeImages/AboutImage2.jpg";
import icecreamGGG from "../../../homeImages/AboutImage3.jpg";
import FlavorSection from "../FlaverSection";
import Lottie from "lottie-react";
import animationData from "../../../jsonAnimation/icecream.json"; 
import ScrollToTop from "../ScrollTop";
export default function About() {
  return (

    <>
    <Navbar/>
    <div style={{height:'30px'}}></div>
      <div className="d-flex flex-wrap justify-content-between align-items-center px-3 px-lg-5 py-5  "style={{background:" #fff8f0"}}>
          
         
            <div className="flex-grow-1 mb-4 mb-lg-0 " style={{ minWidth: "300px", maxWidth: "500px" }}>
               <h5 className=" mb-5 mx-5"data-aos="fade-up">the best ice cream brands</h5>
              <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#0a2141" }}className="mx-5"data-aos="fade-up">
                You think you’re
old? <br /> Ice cream is
older!
              </h1>
              
              <button onClick={()=>navigate("/products")}
                style={{
                  padding: "0.9rem 1.8rem",
                  background: "#0a2141",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}className="mx-5 mt-5"
              data-aos="fade-up">
                Explore ice creams →
              </button>
            </div>
            <div className="flex-grow-1 text-center mt-3 " style={{ minWidth: "300px", maxWidth: "550px" }}data-aos="fade-up">
            <FlavorSection icecream1={icecreamG} icecream2={icecreamGG} icecream3={icecreamGGG} data-aos="fade-up"/>
            </div>
          </div>
    
    <div
      style={{
        minHeight: "100vh",
       
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        
        fontFamily: "'San Francisco', 'Helvetica Neue', Arial, sans-serif",
        
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          width: "100%",
         background:" #fff8f0",
          borderRadius: "28px",
          padding: "50px 40px",
          
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
            display:'flex',
            justifyContent:'center'
          }}
       data-aos="fade-up">
         <span className="mt-4">
          About Our Dairy Products
          </span>  <span>
         
            </span> 
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
        data-aos="fade-up">
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
          }}data-aos="fade-up"
        >
          {/* Example Product Card */}
          <div
            style={{
              background:" #fff8f0",
              borderRadius: "20px",
             
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
            background:" #fff8f0",
              borderRadius: "20px",
             
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
             background: "#fff8f0",
              borderRadius: "20px",
             
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
    <Footer data-aos="fade-up"/>
    <ScrollToTop />
    </>
    
  );
}
