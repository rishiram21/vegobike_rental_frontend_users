import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaCalendarAlt, FaTags, FaSyncAlt } from "react-icons/fa";
import { AiOutlinePlus, AiOutlineMinus, AiOutlineCaretDown, AiOutlineCaretUp } from "react-icons/ai";
import LoginPopup from "../components/LoginPopup";
import RegistrationPopup from "../components/RegistrationPopup";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalState } from "../context/GlobalStateContext";
import { useAuth } from "../context/AuthContext";

const BikeDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bike = location.state || {};
  const { formData, setFormData } = useGlobalState();
  const { token } = useAuth();
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isRegistrationPopupOpen, setIsRegistrationPopupOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [oneDayPackage, setOneDayPackage] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pickupOption, setPickupOption] = useState("SELF_PICKUP");
  const [showAddressPopup, setShowAddressPopup] = useState(false);
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log("Token from AuthContext:", token);
  }, [token]);

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
    }

    if (bike.categoryId) {
      fetchPackages(bike.categoryId);
    }

    window.scrollTo(0, 0);

    // Set default dates on initial load
    const currentDate = new Date();
    const roundedStartDate = roundToNextHour(currentDate);
    const roundedEndDate = new Date(roundedStartDate);
    roundedEndDate.setDate(roundedStartDate.getDate() + 1);

    setStartDate(formatDateForInput(roundedStartDate));
    setEndDate(formatDateForInput(roundedEndDate));
    setFormData((prevData) => ({
      ...prevData,
      startDate: formatDateForInput(roundedStartDate),
      endDate: formatDateForInput(roundedEndDate),
    }));
  }, [bike.categoryId, token, setFormData]);

  useEffect(() => {
    if (packages.length > 0 && selectedPackage) {
      const packageForDays = packages.find(pkg => pkg.days === rentalDays);
      if (packageForDays) {
        setSelectedPackage(packageForDays);
      }
    }
  }, [rentalDays, packages, selectedPackage]);

  const fetchPackages = async (categoryId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/package/list/${categoryId}`);
      const data = await response.json();
      const activePackages = data.filter(pkg => pkg.active);
      setPackages(activePackages);

      if (activePackages.length > 0) {
        setRentalDays(activePackages[0].days);
        setSelectedPackage(activePackages[0]);
        const oneDayPkg = activePackages.find(pkg => pkg.days === 1);
        setOneDayPackage(oneDayPkg);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      setPackages([]);
    }
  };

  // const handleRefresh = () => {
  //   window.location.reload();
  // };

  const handlePackageSelection = (pkg) => {
    setSelectedPackage(pkg);
    setDropdownOpen(false);
    setRentalDays(pkg.days);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedStartDate = startDate;
    let updatedEndDate = endDate;
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
      if (endDate && new Date(endDate) <= new Date(updatedStartDate)) {
        const newEndDate = new Date(updatedStartDate);
        newEndDate.setDate(newEndDate.getDate() + 1);
        updatedEndDate = formatDateForInput(newEndDate);
      }
    }

    if (name === 'endDate') {
      const selectedEndDate = new Date(value);
      const startDateObj = new Date(startDate);

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
    setStartDate(updatedStartDate);
    setEndDate(updatedEndDate);

    // Update form data
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

    // Calculate rental days based on the updated dates
    if (updatedStartDate && updatedEndDate) {
      const start = new Date(updatedStartDate);
      const end = new Date(updatedEndDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setRentalDays(diffDays);
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedPackage) return 0;

    const packagePrice = selectedPackage.price;
    const extraDays = rentalDays - selectedPackage.days;
    const extraDaysPrice = extraDays > 0 ? extraDays * (oneDayPackage ? oneDayPackage.price : 0) : 0;
    const deliveryCharge = pickupOption === "DELIVERY_AT_LOCATION" ? 250 : 0;

    return packagePrice + extraDaysPrice + deliveryCharge;
  };

  const calculatePricePerDay = () => {
    if (!selectedPackage) return 0;

    const packagePricePerDay = selectedPackage.price / selectedPackage.days;
    const extraDaysPricePerDay = oneDayPackage ? oneDayPackage.price : 0;

    const totalDays = rentalDays;
    const packageDays = selectedPackage.days;
    const extraDays = totalDays - packageDays;

    if (extraDays > 0) {
      return (packagePricePerDay * packageDays + extraDaysPricePerDay * extraDays) / totalDays;
    }

    return packagePricePerDay;
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
      pricePerDay: calculatePricePerDay(),
      pickupDate: new Date(startDate),
      dropDate: new Date(endDate),
      storeName: bike.storeName || "Our Store Location: Rental Street",
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

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isAnimating ? 0 : 1 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto py-12 px-4 lg:px-6 mt-14 relative"
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="flex flex-col shadow border items-center rounded-lg overflow-hidden">
          <img
            src={bike.img || "/placeholder-image.jpg"}
            alt={bike.name || "Bike Image"}
            className="w-96 h-auto object-cover mt-32"
          />
          <p className="mt-3 text-gray-500 text-xs italic">
            *Images are for representation purposes only.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">{bike.model || "Bike Name"}</h2>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              <FaTags className="inline mr-2 text-indigo-400" /> Rental Packages
            </h3>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`py-2 px-4 border w-full flex justify-between items-center rounded transition-all duration-300 ${
                  dropdownOpen ? "bg-indigo-300 text-black" : "bg-white text-black"
                }`}
              >
                <span>
                  {selectedPackage
                    ? `${selectedPackage.days} Days (₹${selectedPackage.price})`
                    : "Select Package"}
                </span>
                {dropdownOpen ? <AiOutlineCaretUp className="ml-2" /> : <AiOutlineCaretDown className="ml-2" />}
              </button>
              {dropdownOpen && (
                <div className="absolute z-10 mt-2 bg-white border shadow-lg rounded w-full">
                  {packages.length > 0 ? (
                    packages.map((pkg) => (
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
                    <p className="text-gray-500 text-center p-2">No packages available</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              <FaCalendarAlt className="inline mr-2 text-indigo-400" /> Rental Duration
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">{rentalDays} Days</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              <FaCalendarAlt className="inline mr-2 text-indigo-400" /> Start Date & Time
            </h3>
            <input
              type="datetime-local"
              name="startDate"
              value={startDate}
              min={formatDateForInput(new Date())}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border outline-none focus:ring-2 focus:ring-indigo-500 hover:shadow-md transition-all duration-300 rounded-md"
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              <FaCalendarAlt className="inline mr-2 text-indigo-400" /> End Date & Time
            </h3>
            <input
              type="datetime-local"
              name="endDate"
              value={endDate}
              min={startDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border outline-none focus:ring-2 focus:ring-indigo-500 hover:shadow-md transition-all duration-300 rounded-md"
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
            )}
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
            <p className="text-sm text-gray-600">
              <strong>Package:</strong> {selectedPackage?.days || 0} Days (₹{selectedPackage?.price || 0})
            </p>
            <p className="text-sm text-gray-600">
              <strong>Delivery Charge:</strong> ₹{pickupOption === "DELIVERY_AT_LOCATION" ? 250 : 0}
            </p>
            <hr className="my-2" />
            <h3 className="text-lg font-bold text-gray-800">
              Total Price: ₹{totalPrice.toFixed(2)}
            </h3>
          </div>

          <button
            onClick={handleProceedToCheckout}
            className="w-full py-3 bg-indigo-400 text-white font-semibold rounded hover:bg-indigo-500 transition-all duration-300"
          >
            Proceed to Checkout
          </button>

          {/* <button
            onClick={handleRefresh}
            className="fixed bottom-4 right-4 bg-indigo-500 text-white p-3 square shadow-lg z-50 flex items-center gap-2"
          >
            <FaSyncAlt size={24} />
          </button> */}

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
                type="text"
                value={addressDetails.pinCode}
                onChange={(e) => handleAddressChange("pinCode", e.target.value)}
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
