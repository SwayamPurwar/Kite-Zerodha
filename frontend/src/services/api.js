import axios from "axios";
import { API_URL } from "../config"; // Import correctly
// Fixed the API URL to match your backend index.js routing


export const getHoldings = async () => {
  try {
    const token = localStorage.getItem("token");
    
    // Add the headers to the request
    const response = await axios.get(`${API_URL}/allHoldings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching holdings", error);
    throw error;
  }
};