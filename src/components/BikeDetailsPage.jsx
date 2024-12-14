import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleMap, LoadScript, Marker, Autocomplete } from "@react-google-maps/api";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [autocomplete, setAutocomplete] = useState(null);

  // Package prices logic with discounts
  const basePricePerDay = bike.basePrice || 0;
  const packagePrices = {
    "Per Day(": rentalDays * basePricePerDay,
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

  const onLoadAutocomplete = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      setDeliveryLocation(place.formatted_address || "");
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 lg:px-6 animate-fade-in">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Bike Image */}
        <div className="flex flex-col shadow border items-center rounded-lg overflow-hidden">
          <img
            src={bike.img || "/placeholder-image.jpg"}
            alt={bike.name || "Bike Image"}
            className="w-full h-auto object-cover"
          />
          <p className="mt-3 text-gray-500 text-xs italic">
            *Images are for representation purposes only.
          </p>
        </div>

        {/* Right: Bike Details */}
        <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">{bike.name || "Bike Name"}</h2>

          {/* Rental Packages */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Rental Packages</h3>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`py-2 px-4 border w-full flex justify-between items-center rounded transition-all duration-300 ${
                  dropdownOpen ? "bg-orange-300 text-black border-orange-300" : "bg-white text-black border-orange-300"
                }`}
              >
                <span>{selectedPackage}</span>
                <span className="ml-2">⬇</span>
              </button>
              {dropdownOpen && (
                <div className="absolute z-10 mt-2 bg-white border border-gray-300 shadow-lg rounded w-full">
                  {Object.keys(packagePrices).map((pkg) => (
                    <button
                      key={pkg}
                      onClick={() => {
                        handlePackageSelection(pkg);
                        setDropdownOpen(false);
                      }}
                      className={`block w-full text-left py-2 px-4 hover:bg-orange-100 text-sm transition-all duration-300 ${
                        selectedPackage === pkg ? "bg-orange-300 text-black" : "text-gray-800"
                      }`}
                    >
                      {pkg} ({
                        pkg === "Per Day"
                          ? `₹${basePricePerDay}/day`
                          : `₹${Math.round(packagePrices[pkg])}`
                      })
                    </button>
                  ))}
                </div>
              )}
            </div>
            {discountAmount > 0 && (
              <p className="mt-1 text-green-600 text-sm">
                You saved ₹{discountAmount} on this package!
              </p>
            )}
          </div>

          {/* Rental Duration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Rental Duration</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecreaseDays}
                className="px-3 py-2 bg-gray-200 text-gray-800 rounded text-sm"
              >
                -
              </button>
              <span className="text-lg font-bold">{rentalDays} Days</span>
              <button
                onClick={handleIncreaseDays}
                className="px-3 py-2 bg-gray-200 text-gray-800 rounded text-sm"
              >
                +
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Rental for {rentalDays} days: ₹{rentAmount}
            </p>
          </div>

          {/* Pickup Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Pickup Option</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setPickupOption("Self Pickup")}
                className={`py-2 px-4 border-2 rounded text-sm transition-all duration-300 ${
                  pickupOption === "Self Pickup"
                    ? "bg-orange-300 text-black border-orange-300"
                    : "bg-white text-black border-orange-300"
                }`}
              >
                Self Pickup
              </button>
              <button
                onClick={() => setPickupOption("Delivery at Location")}
                className={`py-2 px-4 border-2 rounded text-sm transition-all duration-300 ${
                  pickupOption === "Delivery at Location"
                    ? "bg-orange-300 text-black border-orange-300"
                    : "bg-white text-black border-orange-300"
                }`}
              >
                Delivery at Location
              </button>
            </div>
          </div>

          {pickupOption === "Delivery at Location" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Delivery Location</h3>
              <LoadScript googleMapsApiKey="AIzaSyDLNzkSKuszYtoe2U84Uvp7J27Hehg1pd4" libraries={["places"]}>
                <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
                  <input
                    type="text"
                    placeholder="Enter delivery location"
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </Autocomplete>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={12}
                  onClick={handleMapClick}
                >
                  {selectedPosition && <Marker position={selectedPosition} />}
                </GoogleMap>
              </LoadScript>
              {deliveryLocation && (
                <p className="text-sm text-gray-600">Selected Location: {deliveryLocation}</p>
              )}
              <p className="text-sm text-gray-600">Delivery Charge: ₹{deliveryCharge}</p>
            </div>
          )}

          {/* Breakdown of Amounts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Amount Breakdown</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Rental Amount: ₹{rentAmount}</li>
              <li>Deposit: ₹{depositAmount}</li>
              {pickupOption === "Delivery at Location" && <li>Delivery Charge: ₹{deliveryCharge}</li>}
            </ul>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4">
            <button
              onClick={() => setShowPolicy(!showPolicy)}
              className="text-sm text-orange-500 underline flex items-center"
            >
              {showPolicy ? "Hide Terms and Conditions" : "Show Terms and Conditions"}
              <span className="ml-2">{showPolicy ? "▼" : "▶"}</span>
            </button>
            {showPolicy && (
              <div className="p-4 border rounded-md bg-gray-100 text-sm text-gray-700">
                <p>1. The bike must be returned in good condition.</p>
                <p>2. Late returns will incur additional charges.</p>
                <p>3. Please carry a valid ID proof while picking up the bike.</p>
              </div>
            )}
          </div>

          {/* Total Price */}
          <div className="mt-4">
            <h3 className="text-lg font-bold text-gray-800">Total Price: ₹{totalPrice}</h3>
          </div>

          {/* Proceed to Checkout Button */}
          <button
            onClick={handleProceedToCheckout}
            className="w-full py-3 bg-orange-400 text-white font-semibold rounded hover:bg-orange-500 transition-all duration-300"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default BikeDetailsPage;
