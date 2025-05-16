// import React, { createContext, useState, useContext, useEffect } from "react";
 
// const AuthContext = createContext();
 
// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
//   const [authMode, setAuthMode] = useState("login"); // "login" or "register"
//   const [token, setToken] = useState(localStorage.getItem("jwtToken") || null);
 
//   useEffect(() => {
//     if (token) {
//       setIsAuthenticated(true);
//     } else {
//       setIsAuthenticated(false);
//     }
//   }, [token]);
 
//   const login = (jwtToken) => {
//     localStorage.setItem("jwtToken", jwtToken);
//     setToken(jwtToken);
//   };
 
//   const logout = () => {
//     localStorage.removeItem("jwtToken");
//     setToken(null);
//   };
 
//   const openAuthModal = (mode = "login") => {
//     setAuthMode(mode);
//     setIsAuthModalOpen(true);
//   };
 
//   const closeAuthModal = () => {
//     setIsAuthModalOpen(false);
//   };
 
//   return (
//     <AuthContext.Provider
//       value={{
//         isAuthenticated,
//         login,
//         logout,
//         isAuthModalOpen,
//         openAuthModal,
//         closeAuthModal,
//         authMode,
//         token,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };
 
// export const useAuth = () => useContext(AuthContext);
 
 import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("jwtToken"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // Keep isAuthenticated in sync
  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  const login = (jwtToken) => {
    localStorage.setItem("jwtToken", jwtToken);
    setToken(jwtToken); // This will trigger useEffect and re-render context
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    setToken(null);
  };

  const openAuthModal = (mode = "login") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        login,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
