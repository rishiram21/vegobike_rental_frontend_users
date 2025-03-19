import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalState } from "../context/GlobalStateContext";
import { FaRegCalendarAlt, FaMapMarkerAlt, FaClipboardCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import numberToWords from 'number-to-words';

const convertToWords = (amount) => {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  const rupeesInWords = numberToWords.toWords(rupees);
  const paiseInWords = numberToWords.toWords(paise);
  return `${rupeesInWords} rupees and ${paiseInWords} paise`;
};

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addOrder } = useGlobalState();

  const [checkoutData, setCheckoutData] = useState(location.state || {});
  const [loadingData, setLoadingData] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [couponLoading, setCouponLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [selectedCouponFromDropdown, setSelectedCouponFromDropdown] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/coupons`);
        setCoupons([
          { code: "SAVE10", discountPercentage: 10 },
          { code: "RENT20", discountPercentage: 20 },
          ...response.data
        ]);
      } catch (error) {
        console.error("Failed to fetch coupons:", error);
        setCoupons([
          { code: "SAVE10", discountPercentage: 10 },
          { code: "RENT20", discountPercentage: 20 }
        ]);
      } finally {
        setCouponLoading(false);
      }
    };

    const sessionData = sessionStorage.getItem('checkoutData');
    if (location.state) {
      setCheckoutData(location.state);
      sessionStorage.setItem('checkoutData', JSON.stringify(location.state));
    } else if (sessionData) {
      setCheckoutData(JSON.parse(sessionData));
    }

    fetchCoupons();
    setLoadingData(false);
  }, [location.state]);

  const {
    bike = {},
    rentalDays = 1,
    selectedPackage = {},
    addressDetails = {},
    pickupOption = "Self Pickup",
    pickupDate = new Date(),
    dropDate = new Date(),
    storeName = ""
  } = checkoutData;

  const depositAmount = bike?.deposit || 0;
  const deliveryCharge = pickupOption === "Delivery at Location" ? 250 : 0;
  const serviceCharge = 2;

  const basePrice = selectedPackage?.price * rentalDays;
  
  // Apply GST only to base price and delivery charge
  const gstableAmount = basePrice + deliveryCharge;
  const gstAmount = gstableAmount * 0.18;
  
  const totalAmountBeforeDiscount = basePrice + depositAmount + deliveryCharge + serviceCharge + gstAmount;
  const payableAmount = Math.max(0, totalAmountBeforeDiscount - discount);

  // Handle dropdown selection
  const handleDropdownChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedCouponFromDropdown(selectedValue);
    if (selectedValue) {
      setCouponCode(selectedValue);
    }
  };

  const handleApplyCoupon = () => {
    // Prioritize text input over dropdown if both are filled
    const codeToApply = couponCode.trim() || selectedCouponFromDropdown;
    
    if (!codeToApply) {
      setCouponError("Please enter a coupon code or select one from the dropdown.");
      return;
    }

    const coupon = coupons.find(c => c.code.toUpperCase() === codeToApply.toUpperCase());
    if (!coupon) {
      setCouponError("Invalid coupon code.");
      return;
    }

    setCouponError("");
    setAppliedCoupon(coupon);
    setDiscount((basePrice * coupon.discountPercentage) / 100);
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setSelectedCouponFromDropdown("");
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponError("");
  };

  const handlePayment = async () => {
    if (!termsAccepted) {
      alert("Please accept the terms and conditions");
      return;
    }

    const isConfirmed = window.confirm("Are you sure you want to confirm the booking?");
    if (!isConfirmed) {
      return;
    }

    setIsProcessing(true);

    try {
      const bookingDetails = {
        vehicleId: bike.id,
        userId: 2,
        packageId: selectedPackage.id,
        totalAmount: payableAmount,
        startTime: new Date(pickupDate).toISOString().replace("T", " ").slice(0, 19),
        endTime: new Date(dropDate).toISOString().replace("T", " ").slice(0, 19),
        couponCode: appliedCoupon?.code || null,
        deliveryCharge: deliveryCharge,
        serviceCharge: serviceCharge,
        depositAmount: depositAmount
      };

      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/booking/book`, bookingDetails);

      const completeOrder = {
        ...response.data,
        bikeDetails: bike,
        totalPrice: payableAmount,
        rentalDays,
        selectedPackage,
        pickupOption,
        addressDetails,
        pickupDate,
        dropDate,
        status: response.data.status || "Confirmed"
      };

      setBookingConfirmed(true);
      addOrder({completeOrder});

      setTimeout(() => {
        navigate("/orders", {
          state: {
            order: completeOrder,
            checkoutData: checkoutData
          }
        });
      }, 5000);

    } catch (error) {
      console.error("Booking error:", error.response ? error.response.data : error.message);
      alert("Booking failed: " + (error.response?.data?.message || error.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-GB', options);
  };

  if (loadingData || couponLoading) {
    return <div className="text-center py-8">Loading booking details...</div>;
  }

  return (
    <motion.div
      className="flex flex-col min-h-screen bg-gray-100 mt-14"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto py-8 px-4 lg:px-8 flex-grow">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white shadow-lg rounded-lg p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Rental Summary</h2>

            <div className="flex items-center space-x-4">
              <img
                src={bike?.img || "/placeholder-image.jpg"}
                alt={bike?.model}
                className="w-[150px] h-[108px] rounded-lg object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold">{bike?.model}</h3>
                <p className="text-sm text-gray-600">
                  Package: {selectedPackage?.days} Days (₹{selectedPackage?.price}/day)
                </p>
                <p className="text-sm text-gray-600">Duration: {rentalDays} Days</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                <FaRegCalendarAlt className="inline mr-2 text-orange-500" />
                Pickup/Drop Dates
              </h3>
              <div className="flex items-center space-x-2">
                <div className="text-sm">
                  <p>Pickup: {formatDate(pickupDate)}</p>
                  <p>Drop: {formatDate(dropDate)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                <FaMapMarkerAlt className="inline mr-2 text-orange-500" />
                {pickupOption}
              </h3>
              <p className="text-sm text-gray-600">
                {pickupOption === "Self Pickup" ? storeName : addressDetails?.fullAddress || "Our Store Location: Rental Street"}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Terms & Conditions</h3>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>Valid ID required at pickup</li>
                <li>Fuel costs borne by renter</li>
                <li>Late return penalties apply</li>
                <li>Vehicle must be returned in original condition</li>
              </ul>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Apply Coupon</h3>
              <div className="space-y-3">
                {/* Dropdown for selecting from available coupons */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Select Available Coupon:</label>
                  <select
                    value={selectedCouponFromDropdown}
                    onChange={handleDropdownChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select a Coupon</option>
                    {coupons.map((coupon) => (
                      <option key={coupon.code} value={coupon.code}>
                        {coupon.code} - {coupon.discountPercentage}% OFF
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Text input for custom coupon code */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Or Enter Coupon Code:</label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <button
                  onClick={handleApplyCoupon}
                  className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
                >
                  Apply Coupon
                </button>
                
                {couponError && (
                  <p className="text-red-500 text-sm mt-1">{couponError}</p>
                )}
                
                {appliedCoupon && (
                  <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                    <p className="text-green-700 text-sm">
                      Applied: {appliedCoupon.code} - {appliedCoupon.discountPercentage}% OFF
                    </p>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-500 text-xs underline mt-1"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Price Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>₹{basePrice}</span>
                </div>
                <div className="flex justify-between text-pink-500">
                  <span>Delivery Charge:</span>
                  <span>₹{deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-pink-500">
                  <span>Convenience Fee:</span>
                  <span>₹{serviceCharge}</span>
                </div>
                <div className="flex justify-between text-pink-500">
                  <span>Security Deposit:</span>
                  <span>₹{depositAmount}</span>
                </div>
                <div className="flex justify-between text-pink-500">
                  <span>GST (18%):</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-teal-500">
                    <span>Discount:</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total Payable:</span>
                  <span>₹{payableAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={() => setTermsAccepted(!termsAccepted)}
                  className="h-4 w-4"
                />
                <span className="text-sm">I agree to terms & conditions</span>
              </div>
              <button
                onClick={handlePayment}
                disabled={!termsAccepted || isProcessing}
                className={`w-full py-2 px-4 rounded-lg transition-colors ${
                  !termsAccepted || isProcessing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              >
                {isProcessing ? "Processing..." : `Confirm Booking : ₹${payableAmount.toFixed(2)}`}
              </button>
              <p className="text-left mt-1 font-semibold">
                {`Total Payment in Words: ${convertToWords(payableAmount)}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {bookingConfirmed && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-white p-8 rounded-lg text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <FaClipboardCheck className="text-6xl text-green-500 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
            <p className="text-gray-600">Redirecting to orders page...</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CheckoutPage;