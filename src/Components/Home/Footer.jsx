import { useNavigate } from "react-router-dom";
import emailjs from "emailjs-com"; // Make sure emailjs is installed: npm install emailjs-com
emailjs.init("1cqpSC26f-1LTA-Wk");
import { AiFillHome } from "react-icons/ai";       // Home icon
import { FaIceCream, FaMapMarkerAlt } from "react-icons/fa"; // Products / Location icon
import { MdInfo } from "react-icons/md";            // About / Info icon

export default function Footer() {
  const navigate = useNavigate();

  const footerLinks = [
    { label: "Home", path: "/", icon: <AiFillHome /> },
    { label: "Products", path: "/products", icon: <FaIceCream /> },
    { label: "About", path: "/about", icon: <MdInfo /> },
  ];

  const sendMail = (e) => {
    e.preventDefault();
    const params = {
      name: e.target.name.value,
      email: e.target.email.value,
      message: e.target.message.value,
    };
    const serviceID = "service_tc921ac";
    const templateID = "template_d59azpu";

    emailjs.send(serviceID, templateID, params)
      .then((res) => {
        e.target.reset();
        alert("Your message sent successfully!");
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <footer
        className="text-center text-lg-start"
        style={{ backgroundColor: "#efced5ce", fontFamily: "Poppins, sans-serif", paddingTop: "20px", paddingBottom: "20px" }}
      >
        <div className="container p-2">
          <div className="row">

            {/* About Section */}
            <div className="col-lg-4 col-md-6 mb-3 text-center text-md-start">
              <h5
                className="fw-bold"
                style={{ color: "#6a0572", fontFamily: "'Baloo 2', cursive", fontSize: "1.2rem", marginBottom: "0.5rem" }}
              >
                About Us
              </h5>
              <p style={{ fontSize: "0.9rem", color: "#4b2e2e", marginBottom: "0" }}>
                Scooping happiness since day one! 🍨 Fresh dairy and milkshake products full of flavor, fun, and love.
              </p>
            </div>

            {/* Quick Links */}
            <div className="col-lg-4 col-md-6 mb-3 text-center text-md-start">
              <h5
                className="fw-bold"
                style={{ color: "#6a0572", fontFamily: "'Baloo 2', cursive", fontSize: "1.2rem", marginBottom: "0.5rem" }}
              >
                Quick Links
              </h5>
              <ul className="list-unstyled mb-0">
                {footerLinks.map((link, i) => (
                  <li key={i} style={{ marginBottom: "6px" }}>
                    <span
                      onClick={() => navigate(link.path)}
                      className="footer-link"
                      style={{ fontFamily: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.95rem" }}
                    >
                      {link.icon} {link.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Form */}
            <div className="col-lg-4 col-md-12 mb-3 text-center text-md-start">
              <h5
                className="fw-bold"
                style={{ color: "#6a0572", fontFamily: "'Baloo 2', cursive", fontSize: "1.2rem", marginBottom: "0.5rem" }}
              >
                Contact
              </h5>
              <form onSubmit={sendMail}>
                <div className="mb-2">
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    placeholder="Your Name"
                    required
                    style={{ fontSize: "16px", padding: "5px 10px" }}
                  />
                </div>
                <div className="mb-2">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="Your Email"
                    required
                    style={{ fontSize: "16px", padding: "5px 10px" }}
                  />
                </div>
                <div className="mb-2">
                  <textarea
                    className="form-control"
                    id="message"
                    name="message"
                    rows="2"
                    placeholder="Your Message"
                    required
                    style={{ fontSize: "16px", padding: "5px 10px" }}
                  ></textarea>
                </div>
                <div className="text-center">
                  <button type="submit" className="btn-submit">
                    Send
                  </button>
                </div>
              </form>
            </div>

          </div>

          <p style={{ fontSize: "0.85rem", color: "#4b2e2e", display: "flex", alignItems: "center", gap: "5px", marginTop: "10px" }}>
            <FaMapMarkerAlt /> Kannur, Iritty, Kerala
          </p>
        </div>

        {/* Bottom bar */}
        <div
          className="text-center p-2 fw-bold"
          style={{ background: "rgba(255, 255, 255, 0.7)", color: "#6a0572", fontFamily: "'Baloo 2', cursive", fontSize: "0.85rem" }}
        >
          © {new Date().getFullYear()} Diary 🍧 | All rights reserved.
        </div>

        {/* Footer Styles */}
        <style>{`
          .footer-link {
            font-size: 0.95rem;
            color: #4b2e2e;
            cursor: pointer;
            transition: color 0.3s ease, transform 0.3s ease;
          }
          .footer-link:hover {
            color: #000000ff;
            transform: translateX(3px);
          }
         .btn-submit {
  width: 150px;
  height: 35px;
  border-radius: 25px;
  border: none;
  background: rgba(50, 30, 20, 0.85) !important;
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-submit:hover {
  background: rgba(50, 30, 20, 0.95) !important; /* darker on hover */
  transform: scale(1.05);
}

          @media (max-width: 768px) {
            .text-md-start { text-align: center !important; }
            .btn-submit { width: 100%; }
          }
        `}</style>
      </footer>
    </>
  );
}
