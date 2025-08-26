import { useEffect, useState } from "react";
import axios from "axios";
import registerAnimation from "../../../jsonAnimation/Register.json"
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";


 function Register(){
     const savedUser=JSON.parse(localStorage.getItem("existingUser"));
    const [name,setName]=useState("")
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const [confirmPassword,setConfirmPassword]=useState("");
    const [error,setError]=useState("");
    const [showPassword,setShowPassword]=useState(false);

const navigate=useNavigate()
    const cart=[];
    const wishlist=[];
    const recentlyViewed=[];
    const myOrders=[];
    const booking=[];
        
    useEffect(function(){
   

    if(savedUser){
      navigate("/")
    }

  },[])



    const submit= async function(event){

        event.preventDefault();
        setError("")

        try{

            const regEx=/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#!%&])(?=.*\d).{8,}$/

            if(!regEx.test(password)){
                setError("Password must include small letter, capital letter, digit, and special character");
                return;
            }

            if(confirmPassword!==password) {
                setError("password and cofirm password must be same");
                return;
            }
            

         const existing=await axios.get(`http://localhost:5000/users?email=${email}`);

           if(existing.data.length>0){
            setError("user with this email olready exist");
            return;
           }

         
           

        await axios.post("http://localhost:5000/users",{name,email,password,cart,wishlist,recentlyViewed,myOrders,booking});
       
       
        setEmail("");
        setName("")
        setPassword("")
        setConfirmPassword("");
       console.log("registraion success");
       setError("");
       navigate("/login")
        }catch{
            setError("Error registoring user");
        }

    }
    
    

    return(
   <>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "20px",
    
    }}
  >
    {/* Animation */}
    <div style={{ maxWidth: "220px", marginBottom: "20px" }}>
      <Lottie animationData={registerAnimation} loop={true} />
    </div>

    {/* Error */}
    {error && (
      <p style={{ color: "red", fontWeight: "bold", marginBottom: "10px" }}>
        {error}
      </p>
    )}

    {/* Form */}
    <form
      onSubmit={submit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        maxWidth: "400px",
        width: "100%",
        padding: "25px",
        borderRadius: "12px",
        backgroundColor: "white",
        boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#333", marginBottom: "10px" }}>
        ✨ Register
      </h2>

      <input
        type="text"
        required
        onChange={(e) => setName(e.target.value)}
        value={name}
        placeholder="Type your name"
        style={{
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "14px",
        }}
      />

      <input
        type="email"
        required
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        placeholder="Email"
        style={{
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "14px",
        }}
      />

      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type={showPassword ? "text" : "password"}
          required
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="Password"
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#f0f0f0",
            cursor: "pointer",
          }}
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>

      <input
        type="password"
        required
        onChange={(e) => setConfirmPassword(e.target.value)}
        value={confirmPassword}
        placeholder="Confirm password"
        style={{
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "14px",
        }}
      />

      <button
        type="submit"
        style={{
          padding: "12px",
          borderRadius: "8px",
          border: "none",
          background: "linear-gradient(135deg, #2b2726ff, #1d1d1eff)",
          color: "white",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "0.3s",
        }}
        onMouseOver={(e) => (e.target.style.opacity = "0.9")}
        onMouseOut={(e) => (e.target.style.opacity = "1")}
      >
         Register
      </button>
    </form>
  </div>
</>

        
    )



 }

 export default Register;