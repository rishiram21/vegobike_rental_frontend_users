import React, { createContext, useContext, useState, useEffect } from "react";

// Create a context
const GlobalStateContext = createContext();

// Provider Component
export const GlobalStateProvider = ({ children }) => {
  // Initialize state with localStorage data if available
  const [formData, setFormData] = useState(() => {
    const storedData = localStorage.getItem("formData");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        return parsedData;
      } catch (error) {
        console.error("Error parsing formData from localStorage:", error);
      }
    }
    // Default values if no localStorage data exists
    return {
      location: "",
      cityId: "",
      startDate: "",
      endDate: "",
    };
  });

  // New state for orders, also initialize from localStorage if available
  const [orders, setOrders] = useState(() => {
    const storedOrders = localStorage.getItem("orders");
    if (storedOrders) {
      try {
        return JSON.parse(storedOrders);
      } catch (error) {
        console.error("Error parsing orders from localStorage:", error);
      }
    }
    return [];
  });

  // New state for user data, initialize from localStorage if available
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
    return null;
  });

  // Save formData to localStorage whenever it changes
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      localStorage.setItem("formData", JSON.stringify(formData));
    }
  }, [formData]);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (orders && orders.length > 0) {
      localStorage.setItem("orders", JSON.stringify(orders));
    }
  }, [orders]);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("userData", JSON.stringify(user));
    }
  }, [user]);

  // Function to add a new order
  const addOrder = (order) => {
    setOrders((prevOrders) => [...prevOrders, order]);
  };

  return (
    <GlobalStateContext.Provider value={{ formData, setFormData, orders, addOrder, user, setUser }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Custom hook to use global state
export const useGlobalState = () => {
  return useContext(GlobalStateContext);
};

export default GlobalStateContext;
