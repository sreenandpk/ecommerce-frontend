
import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";


       

 function Home(){
    const [savedUser,setSavedUser]=useState(JSON.parse(localStorage.getItem("existingUser")));
   
  
    const navigate=useNavigate();

    useEffect(function(){
        setSavedUser(JSON.parse(localStorage.getItem("existingUser")));
    },[])

    return(


        <>

        


 <h1>home page</h1>
        <button onClick={function(){
            if(!savedUser){
               navigate("/login")
            }
           else{
            localStorage.removeItem("existingUser");
            setSavedUser(null);
            navigate("/login")
           }
        }}>{savedUser?"logout":"login"}</button>
        

        <button onClick={function(){
             if(!savedUser){
                alert("please login first");
                navigate("/login")
                return;
            }
            else{
                alert("orderd succefully")
            }
        }}>buy now</button>

        
        

       
        </>


    )


 };

 export default Home;