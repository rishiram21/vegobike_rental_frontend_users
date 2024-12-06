import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const BikeDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bike = location.state || {};

  const [selectedPackage, setSelectedPackage] = useState("Per Day");
  const [rentalDays, setRentalDays] = useState(1);
  const [pickupOption, setPickupOption] = useState("Self Pickup");
  const [showPolicy, setShowPolicy] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [selectedPosition, setSelectedPosition] = useState(null);

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

  // Map configuration
  const mapContainerStyle = {
    width: "100%",
    height: "300px",
  };
  const center = { lat: 28.6139, lng: 77.209 }; // Default to New Delhi

  const handleMapClick = (event) => {
    const { latLng } = event;
    const lat = latLng.lat();
    const lng = latLng.lng();
    setSelectedPosition({ lat, lng });
    setDeliveryLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  };

  return (
    <div className="container mx-auto py-12 px-4 lg:px-6 animate-fade-in">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Bike Image */}
        <div className="flex flex-col items-center">
          <img
            src={bike.img || "/placeholder-image.jpg"}
            alt={bike.name || "Bike Image"}
            className="w-full h-auto shadow-lg object-cover transform hover:scale-105 transition duration-300"
          />
          <p className="mt-3 text-gray-500 text-xs italic">
            *Images are for representation purposes only.
          </p>
        </div>

        {/* Right: Bike Details */}
        <div className="bg-white shadow-lg p-4 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">{bike.name || "Bike Name"}</h2>

          {/* Rental Packages */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-700">Rental Packages</h3>
            <div className="flex flex-wrap items-center gap-3">
              {Object.keys(packagePrices).map((pkg) => (
                <button
                  key={pkg}
                  onClick={() => handlePackageSelection(pkg)}
                  className={`py-2 px-4 border text-xs sm:text-sm transition-all duration-300 w-full sm:w-auto ${
                    selectedPackage === pkg
                      ? "bg-orange-300 text-black border-orange-300"
                      : "bg-white text-black border-orange-300"
                  }`}
                >
                  {pkg} ({pkg === "Per Day" ? `₹${basePricePerDay}/day` : `₹${Math.round(packagePrices[pkg])}`})
                </button>
              ))}
            </div>
            {discountAmount > 0 && (
              <p className="mt-1 text-green-600 text-xs">
                You saved ₹{discountAmount} on this package!
              </p>
            )}
          </div>

          {/* Rental Duration */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-700">Rental Duration</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecreaseDays}
                className="px-3 py-2 bg-gray-200 text-gray-800 text-xs sm:text-sm"
              >
                -
              </button>
              <span className="text-lg font-bold">{rentalDays} Days</span>
              <button
                onClick={handleIncreaseDays}
                className="px-3 py-2 bg-gray-200 text-gray-800 text-xs sm:text-sm"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Rental for {rentalDays} days: ₹{rentAmount}
            </p>
          </div>

          {/* Pickup Options */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-700">Pickup Option</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setPickupOption("Self Pickup")}
                className={`py-2 px-4 border-2 text-xs sm:text-sm ${
                  pickupOption === "Self Pickup"
                    ? "bg-orange-300 text-black border-orange-300"
                    : "bg-white text-black border-orange-300"
                } transition-all duration-300 w-full sm:w-auto`}
              >
                Self Pickup
              </button>
              <button
                onClick={() => setPickupOption("Delivery at Location")}
                className={`py-2 px-4 border-2 text-xs sm:text-sm ${
                  pickupOption === "Delivery at Location"
                    ? "bg-orange-300 text-black border-orange-300"
                    : "bg-white text-black border-orange-300"
                } transition-all duration-300 w-full sm:w-auto`}
              >
                Delivery at Location (+₹250)
              </button>
            </div>
            {pickupOption === "Delivery at Location" && (
              <>
                <p className="mt-2 text-xs text-gray-600">Click on the map to select a delivery location:</p>
                <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                  <GoogleMap mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={12}
                    onClick={handleMapClick}
                  >
                    {selectedPosition && <Marker position={selectedPosition} />}
                  </GoogleMap>
                </LoadScript>
                <p className="mt-1 text-xs text-gray-600">
                  Selected Location: {deliveryLocation || "None"}
                </p>
              </>
            )}
          </div>

          {/* Total Price and Checkout */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-700">Price Breakdown</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Rent: ₹{rentAmount}</li>
              <li>Deposit: ₹{depositAmount}</li>
              {deliveryCharge > 0 && <li>Delivery Charge: ₹{deliveryCharge}</li>}
              <li className="font-semibold">Total: ₹{totalPrice}</li>
            </ul>
            <button
              onClick={handleProceedToCheckout}
              className="py-3 px-6 bg-orange-400 text-white text-sm w-full font-semibold rounded shadow hover:bg-orange-500 transition-all duration-300"
            >
              Proceed to Checkout
            </button>


          </div>

          

          {/* Policy Toggle */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-700">Rental Policy</h3>
            <button
              onClick={() => setShowPolicy(!showPolicy)}
              className="py-2 px-4 border-2 text-sm w-full text-orange-300 border-orange-300 bg-white transition-all duration-300"
            >
              {showPolicy ? "Hide Policy" : "View Policy"}
            </button>
            {showPolicy && (
              <div className="text-sm text-gray-600 border border-gray-200 rounded p-3 mt-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Valid ID proof is required for booking.</li>
                  <li>Security deposit is refundable upon return.</li>
                  <li>Fuel charges are not included in the rental price.</li>
                  <li>Additional late return charges may apply.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikeDetailsPage;
