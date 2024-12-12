// context/GlobalStateContext.jsx

import React, { createContext, useContext, useState } from "react";

// Create a context
const GlobalStateContext = createContext();

// Provider Component
export const GlobalStateProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    location: "",
    startDate: "",
    endDate: "",
  });

  return (
    <GlobalStateContext.Provider value={{ formData, setFormData }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Custom hook to use global state
export const useGlobalState = () => {
  return useContext(GlobalStateContext);
};
