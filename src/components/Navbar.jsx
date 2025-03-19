import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaPhoneAlt, FaBars, FaTimes, FaMotorcycle } from "react-icons/fa";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import { IoLocationOutline } from "react-icons/io5";
import { useGlobalState } from "../context/GlobalStateContext";

const Navbar = () => {
  const { formData, setFormData } = useGlobalState();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Create refs for the dropdown and button
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Load formData from localStorage on component mount
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("formData"));
    if (storedData && Object.keys(storedData).length > 0) {
      console.log("Loaded data from localStorage:", storedData);
      setFormData(storedData);
    } else {
      console.log("No data found in localStorage.");
      // Don't set empty data back to formData
    }

    // Add scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setFormData]);

  // Save formData to localStorage whenever it changes
  useEffect(() => {
    // Only save to localStorage if formData has actual content
    if (formData && Object.keys(formData).length > 0) {
      console.log("Saving data to localStorage:", formData);
      localStorage.setItem("formData", JSON.stringify(formData));
    }
  }, [formData]);

  // Add click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isProfileDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutsideMobileMenu = (event) => {
      if (isMobileMenuOpen) {
        const mobileMenuArea = document.getElementById('mobile-menu-area');
        const menuToggle = document.getElementById('mobile-menu-toggle');

        if (
          mobileMenuArea &&
          !mobileMenuArea.contains(event.target) &&
          menuToggle &&
          !menuToggle.contains(event.target)
        ) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutsideMobileMenu);
    document.addEventListener('touchstart', handleClickOutsideMobileMenu);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideMobileMenu);
      document.removeEventListener('touchstart', handleClickOutsideMobileMenu);
    };
  }, [isMobileMenuOpen]);

  // Format date for display
  const formatDate = (datetime) => {
    if (!datetime) return "Select";
    const date = new Date(datetime);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white text-gray-800 shadow-lg' : 'bg-orange-600 text-white'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Location/Date Section */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <FaMotorcycle className={`text-2xl ${isScrolled ? 'text-orange-600' : 'text-white'}`} />
              <span className={`text-2xl font-bold transition-colors ${isScrolled ? 'text-orange-600' : 'text-white'}`}>OKBikes</span>
            </Link>

            {/* Location and Date Info */}
            <div className="hidden md:flex items-center space-x-4">
              {formData.location && (
                <div className={`flex items-center space-x-1 ${isScrolled ? 'text-gray-600' : 'text-white'}`}>
                  <IoLocationOutline className="text-lg" />
                  <div className="text-sm font-medium truncate max-w-[150px]">
                    {formData.location || "Select Location"}
                  </div>
                </div>
              )}

              {formData.startDate && formData.endDate && (
                <div className={`flex items-center space-x-1 ${isScrolled ? 'text-gray-600' : 'text-white'}`}>
                  <HiOutlineCalendarDays className="text-lg" />
                  <div className="text-sm font-medium">
                    {formatDate(formData.startDate)} - {formatDate(formData.endDate)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Contact & Profile */}
          <div className="flex items-center space-x-4">
            {/* Contact */}
            <div className={`hidden md:flex items-center space-x-2 ${isScrolled ? 'text-gray-800' : 'text-white'}`}>
              <FaPhoneAlt size={16} />
              <span className="font-medium">+91 9545 237 823</span>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                ref={buttonRef}
                id="profile-dropdown-button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className={`flex items-center space-x-1 p-2 rounded-full ${isScrolled ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-orange-700 text-white hover:bg-orange-800'} transition-colors`}
              >
                <FaUser />
                <span className="hidden md:inline text-sm font-medium">Account</span>
              </button>

              {isProfileDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40"
                >
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/contactus"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    Contact Us
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link
                    to="/"
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-md ${isScrolled ? 'text-gray-800' : 'text-white'}`}
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div id="mobile-menu-area" className="md:hidden bg-white">
          <div className="px-2 pt-2 pb-4 space-y-1">
            {/* Mobile Location and Date */}
            {formData.location && (
              <div className="flex items-center px-3 py-2 text-gray-600">
                <IoLocationOutline className="mr-2" />
                <span className="text-sm">{formData.location}</span>
              </div>
            )}

            {formData.startDate && formData.endDate && (
              <div className="flex items-center px-3 py-2 text-gray-600">
                <HiOutlineCalendarDays className="mr-2" />
                <span className="text-sm">{formatDate(formData.startDate)} - {formatDate(formData.endDate)}</span>
              </div>
            )}

            <div className="border-t border-gray-200 my-2"></div>

            <Link
              to="/profile"
              className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-orange-50 hover:text-orange-600 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Profile
            </Link>
            <Link
              to="/bookings"
              className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-orange-50 hover:text-orange-600 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Bookings
            </Link>
            <Link
              to="/contactus"
              className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-orange-50 hover:text-orange-600 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="flex items-center px-3 py-3 text-gray-600">
              <FaPhoneAlt className="mr-3" />
              <span>+91 9545 237 823</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;