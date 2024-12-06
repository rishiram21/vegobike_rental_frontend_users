import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import BikeList from "./components/BikeList";
import HomePage from "./components/HomePage";
import BikeDetailsPage from "./components/BikeDetailsPage"; // Bike Details Page
import ProfilePage from "./components/ProfilePage"; // Profile Page
import OrdersPage from "./components/OrdersPage"; // Orders Page
import { FaWhatsapp } from "react-icons/fa";
import LoadingPage from "./components/LoadingPage"; // Loading Page
import Footer from "./components/Footer";
import CheckoutPage from "./components/CheckoutPage";

// Wrapper to conditionally render the Navbar
const ConditionalNavbar = ({ children }) => {
  const location = useLocation();

  // Define routes where Navbar should be hidden
  const hideNavbarRoutes = ["/"]; // Add other routes if needed
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      {children}
    </>
  );
};

// Floating WhatsApp Icon Component
const WhatsAppIcon = () => {
  return (
    <a
      href="https://wa.me/1234567890" // Replace with your actual WhatsApp number
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition duration-300"
    >
      <FaWhatsapp className="text-2xl" />
    </a>
  );
};

// Main App Component
const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading time of 3 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    // Cleanup the timer
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      {isLoading ? (
        // Show the loading page while loading
        <LoadingPage />
      ) : (
        <ConditionalNavbar>
          <Routes>
            {/* Home Page Route */}
            <Route path="/" element={<HomePage />} />

            {/* Hero Page Route */}
            <Route
              path="/hero"
              element={
                <>
                  <BikeList />
                </>
              }
            />

            {/* Bike Details Page Route */}
            <Route path="/bike-details" element={<BikeDetailsPage />} />

            {/* Profile Page Route */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* Orders Page Route */}
            <Route path="/orders" element={<OrdersPage />} />

            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
          {/* Floating WhatsApp Icon */}
          <WhatsAppIcon />
          <Footer/>
        </ConditionalNavbar>
      )}
    </Router>
  );
};

export default App;
