import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaTags, FaCalendarAlt } from "react-icons/fa";
import { AiOutlineCaretDown, AiOutlineCaretUp } from "react-icons/ai";
import LoginPopup from "../components/LoginPopup";
import RegistrationPopup from "../components/RegistrationPopup";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalState } from "../context/GlobalStateContext";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const BikeDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bike = location.state || {};
  const { formData, setFormData } = useGlobalState();
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isRegistrationPopupOpen, setIsRegistrationPopupOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dayPackages, setDayPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [oneDayPackage, setOneDayPackage] = useState(null);
  const [dayDropdownOpen, setDayDropdownOpen] = useState(false);
  const [pickupOption, setPickupOption] = useState("SELF_PICKUP");
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const { token } = useAuth();
  const [addressDetails, setAddressDetails] = useState({
    fullAddress: "",
    pinCode: "",
    nearby: "",
  });

  const [addressErrors, setAddressErrors] = useState({
    fullAddress: false,
    pinCode: false,
  });
  const [rentalDays, setRentalDays] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      setIsLoggedIn(true);
    }

    if (bike.categoryId) {
      fetchPackages(bike.categoryId);
    }

    window.scrollTo(0, 0);
  }, [bike.categoryId]);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setRentalDays(diffDays > 0 ? diffDays : 1);
    }
  }, [formData.startDate, formData.endDate]);

  useEffect(() => {
    if (dayPackages.length > 0) {
      const bestPackage = findBestPackage(dayPackages, rentalDays);
      setSelectedPackage(bestPackage);
      const oneDayPkg = dayPackages.find(pkg => pkg.days === 1);
      setOneDayPackage(oneDayPkg);
    }
  }, [rentalDays, dayPackages]);

  const findBestPackage = (packages, days) => {
    const sortedPackages = [...packages].sort((a, b) => b.days - a.days);
    for (const pkg of sortedPackages) {
      if (pkg.days <= days) {
        return pkg;
      }
    }
    return sortedPackages[sortedPackages.length - 1];
  };

  const fetchPackages = async (categoryId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/package/list/${categoryId}`);
      const data = response.data;
      const activePackages = data.filter(pkg => pkg.active);
      const dayPkgs = activePackages.filter(pkg => pkg.type === "day" || !pkg.type);
      setDayPackages(dayPkgs);
      if (dayPkgs.length > 0) {
        setSelectedPackage(findBestPackage(dayPkgs, rentalDays));
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      setDayPackages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePackageSelection = (pkg) => {
    setSelectedPackage(pkg);
    setDayDropdownOpen(false);
    if (pkg.days) {
      setRentalDays(pkg.days);
      const startDate = new Date(formData.startDate || new Date());
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + pkg.days);
      setFormData({
        ...formData,
        startDate: formatDateForInput(startDate),
        endDate: formatDateForInput(endDate),
        rentalDays: pkg.days
      });
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedPackage || !oneDayPackage) {
      return 0;
    }
    const packagePrice = selectedPackage.price || 0;
    const extraDays = rentalDays - (selectedPackage.days || 0);
    const extraDaysPrice = extraDays > 0 ? extraDays * (oneDayPackage.price || 0) : 0;
    const deliveryCharge = pickupOption === "DELIVERY_AT_LOCATION" ? 250 : 0;
    return packagePrice + extraDaysPrice + deliveryCharge;
  };

  const calculatePricePerUnit = () => {
    if (!selectedPackage) return 0;
    const packagePricePerDay = selectedPackage.price / selectedPackage.days;
    const extraDaysPricePerDay = oneDayPackage.price;
    const totalDays = rentalDays;
    const packageDays = selectedPackage.days;
    const extraDays = totalDays - packageDays;
    if (extraDays > 0) {
      return (packagePricePerDay * packageDays + extraDaysPricePerDay * extraDays) / totalDays;
    }
    return packagePricePerDay;
  };

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const totalPrice = calculateTotalPrice();

  const handleAddressChange = (field, value) => {
    setAddressDetails((prevDetails) => ({ ...prevDetails, [field]: value }));
    if (addressErrors[field]) {
      setAddressErrors((prevErrors) => ({ ...prevErrors, [field]: false }));
    }
  };

  const validateAddress = () => {
    const errors = {
      fullAddress: !addressDetails.fullAddress.trim(),
      pinCode: !addressDetails.pinCode.trim()
    };
    setAddressErrors(errors);
    return !errors.fullAddress && !errors.pinCode;
  };

  const handleSaveAddress = () => {
    if (validateAddress()) {
      setShowAddressPopup(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!selectedPackage) {
      alert("Please select a rental package before proceeding.");
      return;
    }
    if (pickupOption === "DELIVERY_AT_LOCATION" && !addressDetails.fullAddress) {
      setShowAddressPopup(true);
      return;
    }
    setShowConfirmation(true);
  };

  const confirmCheckout = () => {
    const deliveryCharge = pickupOption === "DELIVERY_AT_LOCATION" ? 250 : 0;
    const checkoutData = {
      bike,
      totalPrice: calculateTotalPrice(),
      selectedPackage,
      rentalDays,
      addressDetails,
      pickupOption,
      deliveryCharge,
      pricePerUnit: calculatePricePerUnit(),
      pickupDate: new Date(formData.startDate),
      dropDate: new Date(formData.endDate),
      storeName: bike.storeName || "Our Store Location: Rental Street",
      storeId: bike.storeId,
    };

    if (!isLoggedIn) {
      sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      setIsLoginPopupOpen(true);
      setShowConfirmation(false);
      return;
    }

    setIsAnimating(true);
    setShowConfirmation(false);

    setTimeout(() => {
      navigate("/checkout", { state: checkoutData });
    }, 600);
  };

  const cancelCheckout = () => {
    setShowConfirmation(false);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsLoginPopupOpen(false);
    const savedData = sessionStorage.getItem('checkoutData');
    if (savedData) {
      navigate("/checkout", { state: JSON.parse(savedData) });
      sessionStorage.removeItem('checkoutData');
    }
  };

  const handleRegistrationSuccess = () => {
    setIsLoggedIn(true);
    setIsRegistrationPopupOpen(false);
  };

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

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isAnimating ? 0 : 1 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto py-6 px-4 lg:px-6 mt-12 relative"
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="flex flex-col shadow border items-center rounded-lg overflow-hidden">
          <img
            src={bike.img || "/placeholder-image.jpg"}
            alt={bike.name || "Bike Image"}
            className="w-96 h-auto object-contain mt-32"
          />
          <p className="mt-3 text-gray-500 text-xs italic">
            *Images are for representation purposes only.
          </p>
          <div className="mt-6 p-6 bg-gray-50 rounded-lg shadow-inner w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Terms and Conditions</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li><strong>Late fee applies after trip end from admin</strong></li>
              <li><strong>₹100 per hour</strong></li>
              <li><strong>Exchange bike categories and availability</strong></li>
              <li><strong>Cancellation not allowed when booking is accepted</strong></li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">{bike.model || "Bike Name"}</h2>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              <FaTags className="inline mr-2 text-indigo-400" /> Day Packages
            </h3>
            <div className="relative">
              <button
                onClick={() => setDayDropdownOpen(!dayDropdownOpen)}
                className={`py-2 px-4 border w-full flex justify-between items-center rounded transition-all duration-300 ${
                  dayDropdownOpen ? "bg-indigo-300 text-black" : "bg-white text-black"
                }`}
              >
                <span>
                  {selectedPackage && selectedPackage.days
                    ? `${selectedPackage.days} Days (₹${selectedPackage.price})`
                    : "Select Package"}
                </span>
                {dayDropdownOpen ? <AiOutlineCaretUp className="ml-2" /> : <AiOutlineCaretDown className="ml-2" />}
              </button>
              {dayDropdownOpen && (
                <div className="absolute z-10 mt-2 bg-white border shadow-lg rounded w-full">
                  {dayPackages.length > 0 ? (
                    dayPackages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => handlePackageSelection(pkg)}
                        className={`block w-full text-left py-2 px-4 hover:bg-indigo-100 text-sm transition-all duration-300 ${
                          selectedPackage?.id === pkg.id ? "bg-indigo-300" : "text-gray-800"
                        }`}
                      >
                        {pkg.days} Days (₹{pkg.price})
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center p-2">No day packages available</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              <FaCalendarAlt className="inline mr-2 text-indigo-400" /> Rental Duration
            </h3>
            <div className="text-sm text-gray-600">
              <p>From: {formatDateTime(formData.startDate)}</p>
              <p>To: {formatDateTime(formData.endDate)}</p>
              <p>Duration: {rentalDays} Days</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              <FaMapMarkerAlt className="inline mr-2 text-indigo-400" /> Pickup Option
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => setPickupOption("SELF_PICKUP")}
                className={`py-2 px-4 border-2 rounded text-sm transition-all duration-300 ${
                  pickupOption === "SELF_PICKUP"
                    ? "bg-indigo-300 text-black border-indigo-300"
                    : "bg-white text-black border-indigo-300"
                }`}
              >
                Self Pickup
              </button>
              <button
                onClick={() => {
                  setPickupOption("DELIVERY_AT_LOCATION");
                  setShowAddressPopup(true);
                }}
                className={`py-2 px-4 border-2 rounded text-sm transition-all duration-300 ${
                  pickupOption === "DELIVERY_AT_LOCATION"
                    ? "bg-indigo-300 text-black border-indigo-300"
                    : "bg-white text-black border-indigo-300"
                }`}
              >
                Delivery at Location
              </button>
            </div>
            {pickupOption === "DELIVERY_AT_LOCATION" && addressDetails.fullAddress && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-800">Delivery Address:</p>
                <p className="text-sm text-gray-600">{addressDetails.fullAddress}</p>
                {addressDetails.pinCode && <p className="text-sm text-gray-600">Pin: {addressDetails.pinCode}</p>}
                {addressDetails.nearby && <p className="text-sm text-gray-600">Landmark: {addressDetails.nearby}</p>}
                <button
                  onClick={() => setShowAddressPopup(true)}
                  className="text-xs text-indigo-500 mt-1 hover:text-indigo-600"
                >
                  Edit Address
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-bold text-gray-800">Price Breakdown:</h3>
            {selectedPackage && selectedPackage.days && (
              <>
                <p className="text-sm text-gray-600">
                  <strong>Package:</strong> {selectedPackage.days} Days (₹{selectedPackage.price})
                </p>
              </>
            )}
            {pickupOption === "DELIVERY_AT_LOCATION" && (
              <p className="text-sm text-gray-600">
                <strong>Delivery Charge:</strong> ₹250
              </p>
            )}
            <hr className="my-2" />
            <h3 className="text-lg font-bold text-gray-800">
              Total Price: ₹{totalPrice.toFixed(2)}
            </h3>
          </div>

          <button
            onClick={handleProceedToCheckout}
            disabled={isLoading}
            className={`w-full py-3 bg-indigo-400 text-white font-semibold rounded hover:bg-indigo-500 transition-all duration-300 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Processing..." : "Proceed to Checkout"}
          </button>

          {isLoginPopupOpen && (
            <LoginPopup
              onClose={() => setIsLoginPopupOpen(false)}
              onLogin={handleLoginSuccess}
              openRegistration={() => {
                setIsLoginPopupOpen(false);
                setIsRegistrationPopupOpen(true);
              }}
            />
          )}

          {isRegistrationPopupOpen && (
            <RegistrationPopup
              onClose={() => setIsRegistrationPopupOpen(false)}
              openLogin={() => {
                setIsRegistrationPopupOpen(false);
                setIsLoginPopupOpen(true);
              }}
            />
          )}
        </div>
      </div>

      {showAddressPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-[90%] space-y-4"
          >
            <h2 className="text-lg font-semibold text-gray-800">Enter Delivery Address</h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Full Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addressDetails.fullAddress}
                onChange={(e) => handleAddressChange("fullAddress", e.target.value)}
                className={`w-full p-2 border rounded text-sm ${
                  addressErrors.fullAddress ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter full address"
                required
              />
              {addressErrors.fullAddress && (
                <p className="text-red-500 text-xs mt-1">Full address is required</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Pin Code <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={addressDetails.pinCode}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || (/^\d{0,6}$/.test(value))) {
                    handleAddressChange("pinCode", value);
                  }
                }}
                className={`w-full p-2 border rounded text-sm ${
                  addressErrors.pinCode ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter pin code"
                required
              />
              {addressErrors.pinCode && (
                <p className="text-red-500 text-xs mt-1">Pin code is required</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Nearby Landmark</label>
              <input
                type="text"
                value={addressDetails.nearby}
                onChange={(e) => handleAddressChange("nearby", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="Enter nearby landmark (optional)"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddressPopup(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddress}
                className="px-4 py-2 bg-indigo-400 text-white rounded hover:bg-indigo-500 transition-all"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-xl border-l-4 border-indigo-400 max-w-md w-11/12"
            >
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Are you sure?</h3>
                <p className="text-center text-gray-600 mb-6">
                  Ready to proceed with your bike rental for {rentalDays} days?
                  <br />
                  Total amount: ₹{totalPrice.toFixed(2)}
                </p>
                <div className="flex gap-4 w-full">
                  <button
                    onClick={cancelCheckout}
                    className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmCheckout}
                    className="flex-1 py-2 px-4 bg-indigo-400 text-white rounded hover:bg-indigo-500 transition-all duration-300 font-medium"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BikeDetailsPage;







// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import {
//   FaTimes,
//   FaBicycle,
//   FaHandshake,
//   FaPhone,
//   FaCheck,
//   FaMapMarkerAlt,
//   FaCreditCard,
//   FaTags,
//   FaCalendarAlt,
//   FaClock,
// } from "react-icons/fa";
// import { AiOutlineCaretDown, AiOutlineCaretUp } from "react-icons/ai";
// import LoginPopup from "../components/LoginPopup";
// import RegistrationPopup from "../components/RegistrationPopup";
// import { motion, AnimatePresence } from "framer-motion";
// import { useGlobalState } from "../context/GlobalStateContext";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";

// const BikeDetailsPage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const bike = location.state || {};
//   const { formData, setFormData } = useGlobalState();
//   const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
//   const [isRegistrationPopupOpen, setIsRegistrationPopupOpen] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [dayPackages, setDayPackages] = useState([]);
//   const [hourPackages, setHourPackages] = useState([]);
//   const [selectedPackage, setSelectedPackage] = useState(null);
//   const [oneHourPackage, setOneHourPackage] = useState(null);
//   const [oneDayPackage, setOneDayPackage] = useState(null);
//   const [dayDropdownOpen, setDayDropdownOpen] = useState(false);
//   const [hourDropdownOpen, setHourDropdownOpen] = useState(false);
//   const [pickupOption, setPickupOption] = useState("SELF_PICKUP");
//   const [showAddressPopup, setShowAddressPopup] = useState(false);
//   const { token } = useAuth();
//   const [addressDetails, setAddressDetails] = useState({
//     fullAddress: "",
//     pinCode: "",
//     nearby: "",
//   });
 
//   const [addressErrors, setAddressErrors] = useState({
//     fullAddress: false,
//     pinCode: false,
//   });
//   const [rentalDays, setRentalDays] = useState(1);
//   const [rentalHours, setRentalHours] = useState(0);
//   const [rentalType, setRentalType] = useState("days"); // "days" or "hours"
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const { checkToken } = useAuth();

// // For debugging:
//   const tokenStatus = checkToken();
//   console.log("Token status:", tokenStatus);
  
//    // Log the token when the component mounts and whenever it changes
//   useEffect(() => {
//     console.log("Token from AuthContext:", token);
    
//     // Setup authenticated API headers if token exists
//     if (token) {
//       console.log("Setting up authenticated API with token");
//       axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     }
//   }, [token]);

//   // // Log the token when the component mounts
//   // useEffect(() => {
//   //   console.log("Token from AuthContext:", token);
//   // }, [token]);

//   useEffect(() => {
//     const token = localStorage.getItem("jwtToken");
//     if (token) {
//       setIsLoggedIn(true);
//     }

//     if (bike.categoryId) {
//       fetchPackages(bike.categoryId);
//     }

//     window.scrollTo(0, 0);
//   }, [bike.categoryId]);

//   useEffect(() => {
//     // Calculate rental duration based on formData dates
//     if (formData.startDate && formData.endDate) {
//       const start = new Date(formData.startDate);
//       const end = new Date(formData.endDate);
//       const diffTime = Math.abs(end - start);
      
//       // Calculate both days and hours
//       const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
//       const remainingTime = diffTime % (1000 * 60 * 60 * 24);
//       const diffHours = Math.ceil(remainingTime / (1000 * 60 * 60));
      
//       if (rentalType === "days") {
//         setRentalDays(diffDays > 0 ? diffDays : 1);
//       } else {
//         // For hours-based rentals
//         const totalHours = Math.ceil(diffTime / (1000 * 60 * 60));
//         setRentalHours(totalHours > 0 ? totalHours : 1);
//       }
//     }
//   }, [formData.startDate, formData.endDate, rentalType]);

//   useEffect(() => {
//     if (dayPackages.length > 0 && rentalType === "days") {
//       // Find the best package based on rental days
//       const bestPackage = findBestPackage(dayPackages, rentalDays);
//       setSelectedPackage(bestPackage);

//       // Find one day package for extra days calculation
//       const oneDayPkg = dayPackages.find(pkg => pkg.days === 1);
//       setOneDayPackage(oneDayPkg);
//     } else if (hourPackages.length > 0 && rentalType === "hours") {
//       // Find the best package based on rental hours
//       const bestPackage = findBestHourPackage(hourPackages, rentalHours);
//       setSelectedPackage(bestPackage);

//       // Find one hour package for extra hours calculation
//       const oneHourPkg = hourPackages.find(pkg => pkg.hours === 1);
//       setOneHourPackage(oneHourPkg);
//     }
//   }, [rentalDays, rentalHours, dayPackages, hourPackages, rentalType]);

//   const findBestPackage = (packages, days) => {
//     // Sort packages by days in descending order
//     const sortedPackages = [...packages].sort((a, b) => b.days - a.days);

//     // Find the largest package that fits within the rental days
//     for (const pkg of sortedPackages) {
//       if (pkg.days <= days) {
//         return pkg;
//       }
//     }

//     // If no package fits, return the smallest package
//     return sortedPackages[sortedPackages.length - 1];
//   };

//   const findBestHourPackage = (packages, hours) => {
//     // Sort packages by hours in descending order
//     const sortedPackages = [...packages].sort((a, b) => b.hours - a.hours);

//     // Find the largest package that fits within the rental hours
//     for (const pkg of sortedPackages) {
//       if (pkg.hours <= hours) {
//         return pkg;
//       }
//     }

//     // If no package fits, return the smallest package
//     return sortedPackages[sortedPackages.length - 1];
//   };

//   const fetchPackages = async (categoryId) => {
//     setIsLoading(true);
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/package/list/${categoryId}`);
//       const data = response.data;
//       const activePackages = data.filter(pkg => pkg.active);
      
//       // Separate day and hour packages
//       const dayPkgs = activePackages.filter(pkg => pkg.type === "day" || !pkg.type);
//       const hourPkgs = activePackages.filter(pkg => pkg.type === "hour");
      
//       setDayPackages(dayPkgs);
//       setHourPackages(hourPkgs);
      
//       // Default to day packages if available
//       if (dayPkgs.length > 0) {
//         setRentalType("days");
//         setSelectedPackage(findBestPackage(dayPkgs, rentalDays));
//       } else if (hourPkgs.length > 0) {
//         setRentalType("hours");
//         setSelectedPackage(findBestHourPackage(hourPkgs, rentalHours));
//       }
//     } catch (error) {
//       console.error("Error fetching packages:", error);
//       setDayPackages([]);
//       setHourPackages([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handlePackageSelection = (pkg) => {
//     setSelectedPackage(pkg);
//     setDayDropdownOpen(false);
//     setHourDropdownOpen(false);

//     // Update rental duration based on the selected package
//     if (pkg.days) {
//       setRentalType("days");
//       setRentalDays(pkg.days);
      
//       // Update formData dates based on the selected package
//       const startDate = new Date(formData.startDate || new Date());
//       const endDate = new Date(startDate);
//       endDate.setDate(startDate.getDate() + pkg.days);

//       setFormData({
//         ...formData,
//         startDate: formatDateForInput(startDate),
//         endDate: formatDateForInput(endDate),
//         rentalDays: pkg.days
//       });
//     } else if (pkg.hours) {
//       setRentalType("hours");
//       setRentalHours(pkg.hours);
      
//       // Update formData dates based on the selected package (hours)
//       const startDate = new Date(formData.startDate || new Date());
//       const endDate = new Date(startDate);
//       endDate.setHours(startDate.getHours() + pkg.hours);

//       setFormData({
//         ...formData,
//         startDate: formatDateForInput(startDate),
//         endDate: formatDateForInput(endDate),
//         rentalHours: pkg.hours
//       });
//     }
//   };

//   const calculateTotalPrice = () => {
//     if (!selectedPackage) return 0;

//     if (rentalType === "days" && oneDayPackage) {
//       const packagePrice = selectedPackage.price;
//       const extraDays = rentalDays - selectedPackage.days;
//       const extraDaysPrice = extraDays > 0 ? extraDays * oneDayPackage.price : 0;
//       const deliveryCharge = pickupOption === "DELIVERY_AT_LOCATION" ? 250 : 0;

//       return packagePrice + extraDaysPrice + deliveryCharge;
//     } else if (rentalType === "hours" && oneHourPackage) {
//       const packagePrice = selectedPackage.price;
//       const extraHours = rentalHours - selectedPackage.hours;
//       const extraHoursPrice = extraHours > 0 ? extraHours * oneHourPackage.price : 0;
//       const deliveryCharge = pickupOption === "DELIVERY_AT_LOCATION" ? 250 : 0;

//       return packagePrice + extraHoursPrice + deliveryCharge;
//     }

//     return selectedPackage.price + (pickupOption === "DELIVERY_AT_LOCATION" ? 250 : 0);
//   };

//   const calculatePricePerUnit = () => {
//     if (!selectedPackage) return 0;

//     if (rentalType === "days" && oneDayPackage) {
//       const packagePricePerDay = selectedPackage.price / selectedPackage.days;
//       const extraDaysPricePerDay = oneDayPackage.price;

//       const totalDays = rentalDays;
//       const packageDays = selectedPackage.days;
//       const extraDays = totalDays - packageDays;

//       if (extraDays > 0) {
//         return (packagePricePerDay * packageDays + extraDaysPricePerDay * extraDays) / totalDays;
//       }

//       return packagePricePerDay;
//     } else if (rentalType === "hours" && oneHourPackage) {
//       const packagePricePerHour = selectedPackage.price / selectedPackage.hours;
//       const extraHoursPricePerHour = oneHourPackage.price;

//       const totalHours = rentalHours;
//       const packageHours = selectedPackage.hours;
//       const extraHours = totalHours - packageHours;

//       if (extraHours > 0) {
//         return (packagePricePerHour * packageHours + extraHoursPricePerHour * extraHours) / totalHours;
//       }

//       return packagePricePerHour;
//     }

//     return selectedPackage.price / (selectedPackage.days || selectedPackage.hours || 1);
//   };

//   const formatDateForInput = (date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     const hours = String(date.getHours()).padStart(2, "0");
//     const minutes = String(date.getMinutes()).padStart(2, "0");
//     return `${year}-${month}-${day}T${hours}:${minutes}`;
//   };

//   const totalPrice = calculateTotalPrice();

//   const handleAddressChange = (field, value) => {
//     setAddressDetails((prevDetails) => ({ ...prevDetails, [field]: value }));

//     if (addressErrors[field]) {
//       setAddressErrors((prevErrors) => ({ ...prevErrors, [field]: false }));
//     }
//   };

//   const validateAddress = () => {
//     const errors = {
//       fullAddress: !addressDetails.fullAddress.trim(),
//       pinCode: !addressDetails.pinCode.trim()
//     };

//     setAddressErrors(errors);
//     return !errors.fullAddress && !errors.pinCode;
//   };

//   const handleSaveAddress = () => {
//     if (validateAddress()) {
//       setShowAddressPopup(false);
//     }
//   };

//   const handleProceedToCheckout = () => {
//     if (!selectedPackage) {
//       alert("Please select a rental package before proceeding.");
//       return;
//     }

//     if (pickupOption === "DELIVERY_AT_LOCATION" && !addressDetails.fullAddress) {
//       setShowAddressPopup(true);
//       return;
//     }

//     setShowConfirmation(true);
//   };

//   const switchRentalType = (type) => {
//     setRentalType(type);
    
//     if (type === "days" && dayPackages.length > 0) {
//       const bestPackage = findBestPackage(dayPackages, rentalDays);
//       setSelectedPackage(bestPackage);
      
//       // Update dates
//       const startDate = new Date(formData.startDate || new Date());
//       const endDate = new Date(startDate);
//       endDate.setDate(startDate.getDate() + (bestPackage?.days || 1));
      
//       setFormData({
//         ...formData,
//         startDate: formatDateForInput(startDate),
//         endDate: formatDateForInput(endDate)
//       });
//     } else if (type === "hours" && hourPackages.length > 0) {
//       const bestPackage = findBestHourPackage(hourPackages, rentalHours);
//       setSelectedPackage(bestPackage);
      
//       // Update dates
//       const startDate = new Date(formData.startDate || new Date());
//       const endDate = new Date(startDate);
//       endDate.setHours(startDate.getHours() + (bestPackage?.hours || 1));
      
//       setFormData({
//         ...formData,
//         startDate: formatDateForInput(startDate),
//         endDate: formatDateForInput(endDate)
//       });
//     }
//   };

//   const confirmCheckout = () => {
//     const deliveryCharge = pickupOption === "DELIVERY_AT_LOCATION" ? 250 : 0;
//     const checkoutData = {
//       bike,
//       totalPrice: calculateTotalPrice(),
//       selectedPackage,
//       rentalType,
//       rentalDays: rentalType === "days" ? rentalDays : 0,
//       rentalHours: rentalType === "hours" ? rentalHours : 0,
//       addressDetails,
//       pickupOption,
//       deliveryCharge,
//       pricePerUnit: calculatePricePerUnit(),
//       pickupDate: new Date(formData.startDate),
//       dropDate: new Date(formData.endDate),
//       storeName: bike.storeName || "Our Store Location: Rental Street",
//       storeId: bike.storeId, // Include the storeId from bike data

//     };

//     if (!isLoggedIn) {
//       sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
//       setIsLoginPopupOpen(true);
//       setShowConfirmation(false);
//       return;
//     }

//     setIsAnimating(true);
//     setShowConfirmation(false);

//     setTimeout(() => {
//       navigate("/checkout", { state: checkoutData });
//     }, 600);
//   };

//   const cancelCheckout = () => {
//     setShowConfirmation(false);
//   };

//   const handleLoginSuccess = () => {
//     setIsLoggedIn(true);
//     setIsLoginPopupOpen(false);

//     const savedData = sessionStorage.getItem('checkoutData');
//     if (savedData) {
//       navigate("/checkout", { state: JSON.parse(savedData) });
//       sessionStorage.removeItem('checkoutData');
//     }
//   };

//   const handleRegistrationSuccess = () => {
//     setIsLoggedIn(true);
//     setIsRegistrationPopupOpen(false);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 1 }}
//       animate={{ opacity: isAnimating ? 0 : 1 }}
//       transition={{ duration: 0.6 }}
//       className="container mx-auto py-6 px-4 lg:px-6 mt-14 relative"
//     >
//       <div className="grid lg:grid-cols-2 gap-6">
//         <div className="flex flex-col shadow border items-center rounded-lg overflow-hidden">
//           <img
//             src={bike.img || "/placeholder-image.jpg"}
//             alt={bike.name || "Bike Image"}
//             className="w-96 h-auto object-contain mt-32"
//           />
//           <p className="mt-3 text-gray-500 text-xs italic">
//             *Images are for representation purposes only.
//           </p>
//           {/* Terms and Conditions Section */}
//           <div className="mt-6 p-6 bg-gray-50 rounded-lg shadow-inner w-full">
//             <h2 className="text-xl font-bold text-gray-800 mb-4">Terms and Conditions</h2>
//             <ul className="list-disc pl-5 space-y-2 text-gray-600">
//               <li>
//                 <strong>Late fee applies after trip end from admin</strong> 
//               </li>
//               <li>
//                 <strong>₹100 per hour</strong> 
//               </li>
//               <li>
//                 <strong>Exchange bike categories and availability</strong>
//               </li>
//               <li>
//                 <strong>Cancellation not allowed </strong>
//               </li>
//             </ul>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
//           <h2 className="text-2xl font-bold text-gray-800">{bike.model || "Bike Name"}</h2>

//           {/* Rental Type Selection */}
//           <div className="space-y-2">
//             <h3 className="text-lg font-semibold text-gray-700">
//               <FaClock className="inline mr-2 text-indigo-400" /> Rental Type
//             </h3>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => switchRentalType("days")}
//                 disabled={dayPackages.length === 0}
//                 className={`py-2 px-4 border-2 rounded text-sm transition-all duration-300 ${
//                   rentalType === "days"
//                     ? "bg-indigo-300 text-black border-indigo-300"
//                     : "bg-white text-black border-indigo-300"
//                 } ${dayPackages.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
//               >
//                 Day Packages
//               </button>
//               <button
//                 onClick={() => switchRentalType("hours")}
//                 disabled={hourPackages.length === 0}
//                 className={`py-2 px-4 border-2 rounded text-sm transition-all duration-300 ${
//                   rentalType === "hours"
//                     ? "bg-indigo-300 text-black border-indigo-300"
//                     : "bg-white text-black border-indigo-300"
//                 } ${hourPackages.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
//               >
//                 Hour Packages
//               </button>
//             </div>
//           </div>

//           {/* Day Packages */}
//           {rentalType === "days" && (
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-gray-700">
//                 <FaTags className="inline mr-2 text-indigo-400" /> Day Packages
//               </h3>
//               <div className="relative">
//                 <button
//                   onClick={() => setDayDropdownOpen(!dayDropdownOpen)}
//                   className={`py-2 px-4 border w-full flex justify-between items-center rounded transition-all duration-300 ${
//                     dayDropdownOpen ? "bg-indigo-300 text-black" : "bg-white text-black"
//                   }`}
//                 >
//                   <span>
//                     {selectedPackage && selectedPackage.days
//                       ? `${selectedPackage.days} Days (₹${selectedPackage.price})`
//                       : "Select Package"}
//                   </span>
//                   {dayDropdownOpen ? <AiOutlineCaretUp className="ml-2" /> : <AiOutlineCaretDown className="ml-2" />}
//                 </button>
//                 {dayDropdownOpen && (
//                   <div className="absolute z-10 mt-2 bg-white border shadow-lg rounded w-full">
//                     {dayPackages.length > 0 ? (
//                       dayPackages.map((pkg) => (
//                         <button
//                           key={pkg.id}
//                           onClick={() => handlePackageSelection(pkg)}
//                           className={`block w-full text-left py-2 px-4 hover:bg-indigo-100 text-sm transition-all duration-300 ${
//                             selectedPackage?.id === pkg.id ? "bg-indigo-300" : "text-gray-800"
//                           }`}
//                         >
//                           {pkg.days} Days (₹{pkg.price})
//                         </button>
//                       ))
//                     ) : (
//                       <p className="text-gray-500 text-center p-2">No day packages available</p>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Hour Packages */}
//           {rentalType === "hours" && (
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-gray-700">
//                 <FaTags className="inline mr-2 text-indigo-400" /> Hour Packages
//               </h3>
//               <div className="relative">
//                 <button
//                   onClick={() => setHourDropdownOpen(!hourDropdownOpen)}
//                   className={`py-2 px-4 border w-full flex justify-between items-center rounded transition-all duration-300 ${
//                     hourDropdownOpen ? "bg-indigo-300 text-black" : "bg-white text-black"
//                   }`}
//                 >
//                   <span>
//                     {selectedPackage && selectedPackage.hours
//                       ? `${selectedPackage.hours} Hours (₹${selectedPackage.price})`
//                       : "Select Package"}
//                   </span>
//                   {hourDropdownOpen ? <AiOutlineCaretUp className="ml-2" /> : <AiOutlineCaretDown className="ml-2" />}
//                 </button>
//                 {hourDropdownOpen && (
//                   <div className="absolute z-10 mt-2 bg-white border shadow-lg rounded w-full">
//                     {hourPackages.length > 0 ? (
//                       hourPackages.map((pkg) => (
//                         <button
//                           key={pkg.id}
//                           onClick={() => handlePackageSelection(pkg)}
//                           className={`block w-full text-left py-2 px-4 hover:bg-indigo-100 text-sm transition-all duration-300 ${
//                             selectedPackage?.id === pkg.id ? "bg-indigo-300" : "text-gray-800"
//                           }`}
//                         >
//                           {pkg.hours} Hours (₹{pkg.price})
//                         </button>
//                       ))
//                     ) : (
//                       <p className="text-gray-500 text-center p-2">No hour packages available</p>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold text-gray-700">
//               <FaCalendarAlt className="inline mr-2 text-indigo-400" /> Rental Duration
//             </h3>
//             <div className="text-sm text-gray-600">
//               <p>From: {formatDateTime(formData.startDate)}</p>
//               <p>To: {formatDateTime(formData.endDate)}</p>
//               <p>Duration: {rentalType === "days" ? `${rentalDays} Days` : `${rentalHours} Hours`}</p>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold text-gray-700">
//               <FaMapMarkerAlt className="inline mr-2 text-indigo-400" /> Pickup Option
//             </h3>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setPickupOption("SELF_PICKUP")}
//                 className={`py-2 px-4 border-2 rounded text-sm transition-all duration-300 ${
//                   pickupOption === "SELF_PICKUP"
//                     ? "bg-indigo-300 text-black border-indigo-300"
//                     : "bg-white text-black border-indigo-300"
//                 }`}
//               >
//                 Self Pickup
//               </button>
//               <button
//                 onClick={() => {
//                   setPickupOption("DELIVERY_AT_LOCATION");
//                   setShowAddressPopup(true);
//                 }}
//                 className={`py-2 px-4 border-2 rounded text-sm transition-all duration-300 ${
//                   pickupOption === "DELIVERY_AT_LOCATION"
//                     ? "bg-indigo-300 text-black border-indigo-300"
//                     : "bg-white text-black border-indigo-300"
//                 }`}
//               >
//                 Delivery at Location
//               </button>
//             </div>
//             {pickupOption === "DELIVERY_AT_LOCATION" && addressDetails.fullAddress && (
//               <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
//                 <p className="text-sm font-medium text-gray-800">Delivery Address:</p>
//                 <p className="text-sm text-gray-600">{addressDetails.fullAddress}</p>
//                 {addressDetails.pinCode && <p className="text-sm text-gray-600">Pin: {addressDetails.pinCode}</p>}
//                 {addressDetails.nearby && <p className="text-sm text-gray-600">Landmark: {addressDetails.nearby}</p>}
//                 <button
//                   onClick={() => setShowAddressPopup(true)}
//                   className="text-xs text-indigo-500 mt-1 hover:text-indigo-600"
//                 >
//                   Edit Address
//                 </button>
//               </div>
//             )}
//           </div>

//           <div className="mt-4 space-y-2">
//             <h3 className="text-lg font-bold text-gray-800">Price Breakdown:</h3>
//             {rentalType === "days" && selectedPackage && selectedPackage.days && (
//               <>
//                 {/* <p className="text-sm text-gray-600">
//                   <strong>Package:</strong> {selectedPackage.days} Days (₹{selectedPackage.price})
//                 </p> */}
//                 {/* {rentalDays > selectedPackage.days && oneDayPackage && (
//                   <p className="text-sm text-gray-600">
//                     <strong>Extra Days:</strong> {rentalDays - selectedPackage.days} Days (₹{(rentalDays - selectedPackage.days) * oneDayPackage.price})
//                   </p>
//                 )} */}
//               </>
//             )}
//             {rentalType === "hours" && selectedPackage && selectedPackage.hours && (
//               <>
//                 <p className="text-sm text-gray-600">
//                   <strong>Package:</strong> {selectedPackage.hours} Hours (₹{selectedPackage.price})
//                 </p>
//                 {rentalHours > selectedPackage.hours && oneHourPackage && (
//                   <p className="text-sm text-gray-600">
//                     <strong>Extra Hours:</strong> {rentalHours - selectedPackage.hours} Hours (₹{(rentalHours - selectedPackage.hours) * oneHourPackage.price})
//                   </p>
//                 )}
//               </>
//             )}
//             <p className="text-sm text-gray-600">
//               <strong>Delivery Charge:</strong> ₹{pickupOption === "DELIVERY_AT_LOCATION" ? 250 : 0}
//             </p>
//             <hr className="my-2" />
//             <h3 className="text-lg font-bold text-gray-800">
//               Total Price: ₹{totalPrice.toFixed(2)}
//             </h3>
//             {/* <p className="text-sm text-gray-600">
//               <strong>Price per {rentalType === "days" ? "day" : "hour"}:</strong> ₹{calculatePricePerUnit().toFixed(2)}
//             </p> */}
//           </div>

//           <button
//             onClick={handleProceedToCheckout}
//             disabled={isLoading}
//             className={`w-full py-3 bg-indigo-400 text-white font-semibold rounded hover:bg-indigo-500 transition-all duration-300 ${
//               isLoading ? "opacity-70 cursor-not-allowed" : ""
//             }`}
//           >
//             {isLoading ? "Processing..." : "Proceed to Checkout"}
//           </button>

//           {isLoginPopupOpen && (
//             <LoginPopup
//               onClose={() => setIsLoginPopupOpen(false)}
//               onLogin={handleLoginSuccess}
//               openRegistration={() => {
//                 setIsLoginPopupOpen(false);
//                 setIsRegistrationPopupOpen(true);
//               }}
//             />
//           )}

//           {isRegistrationPopupOpen && (
//             <RegistrationPopup
//               onClose={() => setIsRegistrationPopupOpen(false)}
//               openLogin={() => {
//                 setIsRegistrationPopupOpen(false);
//                 setIsLoginPopupOpen(true);
//               }}
//             />
//           )}
//         </div>
//       </div>

//       {showAddressPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.9 }}
//             className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-[90%] space-y-4"
//           >
//             <h2 className="text-lg font-semibold text-gray-800">Enter Delivery Address</h2>
//             <div className="space-y-2">
//               <label className="block text-sm font-medium">
//                 Full Address <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={addressDetails.fullAddress}
//                 onChange={(e) => handleAddressChange("fullAddress", e.target.value)}
//                 className={`w-full p-2 border rounded text-sm ${
//                   addressErrors.fullAddress ? "border-red-500" : "border-gray-300"
//                 }`}
//                 placeholder="Enter full address"
//                 required
//               />
//               {addressErrors.fullAddress && (
//                 <p className="text-red-500 text-xs mt-1">Full address is required</p>
//               )}
//             </div>
//             <div className="space-y-2">
//               <label className="block text-sm font-medium">
//                 Pin Code <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={addressDetails.pinCode}
//                 onChange={(e) => handleAddressChange("pinCode", e.target.value)}
//                 className={`w-full p-2 border rounded text-sm ${
//                   addressErrors.pinCode ? "border-red-500" : "border-gray-300"
//                 }`}
//                 placeholder="Enter pin code"
//                 required
//               />
//               {addressErrors.pinCode && (
//                 <p className="text-red-500 text-xs mt-1">Pin code is required</p>
//               )}
//             </div>
//             <div className="space-y-2">
//               <label className="block text-sm font-medium">Nearby Landmark</label>
//               <input
//                 type="text"
//                 value={addressDetails.nearby}
//                 onChange={(e) => handleAddressChange("nearby", e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded text-sm"
//                 placeholder="Enter nearby landmark (optional)"
//               />
//             </div>
//             <div className="flex justify-end gap-2 pt-2">
//               <button
//                 onClick={() => setShowAddressPopup(false)}
//                 className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-all"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSaveAddress}
//                 className="px-4 py-2 bg-indigo-400 text-white rounded hover:bg-indigo-500 transition-all"
//               >
//                 Save
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       )}

//       <AnimatePresence>
//         {showConfirmation && (
//           <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//               transition={{ duration: 0.2 }}
//               className="bg-white p-6 rounded-lg shadow-xl border-l-4 border-indigo-400 max-w-md w-11/12"
//             >
//               <div className="flex flex-col items-center">
//                 <h3 className="text-xl font-semibold mb-3 text-gray-800">Are you sure?</h3>
//                 <p className="text-center text-gray-600 mb-6">
//                   Ready to proceed with your bike rental for {rentalType === "days" ? `${rentalDays} days` : `${rentalHours} hours`}?
//                   <br />
//                   Total amount: ₹{totalPrice.toFixed(2)}
//                 </p>
//                 <div className="flex gap-4 w-full">
//                   <button
//                     onClick={cancelCheckout}
//                     className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-all duration-300 font-medium"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={confirmCheckout}
//                     className="flex-1 py-2 px-4 bg-indigo-400 text-white rounded hover:bg-indigo-500 transition-all duration-300 font-medium"
//                   >
//                     Confirm
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// };

// // Helper function to format date for display
// const formatDateTime = (datetime) => {
//   if (!datetime) return "Select";
//   const date = new Date(datetime);
//   const day = String(date.getDate()).padStart(2, "0");
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const year = date.getFullYear();
//   const hours = String(date.getHours()).padStart(2, "0");
//   const minutes = String(date.getMinutes()).padStart(2, "0");
//   return `${day}/${month}/${year} ${hours}:${minutes}`;
// };

// export default BikeDetailsPage;