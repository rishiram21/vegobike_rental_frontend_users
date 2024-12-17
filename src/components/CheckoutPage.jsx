// src/components/CheckoutPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalState } from "../context/GlobalStateContext";
import { FaRegCalendarAlt, FaClock, FaMapMarkerAlt, FaClipboardCheck } from "react-icons/fa"; // Icons from react-icons
import { motion } from "framer-motion"; // Animation library

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize the navigate function
  const { bike, totalPrice, rentalDays, selectedPackage, deliveryLocation, pickupDate, dropDate } = location.state || {};
  const { addOrder } = useGlobalState();

  const [couponCode, setCouponCode] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false); // Track payment status
  const [paymentError, setPaymentError] = useState(false); // Track payment failure

  // Coupon codes and their discounts
  const coupons = {
    SAVE10: 10,
    RENT20: 20,
  };

  const depositAmount = bike?.deposit || 0;
  const deliveryCharge = deliveryLocation ? 250 : 0;

  useEffect(() => {
    // Load Razorpay SDK dynamically
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setIsRazorpayLoaded(true);
    script.onerror = () => setIsRazorpayLoaded(false);
    document.body.appendChild(script);
  }, []);

  const handleApplyCoupon = () => {
    if (coupons[couponCode.toUpperCase()]) {
      const discountPercent = coupons[couponCode.toUpperCase()];
      setDiscount((totalPrice * discountPercent) / 100);
    } else {
      setDiscount(0);
      alert("Invalid Coupon Code");
    }
  };

  const payableAmount = Math.max(0, totalPrice - discount);

  const handlePayment = () => {
    if (!termsAccepted) {
      alert("Please accept the terms and conditions to proceed.");
      return;
    }

    if (!isRazorpayLoaded) {
      alert("Razorpay SDK not loaded. Please check your internet connection.");
      return;
    }

    const options = {
      key: "rzp_test_f7cxGXAuIgXb7p", // Test mode API key
      amount: payableAmount * 100, // Razorpay expects the amount in paise
      currency: "INR",
      name: "Bike Rental Service",
      description: "Payment for Bike Rental",
      image: "/path/to/logo.png",
      handler: function (response) {
        setPaymentSuccess(true); // Payment successful
        addOrder({
          bike: bike.name,
          rentalDays,
          totalPrice: payableAmount,
          orderDate: new Date().toLocaleDateString(),
          status: "Active",
        });
        navigate("/orders"); // Redirect to the orders page after successful payment
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "+91XXXXXXXXXX",
      },
      theme: {
        color: "#FF6A00",
      },
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.on("payment.failed", function (response) {
      setPaymentError(true); // Payment failed
    });

    rzp1.open();
  };

  return (
    <motion.div
      className="flex flex-col min-h-screen bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto py-8 px-4 lg:px-8 flex-grow">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Section: Bike and Summary */}
          <div className="lg:col-span-2 bg-white shadow-lg rounded-lg p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Rental Summary</h2>
            <div className="flex items-center space-x-4">
              <img
                src={bike?.img || "/placeholder-image.jpg"}
                alt={bike?.name || "Bike"}
                className="w-[150px] h-[108px] rounded-lg object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold">{bike?.name || "Bike Name"}</h3>
                <p className="text-sm text-gray-600">Rental Package: {selectedPackage}</p>
                <p className="text-sm text-gray-600">Rental Days: {rentalDays}</p>
                <p className="text-sm text-gray-600">Bike Rental Amount: ₹{totalPrice - depositAmount - deliveryCharge}</p>
              </div>
            </div>

            {/* Pickup and Drop Date/Time */}
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Pickup and Drop Date/Time</h3>
              <div className="flex items-center space-x-2">
                <FaRegCalendarAlt className="text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Pickup Date: {pickupDate ? new Date(pickupDate).toLocaleDateString() : "N/A"}</p>
                  <p className="text-sm text-gray-600">Drop Date: {dropDate ? new Date(dropDate).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FaClock className="text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Pickup Time: 10:00 AM</p>
                  <p className="text-sm text-gray-600">Drop Time: 6:00 PM</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700">Pickup and Drop Location</h3>
              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-orange-500" />
                <p className="text-sm text-gray-600">
                  {deliveryLocation ? `Delivery Location: ${deliveryLocation}` : "Pickup: Self Pickup"}
                </p>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700">Terms and Conditions</h3>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>A valid government-issued ID is required at pickup.</li>
                <li>Renter is responsible for fuel costs.</li>
                <li>Late returns will incur additional charges.</li>
                <li>Vehicles must be returned in the same condition as rented.</li>
              </ul>
            </div>
          </div>

          {/* Right Section: Coupon, Amount Breakdown, and Payment */}
          <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">Apply Coupon</h3>
            {!showCouponInput ? (
              <button
                onClick={() => setShowCouponInput(true)}
                className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
              >
                Apply Coupon Code
              </button>
            ) : (
              <div className="space-y-2">
                <select
                  className="w-full p-2 border rounded"
                  onChange={(e) => setCouponCode(e.target.value)}
                >
                  <option value="">Select Coupon</option>
                  <option value="SAVE10">SAVE10 - 10% Off</option>
                  <option value="RENT20">RENT20 - 20% Off</option>
                </select>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon manually"
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
                >
                  Apply Coupon
                </button>
              </div>
            )}

            {/* Amount Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Amount Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Rent Amount:</span>
                  <span>₹{totalPrice - depositAmount - deliveryCharge}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deposit:</span>
                  <span>₹{depositAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span>₹{deliveryCharge}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-₹{discount}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total Payable:</span>
                  <span>₹{payableAmount}</span>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mt-6 flex justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={() => setTermsAccepted(!termsAccepted)}
                  className="h-4 w-4"
                />
                <label className="text-sm">I accept the terms and conditions</label>
              </div>

              <button
                onClick={handlePayment}
                className={`${
                  !termsAccepted || payableAmount <= 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600"
                } text-white py-2 px-4 rounded-lg transition`}
                disabled={!termsAccepted || payableAmount <= 0}
              >
                Pay ₹{payableAmount}
              </button>
            </div>

            {paymentSuccess && (
              <motion.div
                className="mt-6 text-green-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Payment successful! Your order is being processed.
              </motion.div>
            )}
            {paymentError && (
              <motion.div
                className="mt-6 text-red-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Payment failed. Please try again.
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;
