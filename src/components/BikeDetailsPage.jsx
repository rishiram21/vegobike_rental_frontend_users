import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BikeDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bike = location.state || {};

  const [selectedPackage, setSelectedPackage] = useState("Per Day");
  const [rentalDays, setRentalDays] = useState(1);
  const [pickupOption, setPickupOption] = useState("Self Pickup");
  const [showPolicy, setShowPolicy] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState("");

  // Package prices logic with discounts
  const basePricePerDay = bike.basePrice || 0;
  const packagePrices = {
    "Per Day": rentalDays * basePricePerDay,
    "7 Days": basePricePerDay * 7 * 0.9, // 10% discount
    "15 Days": basePricePerDay * 15 * 0.85, // 15% discount
    "30 Days": basePricePerDay * 30 * 0.8, // 20% discount
  };

  const depositAmount = bike.deposit || 0;
  const deliveryCharge = pickupOption === "Delivery at Location" ? 250 : 0;

  // Calculate rent and total price
  const rentAmount = Math.round(packagePrices[selectedPackage]);
  const totalPrice = rentAmount + depositAmount + deliveryCharge;

  // Calculate discount percentage
  const discountAmount =
    rentalDays * basePricePerDay > rentAmount
      ? Math.round(rentalDays * basePricePerDay - rentAmount)
      : 0;

  // Handle rental days adjustment and package selection sync
  const handleIncreaseDays = () => {
    const newDays = rentalDays + 1;
    setRentalDays(newDays);

    if (newDays === 7) setSelectedPackage("7 Days");
    else if (newDays === 15) setSelectedPackage("15 Days");
    else if (newDays === 30) setSelectedPackage("30 Days");
    else setSelectedPackage("Per Day");
  };

  const handleDecreaseDays = () => {
    const newDays = Math.max(1, rentalDays - 1);
    setRentalDays(newDays);

    if (newDays === 7) setSelectedPackage("7 Days");
    else if (newDays === 15) setSelectedPackage("15 Days");
    else if (newDays === 30) setSelectedPackage("30 Days");
    else setSelectedPackage("Per Day");
  };

  const handlePackageSelection = (pkg) => {
    setSelectedPackage(pkg);

    const days = pkg === "7 Days" ? 7 : pkg === "15 Days" ? 15 : pkg === "30 Days" ? 30 : 1;
    setRentalDays(days);
  };

  const handleProceedToCheckout = () => {
    navigate("/checkout", {
      state: { bike, totalPrice, rentalDays, selectedPackage, deliveryLocation },
    });
  };

  return (
    <div className="container mx-auto py-16 px-4 lg:px-8 animate-fade-in">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Bike Image */}
        <div className="flex flex-col items-center">
          <img
            src={bike.img || "/placeholder-image.jpg"}
            alt={bike.name || "Bike Image"}
            className="w-full h-auto rounded-lg shadow-lg object-cover transform hover:scale-105 transition duration-300"
          />
          <p className="mt-4 text-gray-500 text-sm italic">
            *Images are for representation purposes only.
          </p>
        </div>

        {/* Right: Bike Details */}
        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          <h2 className="text-3xl font-semibold text-gray-800">{bike.name || "Bike Name"}</h2>

          {/* Rental Packages */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Rental Packages</h3>
            <div className="flex flex-wrap items-center gap-4">
              {Object.keys(packagePrices).map((pkg) => (
                <button
                  key={pkg}
                  onClick={() => handlePackageSelection(pkg)}
                  className={`py-3 px-6 rounded-none border-2 ${
                    selectedPackage === pkg
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-orange-500 border-orange-500"
                  } transition-all duration-300 w-full sm:w-auto`}
                >
                  {pkg} ({pkg === "Per Day" ? `₹${basePricePerDay}/day` : `₹${Math.round(packagePrices[pkg])}`})
                </button>
              ))}
            </div>
            {discountAmount > 0 && (
              <p className="mt-2 text-green-600 text-sm">
                You saved ₹{discountAmount} on this package!
              </p>
            )}
          </div>

          {/* Rental Duration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Rental Duration</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={handleDecreaseDays}
                className="px-4 py-3 bg-gray-200 text-gray-800 rounded-none w-full sm:w-auto"
              >
                -
              </button>
              <span className="text-2xl font-bold">{rentalDays} Days</span>
              <button
                onClick={handleIncreaseDays}
                className="px-4 py-3 bg-gray-200 text-gray-800 rounded-none w-full sm:w-auto"
              >
                +
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Rental for {rentalDays} days: ₹{rentAmount}
            </p>
          </div>

          {/* Pickup Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Pickup Option</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setPickupOption("Self Pickup")}
                className={`py-3 px-6 rounded-none border-2 ${
                  pickupOption === "Self Pickup"
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-orange-500 border-orange-500"
                } transition-all duration-300 w-full sm:w-auto`}
              >
                Self Pickup
              </button>
              <button
                onClick={() => setPickupOption("Delivery at Location")}
                className={`py-3 px-6 rounded-none border-2 ${
                  pickupOption === "Delivery at Location"
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-orange-500 border-orange-500"
                } transition-all duration-300 w-full sm:w-auto`}
              >
                Delivery at Location (+₹250)
              </button>
            </div>
            {pickupOption === "Delivery at Location" && (
              <input
                type="text"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className="w-full mt-4 p-3 border-2 rounded-none"
                placeholder="Enter delivery location"
              />
            )}
          </div>

          {/* Pricing Summary */}
          <div className="space-y-4">
            <p><strong>Rent Amount:</strong> ₹{rentAmount}</p>
            <p><strong>Deposit:</strong> ₹{depositAmount}</p>
            <p><strong>Delivery Charge:</strong> ₹{deliveryCharge}</p>
            <p className="text-lg font-bold">Total Price: ₹{totalPrice}</p>
          </div>

          {/* Buttons */}
          <button
            onClick={handleProceedToCheckout}
            className="w-full bg-orange-500 text-white py-3 rounded-none hover:bg-orange-600 transition duration-300"
          >
            Proceed to Payment
          </button>

          {/* Cancellation Policy */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Cancellation Policy</h3>
            <p className="text-sm text-gray-600">
              Cancellations made 24 hours before pickup are fully refundable. Within 24 hours, a cancellation fee may apply.
            </p>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Terms and Conditions</h3>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>A valid government-issued ID is required at pickup.</li>
              <li>Renter is responsible for fuel costs.</li>
              <li>Late returns will incur additional charges.</li>
              <li>Vehicles must be returned in the same condition as rented.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BikeDetailsPage;
