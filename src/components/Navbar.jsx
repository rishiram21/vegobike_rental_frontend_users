import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaCaretDown, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import { AiOutlineCalendar } from "react-icons/ai";
import { Menu } from "@headlessui/react";
import { useGlobalState } from "../context/GlobalStateContext"; // Correct import

const Navbar = () => {
  const { formData, setFormData } = useGlobalState(); // Access global state for location and dates
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <nav className="bg-white text-gray-800 shadow-lg p-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* Logo and Location */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link to="/" className="text-2xl font-bold text-green-600">
            OKBikes
          </Link>
          <div className="hidden md:flex text-sm text-gray-600 items-center ml-4">
            <FaMapMarkerAlt className="mr-2 text-gray-500" />
            <Link to="/" className="hover:underline">
              {formData.location || "Select Location"}
            </Link>
          </div>
        </div>

        {/* Date and Time Inputs */}
        <div className="flex flex-col md:flex-row items-center w-full md:w-auto space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Pickup</label>
            <div className="relative flex items-center w-full md:w-auto">
              <AiOutlineCalendar className="absolute left-3 text-gray-500" />
              <input
                type="datetime-local"
                className="pl-10 pr-3 py-2 border rounded-md text-sm w-full md:w-auto"
                value={formData.startDate}
                name="startDate"
                onChange={handleDateChange}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Dropoff</label>
            <div className="relative flex items-center w-full md:w-auto">
              <AiOutlineCalendar className="absolute left-3 text-gray-500" />
              <input
                type="datetime-local"
                className="pl-10 pr-3 py-2 border rounded-md text-sm w-full md:w-auto"
                value={formData.endDate}
                name="endDate"
                onChange={handleDateChange}
              />
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div className="hidden md:flex items-center space-x-4">
          <FaPhoneAlt size={20} className="text-gray-600" />
          <div className="text-sm text-gray-600">+1 234 567 890</div>
        </div>

        {/* Profile Dropdown */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center text-lg hover:text-green-500 transition duration-300">
            <FaUser className="mr-1" />
            Profile <FaCaretDown className="ml-2" />
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2">
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/profile"
                  className={`block px-4 py-2 text-base text-gray-700 ${
                    active ? "bg-gray-100" : ""
                  }`}
                >
                  My Profile
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/orders"
                  className={`block px-4 py-2 text-base text-gray-700 ${
                    active ? "bg-gray-100" : ""
                  }`}
                >
                  Bookings
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/contactus"
                  className={`block px-4 py-2 text-base text-gray-700 ${
                    active ? "bg-gray-100" : ""
                  }`}
                >
                  Contact Us
                </Link>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>
    </nav>
  );
};

export default Navbar;
