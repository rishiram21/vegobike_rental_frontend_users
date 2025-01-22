// context/GlobalStateContext.jsx
import React, { createContext, useContext, useState } from "react";

// Create a context
const GlobalStateContext = createContext();

// Provider Component
export const GlobalStateProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    location: "",
    cityId :"",
    startDate: "",
    endDate: "",
  });

  // New state for orders
  const [orders, setOrders] = useState([]);

  // Function to add a new order
  const addOrder = (order) => {
    setOrders((prevOrders) => [...prevOrders, order]);
  };

  return (
    <GlobalStateContext.Provider value={{ formData, setFormData, orders, addOrder }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Custom hook to use global state
export const useGlobalState = () => {
  return useContext(GlobalStateContext);
};
