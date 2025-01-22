import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaCaretDown, FaPhoneAlt, FaMapMarkerAlt, FaBars, FaContao, FaPhone, FaBook, FaRegBookmark, FaBiking, FaBitbucket } from "react-icons/fa";
import { AiOutlineCalendar } from "react-icons/ai";
import { Menu } from "@headlessui/react";
import { useGlobalState } from "../context/GlobalStateContext";
import { TbBikeFilled } from "react-icons/tb";
import { FaBookSkull, FaPersonBiking } from "react-icons/fa6";

const Navbar = () => {
  const { formData, setFormData } = useGlobalState(); // Access global state for location and dates
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state

  // Load formData from localStorage on component mount
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("formData"));
    if (storedData) {
      setFormData(storedData);
    }
  }, [setFormData]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar visibility

  // Format date and time to dd/mm/yyyy hh:mm
  const formatDate = (datetime) => {
    if (!datetime) return "N/A";
    const date = new Date(datetime);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <nav className="bg-orange-600 text-white shadow-lg p-4 relative z-50 sticky top-0 z-[100]">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* Logo */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link to="/" className="text-2xl font-bold text-white">
            OKBikes
          </Link>
        </div>

        {/* Display Date and Time */}
        <div className="flex flex-col md:flex-row items-center text-center space-y-2 md:space-y-0">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Pickup:</label>
            <div className="text-sm bg-white text-black px-4 py-2 border rounded">
              {formatDate(formData.startDate)}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium">Dropoff:</label>
            <div className="text-sm bg-white text-black px-4 py-2 border rounded">
              {formatDate(formData.endDate)}
            </div>
          </div>
        </div>

        {/* Hamburger Button for Mobile View */}
        <div className="md:hidden flex items-center absolute right-4 top-0">
          <button
            onClick={toggleSidebar}
            className="text-white text-3xl"
            aria-label="Open Sidebar"
          >
            <FaBars />
          </button>
        </div>

        {/* Phone Number */}
        <div className="hidden md:flex place-items-end space-x-4">
          <FaPhoneAlt size={20} className="text-white" />
          <div className="text-sm place-items-end text-white">+919545237823</div>
        </div>

        {/* Profile Dropdown */}
        <div className="relative hidden md:flex items-center space-x-4">
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center text-lg text-white hover:text-orange-400 transition duration-300">
              <FaUser className="mr-1" />
              <FaCaretDown className="ml-2" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white shadow-lg py-2 rounded-lg overflow-hidden">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/profile"
                    className={`block px-4 py-3 text-base text-gray-800 ${active ? "bg-orange-100" : ""}`}
                  >
                    <span className="flex items-center space-x-2">
                      <FaUser className="text-orange-400" />
                      <span>My Profile</span>
                    </span>
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/orders"
                    className={`block px-4 py-3 text-base text-gray-800 ${active ? "bg-orange-100" : ""}`}
                  >
                    <span className="flex items-center space-x-2">
                      <FaCaretDown className="text-orange-400" />
                      <span>Bookings</span>
                    </span>
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/contactus"
                    className={`block px-4 py-3 text-base text-gray-800 ${active ? "bg-orange-100" : ""}`}
                  >
                    <span className="flex items-center space-x-2">
                      <FaMapMarkerAlt className="text-orange-400" />
                      <span>Contact Us</span>
                    </span>
                  </Link>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </div>

      {/* Sidebar for Mobile View */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-all transform"
          style={{ transition: "transform 0.3s ease-in-out" }}
        >
          <div className="flex flex-col items-center bg-white text-gray-700 py-4 w-3/4 h-full">
            <button
              onClick={toggleSidebar}
              className="text-black text-3xl mb-4"
              aria-label="Close Sidebar"
            >
              &times;
            </button>
            <Link
              to="/profile"
              onClick={toggleSidebar}
              className="block px-4 py-2 text-base w-full text-center hover:bg-orange-600 hover:text-white transition duration-200"
            >
              <span className="flex items-center justify-center space-x-2">
                <FaUser className="text-orange-400" />
                <span>My Profile</span>
              </span>
            </Link>
            <Link
              to="/orders"
              onClick={toggleSidebar}
              className="block px-4 py-2 text-base w-full text-center hover:bg-orange-600 hover:text-white transition duration-200"
            >
              <span className="flex items-center justify-center space-x-2">
                <TbBikeFilled   className="text-orange-400" />
                <span>Bookings</span>
              </span>
            </Link>
            <Link
              to="/contactus"
              onClick={toggleSidebar}
              className="block px-4 py-2 text-base w-full text-center hover:bg-orange-600 hover:text-white transition duration-200"
            >
              <span className="flex items-center justify-center space-x-2">
                <FaPhoneAlt className="text-orange-400" />
                <span>Contact Us</span>
              </span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
