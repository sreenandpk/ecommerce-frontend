import { useState } from "react";
import axios from "axios";


 function Register(){

    const [name,setName]=useState("")
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const [confirmPassword,setConfirmPassword]=useState("");
    const [error,setError]=useState("");
    const [showPassword,setShowPassword]=useState(false);

    
    const cart=[];
    const wishlist=[];

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

         
           

        await axios.post("http://localhost:5000/users",{name,email,password,cart,wishlist});
       
       
        setEmail("");
        setName("")
        setPassword("")
        setConfirmPassword("");
       console.log("registraion success");
       setError("");
        }catch{
            setError("Error registoring user");
        }

    }
    
    

    return(
        <>
        {error&&<p>{error}</p>}
        <form onSubmit={submit}  style={{
    display: "flex",
    flexDirection: "column",
    gap: "12px",          // space between inputs
    maxWidth: "400px",    // keeps form from being too wide
    width: "90%",         // responsive width
    margin: "0 auto",     // center horizontally
    padding: "16px",
    boxSizing: "border-box",
  }}>
        <input type="text" required onChange={function(event){
          setName(event.target.value)}} value={name} placeholder="Type your name"></input>

        <input type="email" required onChange={function(event){
            setEmail(event.target.value)
        }} value={email} placeholder="email"></input>

        <input type={showPassword?"text":"password"} required onChange={function(event){
            setPassword(event.target.value)
        }} value={password} placeholder="password"></input>


         <button onClick={function(){
        if(!showPassword) setShowPassword(true);
        else setShowPassword(false);
           
         }} type="button">see</button>


        <input type="password" required onChange={function(event){
            setConfirmPassword(event.target.value)
        }} value={confirmPassword} placeholder="confirm password"></input>

        <button type="submit">Register</button>
        </form>

        
        </>
        
    )



 }

 export default Register;