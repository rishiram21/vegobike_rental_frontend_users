import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaBicycle,
  FaHandshake,
  FaPhone,
  FaCheck,
  FaMapMarkerAlt,
  FaCreditCard,
} from "react-icons/fa";
import { useGlobalState } from "../context/GlobalStateContext";
import axios from "axios";

const HomePage = () => {
  const navigate = useNavigate();
  const { formData, setFormData } = useGlobalState();
  const [popupOpen, setPopupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});
  const [selectedCityImage, setSelectedCityImage] = useState("/bikes/okbikesimg.jpg");
  const [cities, setCities] = useState([]);
  const [availableBikes, setAvailableBikes] = useState([]);

  // Fetch cities from the backend API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get("http://localhost:8081/city/all", {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        const citiesData = response.data?.content || [];
        console.log("Fetched cities:", citiesData);
        setCities(citiesData);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]);
      }
    };

    fetchCities();
  }, []);

  // Fetch available bikes from the backend API
  const fetchAvailableBikes = async () => {
    if (!formData.location || !formData.startDate || !formData.endDate) {
      setErrors({ location: "Please select a location and dates." });
      return;
    }

    const startTime = new Date(formData.startDate).toISOString().replace("T", " ").split(".")[0];
    const endTime = new Date(formData.endDate).toISOString().replace("T", " ").split(".")[0];

    const params = {
      cityId: formData.cityId,
      startTime,
      endTime,
    };

    try {
      const response = await axios.get("http://localhost:8081/vehicle/available", { params });
      const bikesData = response.data?.content || [];

      if (bikesData.length === 0) {
        setErrors({ location: "No bikes available for the selected location and time." });
        return;
      }

      navigate("/bike-list", { state: { formData } });
    } catch (error) {
      console.error("Error fetching available bikes:", error);
      setErrors({ location: "Failed to fetch available bikes. Please try again." });
    }
  };

  // Format date for input fields
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getTime() + 30 * 60 * 1000);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    setFormData((prevData) => ({
      ...prevData,
      startDate: formatDateForInput(startDate),
      endDate: formatDateForInput(endDate),
    }));
  }, [setFormData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleCitySelection = (city) => {
    setFormData((prevData) => ({
      ...prevData,
      location: city.name,
      cityId: city.id,
    }));
    setSelectedCityImage(`data:image/jpeg;base64,${city.image}`);
    setPopupOpen(false);
  };

  const handleSearch = () => {
    fetchAvailableBikes();
  };

  // Filter cities based on the search term
  const filteredCities = Array.isArray(cities)
    ? cities.filter((city) =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const currentDateTime = formatDateForInput(new Date());

  return (
    <div className="flex flex-col">
      <div className="flex flex-col md:flex-row h-screen">
        {/* Left Half (Image Section) */}
        <div
          className="w-full md:w-1/2 h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('${selectedCityImage}')`,
          }}
        ></div>

        {/* Right Half (Form Section) */}
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-center p-8 bg-gradient-to-r from-orange-500 to-orange-400">
          <h1 className="text-4xl font-bold text-white mb-6">Welcome to OK Bikes</h1>
          <div className="bg-white p-8 shadow-lg w-full max-w-md">
            <div className="mb-4">
              <label className="block text-orange-700 font-medium mb-2" htmlFor="location">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="Enter Location"
                value={formData.location}
                readOnly
                onClick={() => setPopupOpen(true)}
                className={`w-full px-4 py-2 border outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.location ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-orange-700 font-medium mb-2" htmlFor="startDate">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                min={currentDateTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-orange-700 font-medium mb-2" htmlFor="endDate">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                min={currentDateTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              onClick={fetchAvailableBikes}
              className="w-full bg-orange-700 text-white rounded-full py-2 px-4"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* City Selection Popup */}
      {popupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-11/12 max-w-4xl p-6 relative">
            <button
              onClick={() => setPopupOpen(false)}
              className="absolute top-4 right-4 text-gray-600"
            >
              <FaTimes className="text-xl" />
            </button>
            <h2 className="text-lg font-semibold mb-4">Select a City</h2>
            <input
              type="text"
              placeholder="Search or type city to select"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 mb-4 border"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredCities.map((city, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleCitySelection(city)}
                >
                  <img
                    src={`data:image/jpeg;base64,${city.image}`}
                    alt={city.name}
                    className="w-20 h-20 object-cover mb-2"
                  />
                  <span className="text-sm font-medium">{city.name}</span>
                  <span className="text-xs text-gray-500">{city.state}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Additional Sections */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Why Choose OK Bikes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <FaBicycle className="text-orange-600 text-4xl mb-4" />, text: "Wide range of bikes." },
              { icon: <FaHandshake className="text-orange-500 text-4xl mb-4" />, text: "Affordable pricing." },
              { icon: <FaPhone className="text-orange-500 text-4xl mb-4" />, text: "24/7 customer support." },
              { icon: <FaCheck className="text-orange-500 text-4xl mb-4" />, text: "Easy booking process." },
              { icon: <FaMapMarkerAlt className="text-orange-500 text-4xl mb-4" />, text: "Multiple locations." },
              { icon: <FaCreditCard className="text-orange-500 text-4xl mb-4" />, text: "Secure payment." },
            ].map((reason, index) => (
              <div key={index} className="flex flex-col items-center text-center bg-white p-6 shadow-md">
                {reason.icon}
                <p className="text-gray-700 font-medium">{reason.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-500 to-orange-400 py-16">
        <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">How to Book a Bike</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                step: "Step 1",
                title: "Select Your Location",
                description: "Choose a city or location where you want to rent a bike.",
              },
              {
                step: "Step 2",
                title: "Pick a Date & Time",
                description: "Set your rental duration by selecting the start and end dates.",
              },
              {
                step: "Step 3",
                title: "Choose a Bike",
                description: "Browse through our collection and pick a bike that suits your needs.",
              },
              {
                step: "Step 4",
                title: "Confirm Your Booking",
                description: "Fill in your details, review the booking summary, and confirm your reservation.",
              },
              {
                step: "Step 5",
                title: "Make Payment",
                description: "Use our secure payment options to complete the booking.",
              },
              {
                step: "Step 6",
                title: "Pick Up or Get Delivery",
                description: "Pick up the bike from our location or get it delivered to your doorstep.",
              },
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center bg-gray-50 p-6 shadow-lg">
                <div className="text-orange-500 text-2xl font-semibold mb-2">{step.step}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 bg-gradient-to-r from-orange-500 to-orange-400 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-black mb-8">Our Presence</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {cities.map((city, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <img
                  src={`data:image/jpeg;base64,${city.image}`}
                  alt={city.name}
                  className="w-20 h-20 mb-4 object-cover"
                />
                <p className="text-black font-medium">{city.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
