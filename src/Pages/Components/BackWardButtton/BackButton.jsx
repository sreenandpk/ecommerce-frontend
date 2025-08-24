import { useNavigate } from "react-router-dom";

export default function BackButton(){

const navigate=useNavigate()

return (

<>


   <button
        className="btn rounded-pill px-4 py-2 d-flex align-items-center justify-content-center shadow-sm mt-5 mx-5"
        style={{
          background: "linear-gradient(135deg, #6c757d, #495057)",
          color: "white",
          fontWeight: "600",
          fontSize: "16px",
         width:'100px',
         height:'30px',
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
        }}onClick={function(){
          navigate(-1)
        }}
      >
        Back
      </button>

</>



)




}