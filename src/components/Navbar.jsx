import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaCaretDown, FaPhoneAlt, FaMapMarkerAlt, FaBars } from "react-icons/fa";
import { AiOutlineCalendar } from "react-icons/ai";
import { Menu } from "@headlessui/react";
import { useGlobalState } from "../context/GlobalStateContext"; // Correct import

const Navbar = () => {
  const { formData, setFormData } = useGlobalState(); // Access global state for location and dates
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar visibility

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <nav className="bg-orange-600 text-white shadow-lg p-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* Logo and Location */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link to="/" className="text-2xl font-bold text-white">
            OKBikes
          </Link>

          {/* Mobile Hamburger Icon for Sidebar */}
          <div className="md:hidden">
            <FaBars
              onClick={toggleSidebar}
              className="text-white text-2xl cursor-pointer"
            />
          </div>
        </div>

        {/* Date and Time Inputs (Centered on mobile) */}
        <div className="flex flex-col md:flex-row items-center w-full md:w-auto space-y-4 md:space-y-0 md:space-x-6 mx-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Pickup</label>
            <div className="relative flex items-center w-full md:w-auto">
              <AiOutlineCalendar className="absolute left-3 text-white" />
              <input
                type="datetime-local"
                className="pl-10 pr-3 py-2 border rounded-md text-sm w-full md:w-auto bg-white text-black"
                value={formData.startDate}
                name="startDate"
                onChange={handleDateChange}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Dropoff</label>
            <div className="relative flex items-center w-full md:w-auto">
              <AiOutlineCalendar className="absolute left-3 text-white" />
              <input
                type="datetime-local"
                className="pl-10 pr-3 py-2 border rounded-md text-sm w-full md:w-auto bg-white text-black"
                value={formData.endDate}
                name="endDate"
                onChange={handleDateChange}
              />
            </div>
          </div>
        </div>

        {/* Phone Number (Hidden on mobile) */}
        <div className="hidden md:flex items-center space-x-4">
          <FaPhoneAlt size={20} className="text-white" />
          <div className="text-sm text-white">+1 234 567 890</div>
        </div>

        {/* Profile Dropdown (Desktop: Profile Logo) */}
        <div className="relative flex items-center space-x-4">
          {/* Desktop Profile Logo */}
          <Menu as="div" className="hidden md:block relative">
            <Menu.Button className="flex items-center text-lg text-white hover:text-orange-400 transition duration-300">
              <FaUser className="mr-1" />
              <FaCaretDown className="ml-2" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/profile"
                    className={`block px-4 py-2 text-base text-gray-700 ${active ? "bg-gray-100" : ""}`}
                  >
                    My Profile
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/orders"
                    className={`block px-4 py-2 text-base text-gray-700 ${active ? "bg-gray-100" : ""}`}
                  >
                    Bookings
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/contactus"
                    className={`block px-4 py-2 text-base text-gray-700 ${active ? "bg-gray-100" : ""}`}
                  >
                    Contact Us
                  </Link>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </div>

      {/* Sidebar for Mobile View with Smooth Animation */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-all transform ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ transition: "transform 0.3s ease-in-out" }}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={toggleSidebar}
            className="text-white text-3xl"
            aria-label="Close Sidebar"
          >
            &times;
          </button>
        </div>
        <div className="flex flex-col items-center bg-white text-gray-700 py-4">
          <Link
            to="/profile"
            onClick={toggleSidebar}
            className="block px-4 py-2 text-base w-full text-center hover:bg-orange-600 hover:text-white transition duration-200"
          >
            My Profile
          </Link>
          <Link
            to="/orders"
            onClick={toggleSidebar}
            className="block px-4 py-2 text-base w-full text-center hover:bg-orange-600 hover:text-white transition duration-200"
          >
            Bookings
          </Link>
          <Link
            to="/contactus"
            onClick={toggleSidebar}
            className="block px-4 py-2 text-base w-full text-center hover:bg-orange-600 hover:text-white transition duration-200"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
