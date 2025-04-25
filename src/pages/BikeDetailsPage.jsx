import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaCalendarAlt, FaTags } from "react-icons/fa";
import { AiOutlinePlus, AiOutlineMinus, AiOutlineCaretDown, AiOutlineCaretUp } from "react-icons/ai";
import LoginPopup from "../components/LoginPopup";
import RegistrationPopup from "../components/RegistrationPopup";
import { motion, AnimatePresence } from "framer-motion";

const BikeDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bike = location.state || {};
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isRegistrationPopupOpen, setIsRegistrationPopupOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const serviceCharge = 2;

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
  const [rentalDays, setRentalDays] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    console.log("BikeDetailsPage - Token in localStorage:", token);
    if (token) {
      setIsLoggedIn(true);
    }

    if (bike.categoryId) {
      fetchPackages(bike.categoryId);
    }

    // Scroll to top when the component mounts
    window.scrollTo(0, 0);
  }, [bike.categoryId]);

  useEffect(() => {
    // Automatically select the package based on rental days
    if (packages.length > 0) {
      const packageForDays = packages.find(pkg => pkg.days === rentalDays);
      if (packageForDays) {
        setSelectedPackage(packageForDays);
      } else {
        setSelectedPackage(packages[0]);
      }
    }
  }, [rentalDays, packages]);

  const fetchPackages = async (categoryId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/package/list/${categoryId}`);
      const data = await response.json();

      // Filter active packages
      const activePackages = data.filter(pkg => pkg.active);
      setPackages(activePackages);

      if (activePackages.length > 0) {
        setRentalDays(activePackages[0].days);

        // Find the 1-day package
        const oneDayPkg = activePackages.find(pkg => pkg.days === 1);
        setOneDayPackage(oneDayPkg);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      setPackages([]);
    }
  };

  const handlePackageSelection = (pkg) => {
    setSelectedPackage(pkg);
    setDropdownOpen(false);
    setRentalDays(pkg.days);
  };

  const handleIncreaseDays = () => {
    setRentalDays((prevDays) => prevDays + 1);
  };

  const handleDecreaseDays = () => {
    setRentalDays((prevDays) => Math.max(1, prevDays - 1));
  };

  // Calculate total price correctly
  const calculateTotalPrice = () => {
    if (!selectedPackage) return 0;

    const packagePrice = selectedPackage.price;
    const extraDays = rentalDays - selectedPackage.days;
    const extraDaysPrice = extraDays > 0 ? extraDays * (oneDayPackage ? oneDayPackage.price : 0) : 0;
    const deliveryCharge = pickupOption === "DELIVERY_AT_LOCATION" ? 250 : 0;

    return packagePrice + extraDaysPrice + deliveryCharge + serviceCharge;
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
  };

  const handleProceedToCheckout = () => {
    if (!selectedPackage) {
      alert("Please select a rental package before proceeding.");
      return;
    }

    // Show confirmation toast instead of proceeding immediately
    setShowToast(true);
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
      serviceCharge,
      pricePerDay: calculatePricePerDay(),
      pickupDate: new Date(),
      dropDate: new Date(Date.now() + (rentalDays * 24 * 60 * 60 * 1000)),
      storeName: bike.storeName || "Our Store Location: Rental Street",
    };

    if (!isLoggedIn) {
      sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      setIsLoginPopupOpen(true);
      setShowToast(false);
      return;
    }

    // Start the page transition animation
    setIsAnimating(true);

    // Hide the toast
    setShowToast(false);

    // Navigate after animation completes
    setTimeout(() => {
      navigate("/checkout", { state: checkoutData });
    }, 600);
  };

  const cancelCheckout = () => {
    setShowToast(false);
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
      className="container mx-auto py-12 px-4 lg:px-6 mt-14"
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
              <FaTags className="inline mr-2 text-orange-400" /> Rental Packages
            </h3>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`py-2 px-4 border w-full flex justify-between items-center rounded transition-all duration-300 ${
                  dropdownOpen ? "bg-orange-300 text-black" : "bg-white text-black"
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
                        className={`block w-full text-left py-2 px-4 hover:bg-orange-100 text-sm transition-all duration-300 ${
                          selectedPackage?.id === pkg.id ? "bg-orange-300" : "text-gray-800"
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
              <FaCalendarAlt className="inline mr-2 text-orange-400" /> Rental Duration
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecreaseDays}
                className="px-3 py-2 bg-gray-200 text-gray-800 rounded text-sm"
              >
                <AiOutlineMinus />
              </button>
              <span className="text-lg font-bold">{rentalDays} Days</span>
              <button
                onClick={handleIncreaseDays}
                className="px-3 py-2 bg-gray-200 text-gray-800 rounded text-sm"
              >
                <AiOutlinePlus />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              <FaMapMarkerAlt className="inline mr-2 text-orange-400" /> Pickup Option
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => setPickupOption("SELF_PICKUP")}
                className={`py-2 px-4 border-2 rounded text-sm transition-all duration-300 ${
                  pickupOption === "SELF_PICKUP"
                    ? "bg-orange-300 text-black border-orange-300"
                    : "bg-white text-black border-orange-300"
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
                    ? "bg-orange-300 text-black border-orange-300"
                    : "bg-white text-black border-orange-300"
                }`}
              >
                Delivery at Location
              </button>
            </div>
          </div>

          {showAddressPopup && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4">
                <h2 className="text-lg font-semibold">Enter Delivery Address</h2>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Full Address</label>
                  <input
                    type="text"
                    value={addressDetails.fullAddress}
                    onChange={(e) => handleAddressChange("fullAddress", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    placeholder="Enter full address"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Pin Code</label>
                  <input
                    type="text"
                    value={addressDetails.pinCode}
                    onChange={(e) => handleAddressChange("pinCode", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    placeholder="Enter pin code"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Nearby Landmark</label>
                  <input
                    type="text"
                    value={addressDetails.nearby}
                    onChange={(e) => handleAddressChange("nearby", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    placeholder="Enter nearby landmark"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddressPopup(false)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowAddressPopup(false)}
                    className="px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-bold text-gray-800">Price Breakdown:</h3>
            <p className="text-sm text-gray-600">
              <strong>Package:</strong> {selectedPackage?.days || 0} Days (₹{selectedPackage?.price || 0})
            </p>
            {/* {rentalDays > (selectedPackage?.days || 0) && (
              <p className="text-sm text-gray-600">
                <strong>Extra Days Cost:</strong> ₹{oneDayPackage?.price || 0} × {rentalDays - selectedPackage?.days} days = ₹{((oneDayPackage?.price || 0) * (rentalDays - selectedPackage?.days)).toFixed(2)}
              </p>
            )} */}
            <p className="text-sm text-gray-600">
              <strong>Delivery Charge:</strong> ₹{pickupOption === "DELIVERY_AT_LOCATION" ? 250 : 0}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Convenience Charge:</strong> ₹{serviceCharge}
            </p>
            <hr className="my-2" />
            <h3 className="text-lg font-bold text-gray-800">
              Total Price: ₹{totalPrice.toFixed(2)}
            </h3>
          </div>

          <button
            onClick={handleProceedToCheckout}
            className="w-full py-3 bg-orange-400 text-white font-semibold rounded hover:bg-orange-500 transition-all duration-300"
          >
            Proceed to Checkout
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

      {/* Confirmation Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg border-l-4 border-orange-400 z-50 w-80"
          >
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-2">Are you sure?</h3>
              <p className="text-sm text-gray-600 mb-4">Ready to proceed with your bike rental?</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={cancelCheckout}
                  className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-all duration-300"
                >
                  No
                </button>
                <button
                  onClick={confirmCheckout}
                  className="flex-1 py-2 px-4 bg-orange-400 text-white rounded hover:bg-orange-500 transition-all duration-300"
                >
                  Yes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BikeDetailsPage;
