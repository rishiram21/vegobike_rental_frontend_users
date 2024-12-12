import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { useGlobalState } from "../context/GlobalStateContext";

// Cities list
const cities = [
  { name: "Pune", image: "/city/pune.jpg" },
  { name: "Mumbai", image: "/city/mumbai.jpg" },
  { name: "Nagpur", image: "/city/nagpur.jpg" },
  { name: "Rajastan", image: "/city/rajastan.jpg" },
  { name: "Delhi", image: "/city/delhi.jpg" },
  { name: "Agra", image: "/city/agra.jpg" },
  { name: "Banglore", image: "/city/banglore.jpg" },
  { name: "Indore", image: "/city/indore.jpg" },
  { name: "Kolhapur", image: "/city/kolhapur.jpg" },
  { name: "Satara", image: "/city/satara.jpg" },
  { name: "Gujrat", image: "/city/gujrat.png" },
  { name: "Nashik", image: "/city/nashik.jpg" },
];

const HomePage = () => {
  const navigate = useNavigate();

  // Use global state
  const { formData, setFormData } = useGlobalState();

  const [popupOpen, setPopupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});
  const [selectedCityImage, setSelectedCityImage] = useState("/bikes/okbikesimg.jpg"); // Default image

  // Function to format date to "yyyy-MM-ddTHH:mm"
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
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(currentDate.getDate() + 1);

    setFormData((prevData) => ({
      ...prevData,
      startDate: formatDateForInput(currentDate),
      endDate: formatDateForInput(tomorrow),
    }));
  }, [setFormData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      if (name === "startDate") {
        const startDate = new Date(value);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1); // Set end date to 1 day after start date
        return {
          ...prevData,
          startDate: value,
          endDate: formatDateForInput(endDate),
        };
      }
      return { ...prevData, [name]: value };
    });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleSearch = () => {
    const newErrors = {};
    if (!formData.location) newErrors.location = "Location is required.";
    if (!formData.startDate) newErrors.startDate = "Start Date is required.";
    if (!formData.endDate) newErrors.endDate = "End Date is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      navigate("/hero");
    }
  };

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
        <h1 className="text-4xl font-bold text-white mb-6 animate-fade-in-down">
          Welcome to Ok Bikes
        </h1>

        {/* Form */}
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md animate-fade-in-up">
          <div className="mb-4">
            <label
              className="block text-orange-700 font-medium mb-2"
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
              onChange={handleInputChange}
              onClick={() => setPopupOpen(true)}
              className={`w-full px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.location ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              className="block text-orange-700 font-medium mb-2"
              htmlFor="startDate"
            >
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.startDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
            )}
          </div>
          <div className="mb-6">
            <label
              className="block text-orange-700 font-medium mb-2"
              htmlFor="endDate"
            >
              End Date & Time
            </label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.endDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-md font-medium hover:bg-orange-700 transition-all duration-300 ease-in-out"
          >
            Done
          </button>
        </div>
      </div>

      {/* Popup for City Selection */}
      {popupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white w-11/12 max-w-4xl p-6 rounded-lg relative animate-slide-down">
            <button
              onClick={() => setPopupOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              <FaTimes className="text-xl" />
            </button>
            <h2 className="text-lg font-semibold mb-4">Select a City</h2>
            <input
              type="text"
              placeholder="Search or type city to select"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredCities.map((city, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center cursor-pointer transition-transform transform hover:scale-105"
                  onClick={() => {
                    setFormData({ ...formData, location: city.name });
                    setSelectedCityImage(city.image); // Update image based on city selection
                    setPopupOpen(false); // Close the city popup after selection
                  }}
                >
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-20 h-20 rounded-md object-cover mb-2"
                  />
                  <span className="text-sm font-medium">{city.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
