/* eslint-disable no-unused-vars */
import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const [message, setMessage] = useState("");
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
      } else {
        setUser({ id: decodedToken.id });
      }
    }
  }, []);
  const signup = async (name, email, password) => {
    try {
      const res = await fetch(`${apiUrl}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw new Error("Signup failed: " + error.message);
    }
  };
  const login = async (email, password) => {
    console.log("Login attempt:", { email, password });
    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setMessage("Login successful! Welcome back!");
      } else {
        if (data.message === "User not found") {
          throw new Error("User not found");
        } else if (data.message === "Invalid credentials") {
          throw new Error("Invalid credentials");
        } else {
          throw new Error(data.message);
        }
      }
    } catch (error) {
      throw new Error("Login failed: " + error.message);
    }
  };
  const checkUserExists = async (email, mobile) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/check-user-exist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, mobile }),
      });
      const data = await response.json();
      return response.ok;
    } catch (error) {
      return false;
    }
  };
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setMessage("");
    alert("You have been logged out.");
  };
  const clearMessage = () => setMessage("");
  return (
    <AuthContext.Provider
      value={{
        user,
        message,
        signup,
        login,
        logout,
        clearMessage,
        checkUserExists,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
const useAuth = () => {
  return useContext(AuthContext);
};
export { AuthContext, AuthProvider, useAuth };
