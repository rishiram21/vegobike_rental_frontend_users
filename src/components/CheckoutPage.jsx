import React, { useState } from "react";
import { useLocation } from "react-router-dom";

const CheckoutPage = () => {
  const location = useLocation();
  const { bike, totalPrice, rentalDays, selectedPackage, deliveryLocation } = location.state || {};

  const [couponCode, setCouponCode] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Coupon codes and their discounts
  const coupons = {
    SAVE10: 10, // 10% discount
    RENT20: 20, // 20% discount
  };

  const depositAmount = bike.deposit || 0;
  const deliveryCharge = deliveryLocation ? 250 : 0;

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

  // Razorpay Dummy Integration
  const handlePayment = () => {
    const options = {
      key: "OR5xsKVAmvlqJD", // Replace with your Razorpay key
      amount: payableAmount * 100, // Razorpay expects the amount in paise
      currency: "INR",
      name: "Bike Rental Service",
      description: "Payment for Bike Rental",
      image: "/path/to/logo.png", // Add your logo image path
      handler: function (response) {
        alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
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
    rzp1.open();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <div className="container mx-auto py-8 px-4 lg:px-8 flex-grow">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Summary */}
          <div className="lg:col-span-2 bg-white shadow-lg rounded-lg p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Summary</h2>

            {/* Bike Image and Details */}
            <div className="flex items-center space-x-4">
              <img
                src={bike.img || "/placeholder-image.jpg"}
                alt={bike.name || "Bike"}
                className="w-[150px] h-[108px] rounded-lg object-cover"  // Updated image size
              />
              <div>
                <h3 className="text-lg font-semibold">{bike.name || "Bike Name"}</h3>
                <p className="text-sm text-gray-600">Rental Package: {selectedPackage}</p>
                <p className="text-sm text-gray-600">Rental Days: {rentalDays}</p>
                <p className="text-sm text-gray-600">Bike Rental Amount: ₹{totalPrice - depositAmount - deliveryCharge}</p>
              </div>
            </div>

            {/* Pickup and Drop Date/Time */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700">Pickup and Drop Date/Time</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Pickup Date:</span>
                  <span>{new Date().toLocaleDateString()}</span> {/* You can adjust the format as needed */}
                </div>
                <div className="flex justify-between">
                  <span>Pickup Time:</span>
                  <span>10:00 AM</span> {/* Adjust as needed */}
                </div>
                <div className="flex justify-between">
                  <span>Drop Date:</span>
                  <span>{new Date().toLocaleDateString()}</span> {/* Adjust this as needed */}
                </div>
                <div className="flex justify-between">
                  <span>Drop Time:</span>
                  <span>6:00 PM</span> {/* Adjust this as needed */}
                </div>
              </div>
            </div>

            {/* Pickup and Drop Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Pickup and Drop Location</h3>
              <p className="text-sm text-gray-600 mt-2">
                {deliveryLocation ? `Delivery Location: ${deliveryLocation}` : "Pickup: Self Pickup"}
              </p>
            </div>

            {/* Reminder and Terms and Conditions */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700">Reminder</h3>
              <p className="text-sm text-gray-600 mt-2">
                Please ensure to carry a valid ID proof while picking up the bike.
              </p>

              <h3 className="text-lg font-semibold text-gray-700 mt-6">Terms and Conditions</h3>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>A valid government-issued ID is required at pickup.</li>
                <li>Renter is responsible for fuel costs.</li>
                <li>Late returns will incur additional charges.</li>
                <li>Vehicles must be returned in the same condition as rented.</li>
              </ul>
            </div>
          </div>

          {/* Right: Coupon and Payment */}
          <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
            {/* Coupon Section */}
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
                  <span>Total Payable Amount:</span>
                  <span>₹{payableAmount}</span>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4"
              />
              <label className="text-sm text-gray-600">
                I have read and accept the terms and conditions
              </label>
            </div>

            {/* Pay Now Button */}
            <button
              onClick={handlePayment}
              className={`w-full py-3 rounded-lg ${
                termsAccepted ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-300 cursor-not-allowed"
              } text-white transition`}
              disabled={!termsAccepted}
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4 mt-auto">
        © 2024 Bike Rental. All rights reserved.
      </footer>
    </div>
  );
};

export default CheckoutPage;
