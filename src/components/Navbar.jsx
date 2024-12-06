import React from "react";
import { Menu } from "@headlessui/react";
import { FaUser, FaPhoneAlt } from "react-icons/fa";
import { AiOutlineCalendar } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white text-gray-800 shadow-lg p-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <h1
            className="text-2xl font-bold text-green-600 cursor-pointer"
            onClick={() => navigate("/")}
          >
            OkBikes
          </h1>
          <div className="text-sm text-gray-600 flex items-center">
            <span>Pune</span>
          </div>
        </div>


        {/* Location and Time Inputs */}
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Pickup Date & Time</label>
            <div className="relative flex items-center">
              <AiOutlineCalendar className="absolute left-3 text-gray-500" />
              <input
                type="datetime-local"
                className="pl-10 pr-3 py-2 border rounded-md text-sm"
                defaultValue="2024-11-23T13:00"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Dropoff Date & Time</label>
            <div className="relative flex items-center">
              <AiOutlineCalendar className="absolute left-3 text-gray-500" />
              <input
                type="datetime-local"
                className="pl-10 pr-3 py-2 border rounded-md text-sm"
                defaultValue="2024-11-24T13:00"
              />
            </div>
          </div>
        </div>

        {/* Call Icon with Phone Number
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <FaPhoneAlt className="text-green-500" />
          <span className="text-lg font-medium">+91 98765 43210</span>
        </div> */}

        
       
        {/* Profile Dropdown */}
        <Menu as="div" className="relative mt-4 md:mt-0">
          <Menu.Button className="flex items-center text-lg hover:text-green-500 transition duration-300 ml-6">
            <FaUser className="mr-1" />
            Profile
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
                  to="screens/About"
                  className={`block px-4 py-2 text-base text-gray-700 ${
                    active ? "bg-gray-100" : ""
                  }`}
                >
                  Aboutus
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
                  Contactus
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => alert("Logged out")}
                  className={`block w-full text-left px-4 py-2 text-base text-gray-700 ${
                    active ? "bg-gray-100" : ""
                  }`}
                >
                  Logout
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>
    </nav>
  );
};

export default Navbar;
