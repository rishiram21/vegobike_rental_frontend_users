import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";

// Cities list
const cities = [
  { name: "Agartala", image: "https://via.placeholder.com/100" },
  { name: "Agra", image: "https://via.placeholder.com/100" },
  { name: "Ahmedabad", image: "https://via.placeholder.com/100" },
  { name: "Amritsar", image: "https://via.placeholder.com/100" },
  { name: "Bangalore", image: "https://via.placeholder.com/100" },
  { name: "Bhopal", image: "https://via.placeholder.com/100" },
  { name: "Bhubaneswar", image: "https://via.placeholder.com/100" },
  { name: "Bir Billing", image: "https://via.placeholder.com/100" },
  { name: "Chandigarh", image: "https://via.placeholder.com/100" },
  { name: "Chennai", image: "https://via.placeholder.com/100" },
  { name: "Coimbatore", image: "https://via.placeholder.com/100" },
  { name: "Coorg", image: "https://via.placeholder.com/100" },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    location: "",
    startDate: "",
    endDate: "",
  });
  const [popupOpen, setPopupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Get current date and time, and set tomorrow's date
  const currentDate = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(currentDate.getDate() + 1);

  useEffect(() => {
    const currentDateTime = currentDate.toISOString().slice(0, 16); // format to 'yyyy-mm-ddThh:mm'
    const tomorrowDateTime = tomorrow.toISOString().slice(0, 16); // format to 'yyyy-mm-ddThh:mm'

    setFormData((prevData) => ({
      ...prevData,
      startDate: currentDateTime,
      endDate: tomorrowDateTime,
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearch = () => {
    if (formData.location && formData.startDate && formData.endDate) {
      navigate("/hero");
    } else {
      alert("Please fill in all fields.");
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
          backgroundImage: "url('/bikes/okbikesimg.jpg')",
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
              onClick={() => setPopupOpen(true)} // Open popup on click
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-orange-700 font-medium mb-2"
              htmlFor="startDate"
            >
              Start Date
            </label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-orange-700 font-medium mb-2"
              htmlFor="endDate"
            >
              End Date
            </label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-md font-medium hover:bg-orange-700 transition-all duration-300 ease-in-out"
          >
            Search
          </button>
        </div>
      </div>

      {/* Popup for City Selection */}
      {popupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-11/12 max-w-4xl p-6 rounded-lg relative">
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
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => {
                    setFormData({ ...formData, location: city.name });
                    setPopupOpen(false);
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
