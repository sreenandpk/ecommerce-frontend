import axios from "axios";

const BASE_URL = "http://localhost:5000"; // keep one place for easy change


// For fetching products by search term
export async function fetchProducts(query="") {
  try {
    const res = await axios.get(`${BASE_URL}/products?name=${query}`);
    return res.data;
  } catch {
    console.log("error while fetching products");
    return [];
  }
}

// GET single product by ID
export async function fetchProductById(id) {
  try {
    const res = await axios.get(`${BASE_URL}/products/${id}`);
    return res.data;
  } catch {
    console.log("error while fetching product by id");
    return null;
  }
}

// GET
export const fetchUser = async (userId) => {
  try {
    const res = await axios.get(`${BASE_URL}/users/${userId}`);
    return res.data;
  } catch {
    console.log("error in fetching user");
  }
};

// PATCH
export const updateUser = async (userId, data) => {
  try {
    const res = await axios.patch(`${BASE_URL}/users/${userId}`, data);
    return res.data;
  } catch {
    console.log("error while updating user");
  }
};





// GET cities
export async function fetchAvailableCitiesFromDb() {
  try {
    const res = await axios.get(`${BASE_URL}/available_cities`);
    return res.data;
  } catch {
    console.log("error while fetching cities");
    return null;
  }
}


// GET pincode
export async function fetchAvailablePincodeFromDb() {
  try {
    const res = await axios.get(`${BASE_URL}/available_pincode`);
    return res.data;
  } catch {
    console.log("error while fetching cities");
    return null;
  }
}




export const fetchUserLogin = async (email,password) => {
  try {
    const res = await axios.get(`${BASE_URL}/users/?email=${email}&password=${password}`);
    return res;
  } catch {
    console.log("error in fetching user");
  }
};