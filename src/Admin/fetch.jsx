
import axios from "axios";

const BASE_URL = "http://localhost:5000";


export const fetchUsers=async function(){
    const response=await axios.get(`${BASE_URL}/users`);
    return response.data
}



export const updateUser=async function(id,change){
    await axios.patch(`${BASE_URL}/users/${id}`,change)
}


export const fetchAllProducts=async function(){
    const res=await axios.get(`${BASE_URL}/products`);
    return res.data;
}



export const updateProducts=async function(id,data){
    await axios.patch(`${BASE_URL}/products/${id}`,data);
}

export const deleteProductFromDb = async function(id) {
  await axios.delete(`${BASE_URL}/products/${id}`);
};

export const updateOrders=async function(data){
    await axios.patch(`${BASE_URL}/orders`,{data});
}





export const updateUserPayment = async function(userId, razorpayId, change) {
  // fetch the user first
  const { data: user } = await axios.get(`${BASE_URL}/users/${userId}`);

  // update the specific payment
  const updatedPayments = user.payment.map(p =>
    p.razorpayId === razorpayId ? { ...p, ...change } : p
  );

  // patch the user with updated payment array
  await axios.patch(`${BASE_URL}/users/${userId}`, { payment: updatedPayments });
}





export const addProductsToDb=async function(data){
    await axios.post(`${BASE_URL}/products`,data);
}
