import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import BikeListPage from "./pages/BikeListPage";
import HomePage from "./pages/HomePage"; // HomePage Component
import BikeDetailsPage from "./pages/BikeDetailsPage"; // Bike Details Page
import ProfilePage from "./pages/ProfilePage"; // Profile Page
import OrdersPage from "./pages/OrdersPage"; // Orders Page
import { FaWhatsapp } from "react-icons/fa";
import Footer from "./components/Footer";
import CheckoutPage from "./pages/CheckoutPage";
import { GlobalStateProvider } from "./context/GlobalStateContext";
import ContactUs from "./pages/ContactUs"; // Import ContactUs Component
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider

// Wrapper to conditionally render the Navbar
const ConditionalNavbar = ({ children }) => {
  const location = useLocation();

  // Define routes where Navbar should be hidden
  const hideNavbarRoutes = ["/"];

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
  return (
    <AuthProvider> {/* Wrap the entire app with AuthProvider */}
      <GlobalStateProvider> {/* Wrap the entire app with GlobalStateProvider */}
        <Router>
          <ConditionalNavbar>
            <Routes>
              {/* Default Route - HomePage will be shown at root "/" */}
              <Route path="/" element={<HomePage />} />

              {/* Hero Page Route */}
              <Route path="/bike-list" element={<BikeListPage />} />

              {/* Bike Details Page Route */}
              <Route path="/bike-details" element={<BikeDetailsPage />} />

              {/* Profile Page Route */}
              <Route path="/profile" element={<ProfilePage />} />

              {/* Orders Page Route */}
              <Route path="/orders" element={<OrdersPage />} />

              {/* Checkout Page Route */}
              <Route path="/checkout" element={<CheckoutPage />} />

              {/* Contact Us Page Route */}
              <Route path="/contactus" element={<ContactUs />} />

              {/* Catch-all for invalid routes */}
              <Route path="*" element={<div className="text-center mt-20">Page Not Found</div>} />
            </Routes>
            {/* Floating WhatsApp Icon */}
            <WhatsAppIcon />
            <Footer />
          </ConditionalNavbar>
        </Router>
      </GlobalStateProvider>
    </AuthProvider>
  );
};

export default App;
