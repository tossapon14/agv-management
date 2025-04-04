import API from "../api/axiosInstance";
import APILogin from "./axiosLogin";
const axiosGet = async (endpoint: string) => {
    const response = await API.get(endpoint);
    return response.data;
};
const axiosPost = async (endpoint: string,body: { [key: string]: any; }) => {
   
      const response = await API.post(endpoint,body);
      return response.data;
  };
  const axiosPut = async (endpoint: string,body?: { [key: string]: any; }) => {
    
      const response = await API.put(endpoint,body);
      return response.data;
    
  };
  const axiosLogin = async (endpoint: string,body: { [key: string]: any; }) => {
    try {
      const response = await APILogin.post(endpoint,body);
      return response.data;
    } catch (error) {
      // console.error("Error fetching data", error);
      return error;
    }
  };
export { axiosGet, axiosPost,axiosLogin,axiosPut};