export default function Footer(){




    return(

        <>
        
        
        

<footer 
  className="text-center text-lg-start mt-5" 
  style={{ 
 backgroundColor: "#efced5ce",

    fontFamily: "Poppins, sans-serif" 
  }}
>
  <div className="container p-4">
    <div className="row">
      
      {/* About Section */}
      <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
        <h5 
          className="fw-bold" 
          style={{ 
            color: "#6a0572", 
            fontFamily: "'Baloo 2', cursive", 
            fontSize: "1.5rem" 
          }}
        >
          About Us
        </h5>
        <p style={{ fontSize: "0.90rem", color: "#4b2e2e" }}>
          Scooping happiness since day one! 🍨  
          We craft fresh dairy and milkshake products full of flavor, fun, and love.  
        </p>
      </div>

      {/* Links */}
      <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
        <h5 
          className="fw-bold" 
          style={{ 
            color: "#6a0572", 
            fontFamily: "'Baloo 2', cursive", 
            fontSize: "1.5rem" 
          }}
        >
          Quick Links
        </h5>
        <ul className="list-unstyled mb-0">
          <li><a href="/" className="text-dark text-decoration-none">🏠 Home</a></li>
          <li><a href="/products" className="text-dark text-decoration-none">🍦 Products</a></li>
          <li><a href="/about" className="text-dark text-decoration-none">📖 About</a></li>
          <li><a href="/contact" className="text-dark text-decoration-none">📩 Contact</a></li>
        </ul>
      </div>

      {/* Contact */}
      <div className="col-lg-4 col-md-12 mb-4 mb-md-0">
        <h5 
          className="fw-bold" 
          style={{ 
            color: "#6a0572", 
            fontFamily: "'Baloo 2', cursive", 
            fontSize: "1.5rem" 
          }}
        >
          Contact
        </h5>
        <p style={{ fontSize: "0.90rem", color: "#4b2e2e" }}>
          📍 123 Dairy Street, Bangalore <br />
          📞 +91 98765 43210 <br />
          ✉️ diary@gmail.com
        </p>
      </div>
    </div>
  </div>

  {/* Bottom bar */}
  <div 
    className="text-center p-3 fw-bold" 
    style={{ 
      background: "rgba(255, 255, 255, 0.7)", 
      color: "#6a0572", 
      fontFamily: "'Baloo 2', cursive" 
    }}
  >
    © {new Date().getFullYear()} Diary 🍧 | All rights reserved.
  </div>
</footer>
        
        </>


    )
}