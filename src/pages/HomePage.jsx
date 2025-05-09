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
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { formData, setFormData } = useGlobalState();
  const [popupOpen, setPopupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});
  const [selectedCityImage, setSelectedCityImage] = useState(
    "/banner-freedom.jpg"
  );
  const [cities, setCities] = useState([]);
  const [availableBikes, setAvailableBikes] = useState([]);
  const [lastFetchError, setLastFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [animationState, setAnimationState] = useState({
    searchBtn: false,
    citySelection: false
  });

  // Improved time handling function
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

  useEffect(() => {
    // Check if the URL already has our reload parameter
    const urlParams = new URLSearchParams(window.location.search);
    const hasReloaded = urlParams.get('reloaded');
    
    if (!hasReloaded) {
      // Add the parameter and reload
      const newUrl = window.location.pathname + '?reloaded=true' + 
                     (window.location.hash || '');
      window.location.href = newUrl;
    }
  }, []);

  // Prefetch data to improve responsiveness
  useEffect(() => {
    // Scroll to the top of the page when the component mounts
    window.scrollTo(0, 0);

    // Start loading animation
    const loadSequence = () => {
      setTimeout(() => {
        document.querySelector('.main-banner').classList.add('active');
        
        setTimeout(() => {
          document.querySelector('.booking-form').classList.add('active');
          
          setTimeout(() => {
            document.querySelectorAll('.feature-item').forEach((item, index) => {
              setTimeout(() => {
                item.classList.add('active');
              }, index * 100);
            });
          }, 300);
        }, 200);
      }, 100);
    };

    loadSequence();

    const fetchCities = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/city/all`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        const citiesData = response.data?.content || [];
        setCities(citiesData);
        
        // Prefetch bike availability for popular locations
        if (citiesData.length > 0) {
          setFormData(prevData => ({
            ...prevData,
            cityId: citiesData[0].id,
            location: citiesData[0].name
          }));
          setSelectedCityImage(`data:image/jpeg;base64,${citiesData[0].image}`);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]);
      }
    };

    fetchCities();
  }, []);

  // Optimize bike fetching with debounce and caching
  const fetchAvailableBikes = async (immediate = false) => {
    if (!formData.location || !formData.startDate || !formData.endDate) {
      setErrors({ location: "Please select a location and dates." });
      return;
    }

    if (!immediate) {
      setIsLoading(true);
    }
    setLastFetchError(null);

    // Create a cache key for this specific request
    const cacheKey = `bikes_${formData.cityId}_${formData.startDate}_${formData.endDate}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData && !immediate) {
      const parsedData = JSON.parse(cachedData);
      setAvailableBikes(parsedData);
      setIsLoading(false);
      return parsedData;
    }

    // Ensure full timestamp is sent to backend
    const startTime = new Date(formData.startDate).toISOString()
      .replace('T', ' ')
      .split('.')[0];
    const endTime = new Date(formData.endDate).toISOString()
      .replace('T', ' ')
      .split('.')[0];

    const params = {
      cityId: formData.cityId,
      startTime,
      endTime,
    };

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/vehicle/available`,
        { params }
      );
      const bikesData = response.data?.content || [];

      // Cache the result
      sessionStorage.setItem(cacheKey, JSON.stringify(bikesData));

      if (bikesData.length === 0) {
        setErrors({
          location: "No bikes available for the selected location and time.",
        });
        setAvailableBikes([]);
      } else {
        setAvailableBikes(bikesData);
      }
      
      setIsLoading(false);
      return bikesData;
    } catch (error) {
      console.error("Error fetching available bikes:", error);
      setLastFetchError("Failed to fetch available bikes. Please try again.");
      setErrors({
        location: "Failed to fetch available bikes. Please try again.",
      });
      setIsLoading(false);
      return [];
    }
  };

  useEffect(() => {
    const currentDate = new Date();
    const roundedStartDate = roundToNextHour(currentDate);
    const roundedEndDate = new Date(roundedStartDate);
    roundedEndDate.setDate(roundedStartDate.getDate() + 1);

    setFormData((prevData) => ({
      ...prevData,
      startDate: formatDateForInput(roundedStartDate),
      endDate: formatDateForInput(roundedEndDate),
    }));
  }, [setFormData]);

  // Background prefetching of bike data
  useEffect(() => {
    let timeoutId;
    if (formData.location && formData.startDate && formData.endDate) {
      // Debounce to prevent too many requests
      timeoutId = setTimeout(() => {
        fetchAvailableBikes(true); // true means it's a background fetch
      }, 300);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [formData.location, formData.startDate, formData.endDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Time validation for start date
    if (name === 'startDate') {
      const selectedDate = new Date(value);
      const currentDate = new Date();

      if (selectedDate < currentDate) {
        // If selected date is in the past, set to current date and time
        setFormData((prevData) => ({
          ...prevData,
          [name]: formatDateForInput(roundToNextHour(currentDate))
        }));
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: "Past dates and times cannot be selected. Date and time have been reset to current time."
        }));
        return;
      }

      // If endDate is before the new startDate, update endDate
      if (formData.endDate && new Date(formData.endDate) < new Date(value)) {
        const newEndDate = new Date(value);
        newEndDate.setDate(newEndDate.getDate() + 1);
        // Preserve the time of the new start date
        newEndDate.setHours(new Date(value).getHours(),
                             new Date(value).getMinutes());

        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
          endDate: formatDateForInput(newEndDate)
        }));
        return;
      }
    }

    // Time validation for end date
    if (name === 'endDate') {
      const startDate = new Date(formData.startDate);
      const selectedEndDate = new Date(value);

      if (selectedEndDate <= startDate) {
        const newEndDate = new Date(startDate);
        newEndDate.setDate(startDate.getDate() + 1);
        // Preserve the time of the start date
        newEndDate.setHours(startDate.getHours(), startDate.getMinutes());

        setFormData((prevData) => ({
          ...prevData,
          [name]: formatDateForInput(newEndDate)
        }));
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: "End date and time must be after start date and time. Date and time have been adjusted."
        }));
        return;
      }
    }

    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleCitySelection = (city) => {
    // Add animation for selection
    setAnimationState(prev => ({...prev, citySelection: true}));
    
    setFormData((prevData) => ({
      ...prevData,
      location: city.name,
      cityId: city.id,
    }));
    
    // Smooth image transition
    const fadeOut = document.querySelector('.city-image-container');
    fadeOut.classList.add('fade-out');
    
    setTimeout(() => {
      setSelectedCityImage(`data:image/jpeg;base64,${city.image}`);
      fadeOut.classList.remove('fade-out');
      fadeOut.classList.add('fade-in');
      
      setTimeout(() => {
        fadeOut.classList.remove('fade-in');
        setPopupOpen(false);
        setAnimationState(prev => ({...prev, citySelection: false}));
      }, 300);
    }, 300);
  };

  const handleSearch = async () => {
    // Add button animation
    setAnimationState(prev => ({...prev, searchBtn: true}));
    
    // Navigate immediately if bikes are already loaded
    if (availableBikes.length > 0) {
      navigate("/bike-list", { state: { formData } });
      return;
    }
    
    // If not loaded, fetch bikes with fast response
    const bikes = await fetchAvailableBikes();
    
    if (bikes.length > 0) {
      navigate("/bike-list", { state: { formData } });
    } else if (lastFetchError) {
      setErrors({ location: lastFetchError });
      setAnimationState(prev => ({...prev, searchBtn: false}));
    }
  };

  const filteredCities = Array.isArray(cities)
    ? cities.filter((city) =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="flex flex-col">
      <div className="flex flex-col md:flex-row h-screen">
        {/* Left Half (Image Section) */}
        <div
          className="w-full md:w-1/2 h-full bg-cover bg-center main-banner city-image-container"
          style={{
            backgroundImage: `url('${selectedCityImage}')`,
            transition: 'opacity 0.3s ease-in-out',
          }}
        ></div>

        {/* Right Half (Form Section) */}
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-center p-8 bg-gradient-to-r from-indigo-900 to-indigo-600 slide-in-right">
          <h1 className="text-4xl font-bold text-white mb-6 animate-pulse-once">
            Welcome to VegoBike
          </h1>
          <div className="bg-white p-8 shadow-lg w-full max-w-md booking-form">
            <div className="mb-4">
              <label
                className="block text-indigo-800 font-medium mb-2"
                htmlFor="location"
              >
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
                className={`w-full px-4 py-2 border outline-none focus:ring-2 focus:ring-indigo-900 hover:shadow-md transition-all duration-300 ${
                  errors.location ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>
            <div className="mb-4">
              <label
                className="block text-indigo-800 font-medium mb-2"
                htmlFor="startDate"
              >
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                min={formatDateForInput(new Date())}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border outline-none focus:ring-2 focus:ring-indigo-500 hover:shadow-md transition-all duration-300 ${
                  errors.startDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>
            <div className="mb-6">
              <label
                className="block text-indigo-800 font-medium mb-2"
                htmlFor="endDate"
              >
                End Date & Time
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                min={formData.startDate}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border outline-none focus:ring-2 focus:ring-indigo-500 hover:shadow-md transition-all duration-300 ${
                  errors.endDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading || animationState.searchBtn}
              className={`w-full bg-indigo-800 text-white rounded-full py-2 px-4 hover:bg-indigo-600 transition-all duration-300 transform hover:scale-103 active:scale-95 ${
                animationState.searchBtn ? 'animate-pulse' : ''
              }`}
            >
              {isLoading ? 'Loading...' : 'Book Now'}
            </button>
          </div>
        </div>
      </div>

      {/* City Selection Popup */}
      {popupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white w-11/12 max-w-4xl p-6 relative animate-scale-up">
            <button
              onClick={() => setPopupOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <FaTimes className="text-xl transform hover:rotate-90 transition-transform duration-300" />
            </button>
            <h2 className="text-lg font-semibold mb-4">Select a City</h2>
            <input
              type="text"
              placeholder="Search or type city to select"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 mb-4 border focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-300"
              autoFocus
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {filteredCities.map((city, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center cursor-pointer hover:bg-indigo-50 p-3 rounded-lg transition-all duration-300 transform hover:scale-105 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleCitySelection(city)}
                >
                  <div className="w-20 h-20 overflow-hidden rounded-full border-2 border-indigo-300 transition-transform duration-300 hover:border-indigo-500">
                    <img
                      src={`data:image/jpeg;base64,${city.image}`}
                      alt={city.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  <span className="text-sm font-medium mt-2">{city.name}</span>
                  <span className="text-xs text-gray-500">{city.state}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Additional Sections */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-400 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 animate-bounce-once">
            Why Choose VegoBike
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FaBicycle className="text-indigo-600 text-4xl mb-4" />,
                text: "Wide range of bikes.",
              },
              {
                icon: <FaHandshake className="text-indigo-500 text-4xl mb-4" />,
                text: "Affordable pricing.",
              },
              {
                icon: <FaPhone className="text-indigo-500 text-4xl mb-4" />,
                text: "24/7 customer support.",
              },
              {
                icon: <FaCheck className="text-indigo-500 text-4xl mb-4" />,
                text: "Easy booking process.",
              },
              {
                icon: (
                  <FaMapMarkerAlt className="text-indigo-500 text-4xl mb-4" />
                ),
                text: "Multiple locations.",
              },
              {
                icon: (
                  <FaCreditCard className="text-indigo-500 text-4xl mb-4" />
                ),
                text: "Secure payment.",
              },
            ].map((reason, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 feature-item"
              >
                <div className="transform transition-transform duration-500 hover:rotate-12 hover:scale-110">
                  {reason.icon}
                </div>
                <p className="text-gray-800 font-medium">{reason.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 to-indigo-400 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 animate-pulse-once">
            How to Book a Bike
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                step: "Step 1",
                title: "Select Your Location",
                description:
                  "Choose a city or location where you want to rent a bike.",
              },
              {
                step: "Step 2",
                title: "Pick a Date & Time",
                description:
                  "Set your rental duration by selecting the start and end dates.",
              },
              {
                step: "Step 3",
                title: "Choose a Bike",
                description:
                  "Browse through our collection and pick a bike that suits your needs.",
              },
              {
                step: "Step 4",
                title: "Confirm Your Booking",
                description:
                  "Fill in your details, review the booking summary, and confirm your reservation.",
              },
              {
                step: "Step 5",
                title: "Make Payment",
                description:
                  "Use our secure payment options to complete the booking.",
              },
              {
                step: "Step 6",
                title: "Pick Up or Get Delivery",
                description:
                  "Pick up the bike from our location or get it delivered to your doorstep.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center bg-gray-50 p-6 shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-105 animate-slide-in-from-bottom"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-indigo-500 text-2xl font-semibold mb-2">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 bg-gradient-to-r from-indigo-500 to-indigo-400 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-black mb-8 animate-float">
            Our Presence
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {cities.map((city, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center hover:bg-white hover:bg-opacity-20 p-3 rounded-lg transition-all duration-300 transform hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-20 h-20 overflow-hidden rounded-full mb-4 border-2 border-white transition-all duration-300 hover:border-indigo-300">
                  <img
                    src={`data:image/jpeg;base64,${city.image}`}
                    alt={city.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
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