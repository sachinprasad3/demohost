import axiosInstance from "../utills/axiosInstance";
import { getCookie } from "../utills/cookies";


export const signupAPI = async (userData) => {
  try {
    const response = await axiosInstance.post("/api/v1/auth/signup", userData);
    console.log("Signup response:", response.data); // Debugging log
    return response;
  } catch (error) {
    // Logging full error in dev for debugging
    console.log("Error while signing up",error)
     const backendMessage = error.response?.data?.data?.errorMessage || "Something went wrong"

     throw new Error(backendMessage);

    // if (import.meta.env.DEV) {
    //   console.error("Signup Error:", error);
    // }

    // // Handle structured server errors (e.g., validation errors)
    // const status = error.response?.status;
    // const data = error.response?.data;

    // if (status === 400 && data?.errors) {
    //   // Validation error format (e.g., from Express Validator or DTO)
    //   throw {
    //     type: "validation",
    //     message: data.message || "Validation failed",
    //     fieldErrors: data.errors || {}, // assume { email: "Invalid email" }
    //   };
    // }

    // if (status === 409) {
    //   // Conflict error: email already registered, etc.
    //   throw {
    //     type: "conflict",
    //     message: data.message || "Email already exists",
    //   };
    // }

    // if (status >= 500) {
    //   // Server crashed or failed
    //   throw {
    //     type: "server",
    //     message: "Internal server error. Please try again later.",
    //   };
    // }

    // if (error.message === "Network Error") {
    //   throw {
    //     type: "network",
    //     message: "Unable to connect. Please check your internet connection.",
    //   };
    // }

    // // Fallback generic error
    // throw {
    //   type: "unknown",
    //   message: data?.message || error.message || "Signup failed",
    // };
  }
};




export const loginAPI = async (username, password) => {
  try {
    const response = await axiosInstance.post("/api/v1/auth/login", { username, password });
    console.log("response from loginApi",response)
    return response.data;
  } catch (error) {
    console.log("login error", error)
    if(error.response?.data?.data?.errorMessage === "Bad credentials"){
      throw new Error("UserId is not registered")
    }
    else if(error.response?.data?.data?.errorMessage === "User is disabled"){
      throw new Error("User is disabled. Please contact admin.")
    }
    const message = error || "Login failed";
    throw new Error(message);
  }
};


export const pinLoginAPI = async ({ username, pin,refreshToken }) => {
  try {
    const response = await axiosInstance.post("/api/v1/auth/pin-login", {
      username,
      pin,
    }, { headers: { Authorization: `Bearer ${refreshToken}` } });
    
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.data?.errorMessage ||
      error.response?.data?.message ||
      "PIN login failed";
    throw new Error(message);
  }
};





export const setPinAPI = async ({ username, pin }) => {
  try {
    const refreshToken = getCookie("refresh_token");
    if (!refreshToken) throw new Error("Authorization token is missing");
    
   // Debugging log
    const res = await axiosInstance.post(
      "/api/v1/auth/setup-pin",
      { username, pin },
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`, // REQUIRED
        },
      }
    );

    return res.data;
  } catch (error) {
    const message = error?.response?.data?.message || "Setting PIN failed";
    throw new Error(message);
  }
};





export const parseToken = (token) => {
  try {
    if (!token || token.split(".").length !== 3) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};
