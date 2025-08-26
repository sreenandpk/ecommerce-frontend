import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useContext, useState } from "react";
import { SearchContext } from "../SearchContext/SearchContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { fetchAvailableCitiesFromDb ,fetchAvailablePincodeFromDb, updateUser} from "../Fetch/FetchUser";
export default function BookingPage() {



const [availableCities,setAvalableCities]=useState([]);

const [pincode,setPincode]=useState("")

const [fullName,setFullName]=useState("");

const [address,setAddress]=useState("");

const [phoneNo,setPhoneNo]=useState("");

  const { bookingProducts } = useContext(SearchContext);
  const navigate=useNavigate();
  // Calculate total price
  const totalPrice = bookingProducts
    ? bookingProducts.reduce(
        (sum, item) => sum + (item.quantity || 1) * item.price,
        0
      )
    : 0;
     useEffect(() => {
    if (!bookingProducts || bookingProducts.length === 0) {
      navigate("/cart",{replace:true});
    }
  }, [bookingProducts, navigate]);
  
  if (!bookingProducts || bookingProducts.length === 0) return null; // avoid flicker



  useEffect(function(){
    async function fetchCities(){

      const cities=await fetchAvailableCitiesFromDb();
     if(cities){ setAvalableCities(cities)
    }
  else{
    setAvalableCities([])
  }
  }
    fetchCities()
  },[])



const handleSubmit=async function(event){
               event.preventDefault();
                // Allow only letters, numbers, spaces, comma, dot, and hyphen
  const regex = /^[a-zA-Z0-9\s,.-]+$/;
              if(!pincode){
                alert("select city");
                return;
              }
              else if(!fullName){
                alert("enter full name")
                return;
              }

             else if(!address){
                alert("fill address")
                return;
              }
              else if(!phoneNo){
                alert("enter phone number");
                return;
              }

              else if(phoneNo.length<10){
                alert("enter a valid phone number")
                return;
              }
              else if(!regex.test(address)){
                alert("Special characters are not allowed in address")
                 return ;
              }
                const options = { timeZone: 'Asia/Kolkata', hour12: true, hour: '2-digit', minute: '2-digit' };
                const istTime = new Intl.DateTimeFormat('en-US', options).format(new Date());
               const savedUser=JSON.parse(localStorage.getItem("existingUser"));
              
          
              const newBooking= {
                 id: Date.now().toString(),
                  name:fullName,
                  ph:phoneNo,
                  addr:address,
                  pin:pincode,
                  time:istTime,
                  deliveryTime:null,
                  products:bookingProducts,
                  payment:null
                }


             try{

                const updatedBookings = [...(savedUser.booking || []), newBooking];
                await updateUser(savedUser.id,{...savedUser,booking:updatedBookings}
                 
                )


                

                const updatedSavedUser={...savedUser,booking:updatedBookings}

                 localStorage.setItem("existingUser",JSON.stringify(updatedSavedUser));
                navigate(`/payment/${newBooking.id}`);
                 
                }catch{
                  alert("failed to update user booking details")
                }
                 }
            
                
                






  return (
    <div className="container my-5">
      {/* Title */}
      <h2 className="fw-bold text-center mb-4 text-dark">Book Your Order</h2>

      <div className="row g-4">
        {/* Left: Booking Form */}
        <div className="col-12 col-lg-6">
          <div
            className="card shadow-sm border-0 p-4 h-100"
            style={{ borderRadius: "15px" }}
          >
            <h5 className="fw-bold mb-3">Customer Details</h5>
            <form onSubmit={handleSubmit} >
              <div className="mb-3">
                <label className="form-label fw-semibold">Full Name</label>
                <input onChange={function(event){
                  setFullName(event.target.value)
                }}
                  type="text"
                  className="form-control"
                  placeholder="Enter your name"
                />
              </div>
        <div className="mb-3">
  <label className="form-label fw-semibold">Phone</label>
  <input
    type="tel"
    className="form-control"
    placeholder="Enter phone number"
    value={phoneNo}   // bind state here
    maxLength={10}    // limit to 10 digits
    onChange={(e) => setPhoneNo(e.target.value.replace(/\D/g, ""))}
  />
</div>




              <div className="mb-3">
            <label htmlFor="city">City</label>
         <select className="form-select w-100 text-truncate"id="city"onChange={function(event){
        
        const selectedCity=availableCities.find(function(city){
           return  city.name===event.target.value

            
        })
        
        
         // Set its pin code
        setPincode(selectedCity ? selectedCity.pin : "");
      }}>
   <option>Select</option>
       {availableCities.map((city) => (
        
   <option key={city.id} value={city.name} className="text-truncate">
  {city.name}
</option>

    ))}
  </select>
</div>




             
<div className="mb-3">
  <label htmlFor="pin" className="form-label fw-semibold">Pin Code</label>
  <input
    id="pin"
    type="text"
    className="form-control"
    value={pincode || ""}
    placeholder="Auto-filled pin code"
    readOnly
  />
</div>



        

              <div className="mb-3">
                <label className="form-label fw-semibold">Address</label>
                <textarea onChange={function(event){
                  setAddress(event.target.value)
                }}
                  className="form-control"
                  rows="2"
                  placeholder="Enter delivery address"
                ></textarea>
              </div>

              <button type="submit" className="btn btn-dark w-100 rounded-pill">
                Confirm Booking
              </button>
            </form>
          </div>
        </div>

        {/* Right: Booking Summary */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 p-4 h-100" style={{ borderRadius: "15px" }}>
            <h5 className="fw-bold mb-3">Order Summary</h5>
            {bookingProducts && bookingProducts.length > 0 ? (
              <>
                {bookingProducts.map((item, index) => (
                  <div
                    key={index}
                    className="d-flex justify-content-between align-items-center mb-2"
                  >
                    <span>
                   <img src={item.image}style={{height:'100px'}}></img>   {item.name} x {item.quantity || 1}
                    </span>
                    <span className="fw-semibold">₹{(item.quantity || 1) * item.price}</span>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">Total</span>
                  <span className="fw-bold text-success">₹{totalPrice}</span>
                </div>
              </>
            ) : (
              <p className="text-muted">No items in your booking.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
