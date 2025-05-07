import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaPhoneAlt, FaBars, FaTimes, FaMotorcycle } from "react-icons/fa";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import { IoLocationOutline } from "react-icons/io5";
import { useGlobalState } from "../context/GlobalStateContext";

const Navbar = () => {
  const { formData, setFormData } = useGlobalState();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("formData"));
    if (storedData && Object.keys(storedData).length > 0) {
      setFormData(storedData);
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setFormData]);

  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      localStorage.setItem("formData", JSON.stringify(formData));
    }
  }, [formData]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        setIsLoggedIn(true);
        try {
          const response = await fetch(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch user profile");
          }

          const data = await response.json();
          setUserData(data);
          localStorage.setItem("userData", JSON.stringify(data));
        } catch (error) {
          console.error("Error fetching user data:", error);
          localStorage.removeItem("jwtToken");
          setIsLoggedIn(false);
          setUserData(null);
          navigate("/login");
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    fetchUserData();
  }, [navigate]);

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

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

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

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutsideMobileMenu);
    document.addEventListener('touchstart', handleClickOutsideMobileMenu);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideMobileMenu);
      document.removeEventListener('touchstart', handleClickOutsideMobileMenu);
    };
  }, [isMobileMenuOpen]);

  const formatDateTime = (datetime) => {
    if (!datetime) return "Select";
    const date = new Date(datetime);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUserData(null);
    navigate("/");
  };

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white text-gray-800 shadow-lg' : 'bg-indigo-900 text-white'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4 md:space-x-6">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/vegologo.png"
                alt="VegoBike Logo"
                className="h-8 w-8 object-contain"
              />
              <span className={`text-2xl font-bold transition-colors ${isScrolled ? 'text-indigo-600' : 'text-white'}`}>
                VegoBike
              </span>
            </Link>

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
                    {formatDateTime(formData.startDate)} - {formatDateTime(formData.endDate)}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`hidden md:flex items-center space-x-2 ${isScrolled ? 'text-gray-800' : 'text-white'}`}>
              <FaPhoneAlt size={16} />
              <span className="font-medium">
                {isLoggedIn && userData?.phoneNumber ? userData.phoneNumber : "+91 9545 237 823"}
              </span>
            </div>

            <div className="relative">
              <button
                ref={buttonRef}
                id="profile-dropdown-button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className={`flex items-center space-x-1 p-2 rounded-full ${isScrolled ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-indigo-700 text-white hover:bg-indigo-800'} transition-colors`}
              >
                <FaUser />
                <span className="hidden md:inline text-sm font-medium">
                  {isLoggedIn && userData?.name ? userData.name : "Account"}
                </span>
              </button>

              {isProfileDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40"
                >
                  <Link
                    to="/"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/contactus"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    Contact Us
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  {isLoggedIn && (
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Log Out
                    </button>
                  )}
                </div>
              )}
            </div>

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

      {isMobileMenuOpen && (
        <div id="mobile-menu-area" className="md:hidden bg-white">
          <div className="px-2 pt-2 pb-4 space-y-1">
            {formData.location && (
              <div className="flex items-center px-3 py-2 text-gray-600">
                <IoLocationOutline className="mr-2" />
                <span className="text-sm">{formData.location}</span>
              </div>
            )}

            {formData.startDate && formData.endDate && (
              <div className="flex items-center px-3 py-2 text-gray-600">
                <HiOutlineCalendarDays className="mr-2" />
                <span className="text-sm">{formatDateTime(formData.startDate)} - {formatDateTime(formData.endDate)}</span>
              </div>
            )}

            <div className="border-t border-gray-200 my-2"></div>

            <Link
              to="/"
              className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/profile"
              className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Profile
            </Link>
            <Link
              to="/orders"
              className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Bookings
            </Link>
            <Link
              to="/contactus"
              className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="flex items-center px-3 py-3 text-gray-600">
              <FaPhoneAlt className="mr-3" />
              <span>{isLoggedIn && userData?.phoneNumber ? userData.phoneNumber : "+91 9545 237 823"}</span>
            </div>
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="block px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
