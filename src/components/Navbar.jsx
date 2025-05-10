import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaPhoneAlt, FaBars, FaTimes, FaSearch } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";
import { useGlobalState } from "../context/GlobalStateContext";

const Navbar = () => {
  const { formData, setFormData } = useGlobalState();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [errors, setErrors] = useState({});
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const datePickerRef = useRef(null);
  const dateDropdownRef = useRef(null);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("formData"));
    if (storedData && Object.keys(storedData).length > 0) {
      setFormData(storedData);
    } else {
      // Set default dates if not already set
      const currentDateTime = new Date();
      const defaultStartDate = roundToNextHour(currentDateTime);
      const defaultEndDate = new Date(defaultStartDate);
      defaultEndDate.setDate(defaultEndDate.getDate() + 1);

      setFormData(prev => ({
        ...prev,
        startDate: formatDateForInput(defaultStartDate),
        endDate: formatDateForInput(defaultEndDate)
      }));
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

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle profile dropdown
      if (
        isProfileDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }

      // Handle date picker
      if (
        datePickerVisible &&
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setDatePickerVisible(false);
      }
      
      // Handle date dropdown
      if (
        isDateDropdownOpen &&
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(event.target)
      ) {
        setIsDateDropdownOpen(false);
      }

      // Handle mobile menu
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

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isProfileDropdownOpen, isMobileMenuOpen, datePickerVisible, isDateDropdownOpen]);

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
  
  const formatDateForDisplay = (startDate, endDate) => {
    if (!startDate || !endDate) return "Select dates";
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startMonth = start.toLocaleString('default', { month: 'short' });
    const endMonth = end.toLocaleString('default', { month: 'short' });
    
    return `${start.getDate()} ${startMonth} ${start.getFullYear()} ${start.getHours()}:${String(start.getMinutes()).padStart(2, "0")} - 
            ${end.getDate()} ${endMonth} ${end.getFullYear()} ${end.getHours()}:${String(end.getMinutes()).padStart(2, "0")}`;
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      localStorage.removeItem("jwtToken");
      localStorage.removeItem("userData");
      sessionStorage.removeItem("sessionData");

      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("userData");
      navigate("/");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedStartDate = formData.startDate;
    let updatedEndDate = formData.endDate;
    let dateError = null;

    if (name === 'startDate') {
      const selectedDate = new Date(value);
      const currentDate = new Date();

      // Validate start date is not in the past
      if (selectedDate < currentDate) {
        const newStartDate = roundToNextHour(currentDate);
        updatedStartDate = formatDateForInput(newStartDate);
        dateError = "Past dates can't be selected. Date set to next available time.";
      } else {
        updatedStartDate = value;
      }

      // If end date exists and is before new start date, adjust end date
      if (formData.endDate && new Date(formData.endDate) <= new Date(updatedStartDate)) {
        const newEndDate = new Date(updatedStartDate);
        newEndDate.setDate(newEndDate.getDate() + 1);
        updatedEndDate = formatDateForInput(newEndDate);
      }
    }

    if (name === 'endDate') {
      const selectedEndDate = new Date(value);
      const startDateObj = new Date(formData.startDate);

      // Validate end date is after start date
      if (selectedEndDate <= startDateObj) {
        const newEndDate = new Date(startDateObj);
        newEndDate.setDate(startDateObj.getDate() + 1);
        updatedEndDate = formatDateForInput(newEndDate);
        dateError = "End date must be after start date. Date adjusted.";
      } else {
        updatedEndDate = value;
      }
    }

    // Update state with validated dates
    setFormData(prevData => ({
      ...prevData,
      startDate: updatedStartDate,
      endDate: updatedEndDate,
      [name]: name === 'startDate' ? updatedStartDate : updatedEndDate
    }));

    // Set error if any
    if (dateError) {
      setErrors(prev => ({ ...prev, [name]: dateError }));
      // Clear error after 3 seconds
      setTimeout(() => {
        setErrors(prev => ({ ...prev, [name]: "" }));
      }, 3000);
    }
  };

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const roundToNextHour = (date) => {
    const roundedDate = new Date(date);
    roundedDate.setHours(roundedDate.getHours() + 1, 0, 0, 0);
    return roundedDate;
  };

  const handleSearch = () => {
    if (!formData.location) {
      setErrors({ ...errors, location: "Please select a location." });

      // Clear error after 3 seconds
      setTimeout(() => {
        setErrors(prev => ({ ...prev, location: "" }));
      }, 3000);
      return;
    }

    // Close mobile menu if open
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }

    navigate("/bike-list", { state: { formData } });
  };

  // Format the date range for display
  const formatDateRangeForDisplay = () => {
    if (!formData.startDate || !formData.endDate) return "Select dates";
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Format: May 10, 2025 10:00 PM - May 11, 2025 10:00 PM
    return `${months[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} ${formatTime(start)} - 
            ${months[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()} ${formatTime(end)}`;
  };
  
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white text-gray-800 shadow-lg' : 'bg-white text-gray-800 shadow-md'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-800"
          >
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>

          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-1">
              <img
                src="/vegologo.png"
                alt="VegoBike Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold text-indigo-600">
                VeGo<span className="text-indigo-800">Bikes</span>
              </span>
            </Link>
          </div>

          {/* Location Display - Mobile */}
          <div className="md:hidden flex items-center space-x-1 text-gray-600">
            <IoLocationOutline className="text-lg text-indigo-600" />
            <div className="text-sm font-medium">
              {formData.location || "Pune"}
            </div>
          </div>

          {/* Desktop Components - hidden in mobile */}
          <div className="hidden md:flex items-center space-x-4 flex-grow justify-center">
            {formData.location && (
              <div className="flex items-center space-x-1 text-gray-600">
                <IoLocationOutline className="text-lg" />
                <div className="text-sm font-medium truncate max-w-[150px]">
                  {formData.location || "Select Location"}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  min={formatDateForInput(new Date())}
                  onChange={handleInputChange}
                  className="px-2 py-1 border rounded text-gray-700 bg-white"
                />
                {errors.startDate && (
                  <div className="absolute -bottom-6 left-0 text-xs text-red-500 bg-white p-1 rounded shadow">
                    {errors.startDate}
                  </div>
                )}
              </div>

              <div className="relative">
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  min={formData.startDate}
                  onChange={handleInputChange}
                  className="px-2 py-1 border rounded text-gray-700 bg-white"
                />
                {errors.endDate && (
                  <div className="absolute -bottom-6 left-0 text-xs text-red-500 bg-white p-1 rounded shadow">
                    {errors.endDate}
                  </div>
                )}
              </div>

              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <FaSearch />
              </button>
            </div>
          </div>

          {/* User Account - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-800">
              <FaPhoneAlt size={16} />
              <span className="font-medium">
                {isLoggedIn && userData?.phoneNumber ? userData.phoneNumber : "+91 9545 237 823"}
              </span>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                ref={buttonRef}
                id="profile-dropdown-button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-1 p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
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
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Log Out
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Date Selector Bar - Mobile Only */}
      <div className="md:hidden bg-gray-50 py-2 px-4 flex items-center justify-between border-t border-gray-200">
        <button 
          onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
          className="flex items-center justify-between w-full text-gray-700 text-sm"
        >
          <div className="flex-1 truncate pr-2">{formatDateRangeForDisplay()}</div>
          <IoChevronDown className={`text-gray-500 transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Date Picker Dropdown - Mobile */}
      {isDateDropdownOpen && (
        <div 
          ref={dateDropdownRef}
          className="md:hidden bg-white shadow-lg border-t border-gray-200 p-4 z-40 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
            <div className="relative">
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                min={formatDateForInput(new Date())}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.startDate && (
                <div className="text-xs text-red-500 mt-1">
                  {errors.startDate}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
            <div className="relative">
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                min={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.endDate && (
                <div className="text-xs text-red-500 mt-1">
                  {errors.endDate}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              handleSearch();
              setIsDateDropdownOpen(false);
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition duration-300"
          >
            <span>Apply</span>
          </button>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu-area"
          className="md:hidden bg-white shadow-lg rounded-b-lg"
        >
          <div className="px-4 py-4 space-y-4">
            {/* Navigation Links */}
            <div className="space-y-1">
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
            </div>

            <div className="border-t border-gray-200 my-2"></div>

            {/* Contact Info and Logout */}
            <div>
              <div className="flex items-center px-3 py-3 text-gray-700 bg-gray-50 rounded-lg">
                <FaPhoneAlt className="mr-3 text-indigo-600" />
                <span className="font-medium">{isLoggedIn && userData?.phoneNumber ? userData.phoneNumber : "+91 9545 237 823"}</span>
              </div>

              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="w-full mt-3 px-3 py-3 text-base font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center"
                >
                  <span>Log Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error notifications for location */}
      {errors.location && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center">
          <span>{errors.location}</span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;






// import React, { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { FaUser, FaPhoneAlt, FaBars, FaTimes, FaMotorcycle } from "react-icons/fa";
// import { HiOutlineCalendarDays } from "react-icons/hi2";
// import { IoLocationOutline } from "react-icons/io5";
// import { useGlobalState } from "../context/GlobalStateContext";

// const Navbar = () => {
//   const { formData, setFormData } = useGlobalState();
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const navigate = useNavigate();

//   const dropdownRef = useRef(null);
//   const buttonRef = useRef(null);


  

//   useEffect(() => {
//     const storedData = JSON.parse(localStorage.getItem("formData"));
//     if (storedData && Object.keys(storedData).length > 0) {
//       setFormData(storedData);
//     }

//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 20);
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, [setFormData]);

//   useEffect(() => {
//     if (formData && Object.keys(formData).length > 0) {
//       localStorage.setItem("formData", JSON.stringify(formData));
//     }
//   }, [formData]);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const token = localStorage.getItem("jwtToken");
//       if (token) {
//         setIsLoggedIn(true);
//         try {
//           const response = await fetch(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           });

//           if (!response.ok) {
//             throw new Error("Failed to fetch user profile");
//           }

//           const data = await response.json();
//           setUserData(data);
//           localStorage.setItem("userData", JSON.stringify(data));
//         } catch (error) {
//           console.error("Error fetching user data:", error);
//           localStorage.removeItem("jwtToken");
//           setIsLoggedIn(false);
//           setUserData(null);
//           navigate("/login");
//         }
//       } else {
//         setIsLoggedIn(false);
//         setUserData(null);
//       }
//     };

//     fetchUserData();
//   }, [navigate]);

//   const handleClickOutside = (event) => {
//     if (
//       isProfileDropdownOpen &&
//       dropdownRef.current &&
//       !dropdownRef.current.contains(event.target) &&
//       buttonRef.current &&
//       !buttonRef.current.contains(event.target)
//     ) {
//       setIsProfileDropdownOpen(false);
//     }
//   };

//   useEffect(() => {
//     document.addEventListener('mousedown', handleClickOutside);
//     document.addEventListener('touchstart', handleClickOutside);

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//       document.removeEventListener('touchstart', handleClickOutside);
//     };
//   }, [isProfileDropdownOpen]);

//   const handleClickOutsideMobileMenu = (event) => {
//     if (isMobileMenuOpen) {
//       const mobileMenuArea = document.getElementById('mobile-menu-area');
//       const menuToggle = document.getElementById('mobile-menu-toggle');

//       if (
//         mobileMenuArea &&
//         !mobileMenuArea.contains(event.target) &&
//         menuToggle &&
//         !menuToggle.contains(event.target)
//       ) {
//         setIsMobileMenuOpen(false);
//       }
//     }
//   };

//   useEffect(() => {
//     document.addEventListener('mousedown', handleClickOutsideMobileMenu);
//     document.addEventListener('touchstart', handleClickOutsideMobileMenu);

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutsideMobileMenu);
//       document.removeEventListener('touchstart', handleClickOutsideMobileMenu);
//     };
//   }, [isMobileMenuOpen]);

//   const formatDateTime = (datetime) => {
//     if (!datetime) return "Select";
//     const date = new Date(datetime);
//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const year = date.getFullYear();
//     const hours = String(date.getHours()).padStart(2, "0");
//     const minutes = String(date.getMinutes()).padStart(2, "0");
//     return `${day}/${month}/${year} ${hours}:${minutes}`;
//   };

//   // const handleLogout = () => {
//   //   localStorage.removeItem("jwtToken");
//   //   localStorage.removeItem("userData");
//   //   setIsLoggedIn(false);
//   //   setUserData(null);
//   //   navigate("/");
//   // };


//   const handleLogout = async () => {
//   try {
//     // Attempt server logout first
//     const response = await fetch(`${import.meta.env.VITE_BASE_URL}/logout`, {
//       method: "POST",
//       credentials: "include", // If you need to include credentials (cookies)
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`, // If using Bearer token
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error("Logout failed");
//     }

//     // Clear client-side storage
//     localStorage.removeItem("jwtToken");
//     localStorage.removeItem("userData");
//     sessionStorage.removeItem("sessionData"); // If using sessionStorage

//     // Force full page reload to clear all application state
//     window.location.href = "/";
//   } catch (error) {
//     console.error("Logout failed:", error);
//     // Fallback cleanup if server unavailable
//     localStorage.removeItem("jwtToken");
//     localStorage.removeItem("userData");
//     navigate("/");
//   }
// };



//   return (
//     <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white text-gray-800 shadow-lg' : 'bg-indigo-900 text-white'}`}>
//       <div className="container mx-auto px-4">
//         <div className="flex justify-between items-center py-4">
//           <div className="flex items-center space-x-4 md:space-x-6">
//             <Link to="/" className="flex items-center space-x-2">
//               <img
//                 src="/vegologo.png"
//                 alt="VegoBike Logo"
//                 className="h-8 w-8 object-contain"
//               />
//               <span className={`text-2xl font-bold transition-colors ${isScrolled ? 'text-indigo-600' : 'text-white'}`}>
//                 VegoBike
//               </span>
//             </Link>

//             <div className="hidden md:flex items-center space-x-4">
//               {formData.location && (
//                 <div className={`flex items-center space-x-1 ${isScrolled ? 'text-gray-600' : 'text-white'}`}>
//                   <IoLocationOutline className="text-lg" />
//                   <div className="text-sm font-medium truncate max-w-[150px]">
//                     {formData.location || "Select Location"}
//                   </div>
//                 </div>
//               )}

//               {formData.startDate && formData.endDate && (
//                 <div className={`flex items-center space-x-1 ${isScrolled ? 'text-gray-600' : 'text-white'}`}>
//                   <HiOutlineCalendarDays className="text-lg" />
//                   <div className="text-sm font-medium">
//                     {formatDateTime(formData.startDate)} - {formatDateTime(formData.endDate)}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="flex items-center space-x-4">
//             <div className={`hidden md:flex items-center space-x-2 ${isScrolled ? 'text-gray-800' : 'text-white'}`}>
//               <FaPhoneAlt size={16} />
//               <span className="font-medium">
//                 {isLoggedIn && userData?.phoneNumber ? userData.phoneNumber : "+91 9545 237 823"}
//               </span>
//             </div>

//             <div className="relative">
//               <button
//                 ref={buttonRef}
//                 id="profile-dropdown-button"
//                 onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
//                 className={`flex items-center space-x-1 p-2 rounded-full ${isScrolled ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-indigo-700 text-white hover:bg-indigo-800'} transition-colors`}
//               >
//                 <FaUser />
//                 <span className="hidden md:inline text-sm font-medium">
//                   {isLoggedIn && userData?.name ? userData.name : "Account"}
//                 </span>
//               </button>

//               {isProfileDropdownOpen && (
//                 <div
//                   ref={dropdownRef}
//                   className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40"
//                 >
//                   <Link
//                     to="/"
//                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
//                     onClick={() => setIsProfileDropdownOpen(false)}
//                   >
//                     Home
//                   </Link>
//                   <Link
//                     to="/profile"
//                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
//                     onClick={() => setIsProfileDropdownOpen(false)}
//                   >
//                     My Profile
//                   </Link>
//                   <Link
//                     to="/orders"
//                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
//                     onClick={() => setIsProfileDropdownOpen(false)}
//                   >
//                     My Bookings
//                   </Link>
//                   <Link
//                     to="/contactus"
//                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
//                     onClick={() => setIsProfileDropdownOpen(false)}
//                   >
//                     Contact Us
//                   </Link>
//                   <div className="border-t border-gray-100 my-1"></div>
//                   {isLoggedIn && (
//                     <button
//                       onClick={handleLogout}
//                       className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                     >
//                       Log Out
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>

//             <button
//               id="mobile-menu-toggle"
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//               className={`md:hidden p-2 rounded-md ${isScrolled ? 'text-gray-800' : 'text-white'}`}
//             >
//               {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {isMobileMenuOpen && (
//         <div id="mobile-menu-area" className="md:hidden bg-white">
//           <div className="px-2 pt-2 pb-4 space-y-1">
//             {formData.location && (
//               <div className="flex items-center px-3 py-2 text-gray-600">
//                 <IoLocationOutline className="mr-2" />
//                 <span className="text-sm">{formData.location}</span>
//               </div>
//             )}

//             {formData.startDate && formData.endDate && (
//               <div className="flex items-center px-3 py-2 text-gray-600">
//                 <HiOutlineCalendarDays className="mr-2" />
//                 <span className="text-sm">{formatDateTime(formData.startDate)} - {formatDateTime(formData.endDate)}</span>
//               </div>
//             )}

//             <div className="border-t border-gray-200 my-2"></div>

//             <Link
//               to="/"
//               className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
//               onClick={() => setIsMobileMenuOpen(false)}
//             >
//               Home
//             </Link>
//             <Link
//               to="/profile"
//               className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
//               onClick={() => setIsMobileMenuOpen(false)}
//             >
//               My Profile
//             </Link>
//             <Link
//               to="/orders"
//               className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
//               onClick={() => setIsMobileMenuOpen(false)}
//             >
//               My Bookings
//             </Link>
//             <Link
//               to="/contactus"
//               className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
//               onClick={() => setIsMobileMenuOpen(false)}
//             >
//               Contact Us
//             </Link>
//             <div className="border-t border-gray-200 my-2"></div>
//             <div className="flex items-center px-3 py-3 text-gray-600">
//               <FaPhoneAlt className="mr-3" />
//               <span>{isLoggedIn && userData?.phoneNumber ? userData.phoneNumber : "+91 9545 237 823"}</span>
//             </div>
//             {isLoggedIn && (
//               <button
//                 onClick={handleLogout}
//                 className="block px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
//               >
//                 Log Out
//               </button>
//             )}
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;
