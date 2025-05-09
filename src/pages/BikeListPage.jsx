import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaFilter,
  FaTimes,
  FaSpinner,
  FaMapMarkerAlt,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // Import useAuth for token management

const BikeListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth(); // Use the token from AuthContext

  // Define static locations as strings
  const staticLocation1 = "OK Bikes Mangalwar Peth";
  const staticLocation2 = "Ok Bikes Bavdhan";
  const staticLocation3 = "OK Bikes Wakad";

  const { formData } = location.state || {};

  // Static bike details
  const staticBikeDetails = {
    id: 1,
    model: "Ola Electric",
    image: "/ola.jpg",
    perDayRent: 399,
    deposit: 0, // Assuming no deposit mentioned
    registrationYear: 2023,
    storeName: staticLocation3,
    categoryName: "Scooter",
    categoryId: 1,
    fuelType: "ELECTRIC",
    brand: "Ola",
    vehicleType: "Scooter", // Ensure vehicleType is set
  };

  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    vehicleType: [],
    brands: [],
    fuelType: [],
    location: "",
  });
  const [sortOrder, setSortOrder] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const filterRef = useRef(null);
  const bikesPerPage = 8;

  useEffect(() => {
    // Function to execute the reload
    const performReload = () => {
      // First, try the simplest approach - adding a timestamp to force a clean reload
      const timestamp = new Date().getTime();
      const refreshedUrl = window.location.pathname + 
                          (window.location.search ? 
                            window.location.search + '&_=' + timestamp : 
                            '?_=' + timestamp);
      
      // Use replace instead of assign to avoid adding to browser history
      window.location.replace(refreshedUrl);
    };

    // Check if reload has been performed using a flag in sessionStorage
    const reloadFlag = window.sessionStorage.getItem('pageHasReloaded');
    
    if (!reloadFlag) {
      // Set the flag immediately
      window.sessionStorage.setItem('pageHasReloaded', 'true');
      
      // Use a small timeout to ensure the flag is set before reloading
      setTimeout(performReload, 50);
    }
  }, []);

  // Log the token when the component mounts
  useEffect(() => {
    console.log("Token from AuthContext:", token);
  }, [token]);

  useEffect(() => {
    if (formData) {
      fetchAvailableBikes();
    } else {
      console.error(
        "No form data found. Please return to the home page and make a selection."
      );
      navigate("/");
    }
  }, [formData]);

  // Scroll to top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchAvailableBikes = async () => {
    setLoading(true);

    const startTime = new Date(formData.startDate)
      .toISOString()
      .replace("T", " ")
      .split(".")[0];
    const endTime = new Date(formData.endDate)
      .toISOString()
      .replace("T", " ")
      .split(".")[0];

    const params = {
      cityId: formData.cityId,
      startTime,
      endTime,
    };

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/vehicle/available`,
        {
          params,
        }
      );
      const bikesData = response.data?.content || [];
      // Ensure each bike has a categoryName
      const combinedBikes = bikesData.map(bike => ({
        ...bike,
        categoryName: bike.categoryName || "Unknown", // Default to "Unknown" if not set
      }));

      combinedBikes.push(staticBikeDetails);
      console.log("Fetched Bikes:", combinedBikes); // Log fetched bikes
      setBikes(combinedBikes);
      setFilteredBikes(combinedBikes);
    } catch (error) {
      console.error("Error fetching bikes:", error);
      setBikes([staticBikeDetails]); // Fallback to static bike if fetch fails
      setFilteredBikes([staticBikeDetails]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (filters, order) => {
    let result = [...bikes];

    console.log("Applying filters:", filters); // Log the filters being applied

    if (filters.vehicleType.length > 0) {
      result = result.filter((bike) =>
        filters.vehicleType.includes(bike.categoryName)
      );
    }

    if (filters.brands.length > 0) {
      result = result.filter((bike) =>
        filters.brands.includes(bike.brand)
      );
    }

    if (filters.fuelType.length > 0) {
      result = result.filter((bike) =>
        filters.fuelType.includes(bike.fuelType)
      );
    }

    if (filters.location) {
      result = result.filter((bike) => bike.storeName === filters.location);
    }

    if (order === "asc")
      result.sort((a, b) => a.perDayRent - b.perDayRent);
    if (order === "desc")
      result.sort((a, b) => b.perDayRent - a.perDayRent);

    console.log("Filtered bikes:", result); // Log the filtered bikes

    setFilteredBikes(result);
  };

  const toggleFilter = (filterArray, value) =>
    filterArray.includes(value)
      ? filterArray.filter((item) => item !== value)
      : [...filterArray, value];

  const updateFilters = (filterType, value) => {
    const newFilters = { ...selectedFilters };

    if (filterType === "vehicleType") {
      newFilters.vehicleType = toggleFilter(newFilters.vehicleType, value);
    } else if (filterType === "brands") {
      newFilters.brands = toggleFilter(newFilters.brands, value);
    } else if (filterType === "fuelType") {
      newFilters.fuelType = toggleFilter(newFilters.fuelType, value);
    } else if (filterType === "location") {
      newFilters.location = value;
    }

    console.log("Updated filters:", newFilters); // Log the updated filters

    setSelectedFilters(newFilters);
    applyFilters(newFilters, sortOrder);
  };

  const handleSort = (order) => {
    setSortOrder(order);
    applyFilters(selectedFilters, order);
  };

  const resetFilters = () => {
    setSelectedFilters({
      vehicleType: [],
      brands: [],
      fuelType: [],
      location: "",
    });
    setSortOrder("");
    applyFilters({
      vehicleType: [],
      brands: [],
      fuelType: [],
      location: "",
    }, "");

    // Reload the page
    window.location.reload();
  };

  const indexOfLastBike = currentPage * bikesPerPage;
  const indexOfFirstBike = indexOfLastBike - bikesPerPage;
  const currentBikes = filteredBikes.slice(indexOfFirstBike, indexOfLastBike);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Scroll to top when changing pages
  };

  useEffect(() => {
    if (showFilters && filterRef.current) {
      filterRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showFilters]);

  return (
    <div className="container mx-auto py-6 flex flex-col lg:flex-row relative min-h-screen mt-14">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="lg:hidden fixed bottom-4 left-4 bg-indigo-500 text-white p-3 square shadow-lg z-50 flex items-center gap-2"
      >
        <FaFilter size={24} />
      </button>

      <aside
        ref={filterRef}
        className={`w-full lg:w-1/4 bg-gray-100 p-4 mb-6 lg:mb-0 transition-transform duration-300 ease-in-out ${
          showFilters ? "block" : "hidden lg:block"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
          <button
            onClick={() => setShowFilters(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        <div className="mb-6">
          <h4 className="font-semibold mb-2 text-sm text-gray-700">
            Vehicle Type
          </h4>
          <label className="flex items-center mb-2 text-sm">
            <input
              type="checkbox"
              className="mr-2"
              onChange={() => updateFilters("vehicleType", "Scooter")}
            />
            Scooter
          </label>
          <label className="flex items-center mb-2 text-sm">
            <input
              type="checkbox"
              className="mr-2"
              onChange={() => updateFilters("vehicleType", "Bike")}
            />
            Bike
          </label>
        </div>
        <div className="mb-6">
          <h4 className="font-semibold mb-2 text-sm text-gray-700">Brands</h4>
          <label className="flex items-center mb-2 text-sm">
            <input
              type="checkbox"
              className="mr-2"
              onChange={() => updateFilters("brands", "Bajaj")}
            />
            Bajaj
          </label>
          <label className="flex items-center mb-2 text-sm">
            <input
              type="checkbox"
              className="mr-2"
              onChange={() => updateFilters("brands", "Honda")}
            />
            Honda
          </label>
          <label className="flex items-center mb-2 text-sm">
            <input
              type="checkbox"
              className="mr-2"
              onChange={() => updateFilters("brands", "Ola")}
            />
            Ola
          </label>
        </div>
        <div className="mb-6">
          <h4 className="font-semibold mb-2 text-sm text-gray-700">Fuel Type</h4>
          <label className="flex items-center mb-2 text-sm">
            <input
              type="checkbox"
              className="mr-2"
              onChange={() => updateFilters("fuelType", "CNG")}
            />
            CNG
          </label>
          <label className="flex items-center mb-2 text-sm">
            <input
              type="checkbox"
              className="mr-2"
              onChange={() => updateFilters("fuelType", "ELECTRIC")}
            />
            ELECTRIC
          </label>
          <label className="flex items-center mb-2 text-sm">
            <input
              type="checkbox"
              className="mr-2"
              onChange={() => updateFilters("fuelType", "PETROL")}
            />
            PETROL
          </label>
        </div>
        <div className="mb-6">
          <h4 className="font-semibold mb-2 text-sm text-gray-700">Location</h4>
          <select
            className="w-full p-3 border-2 border-gray-300 bg-white text-gray-700 text-sm transition-all duration-300 ease-in-out transform hover:scale-105 focus:ring-2 focus:outline-none"
            onChange={(e) => updateFilters("location", e.target.value)}
          >
            <option value="">All</option>
            <option value={staticLocation1}>{staticLocation1}</option>
            <option value={staticLocation2}>{staticLocation2}</option>
            <option value={staticLocation3}>{staticLocation3}</option>
          </select>
        </div>
        <h4 className="font-semibold mb-2 text-sm text-gray-700">Sort By</h4>
        <div className="mb-6 flex flex-row gap-2">
          <button
            className="block w-full bg-indigo-300 text-white py-2 px-4 rounded hover:bg-indigo-400"
            onClick={() => handleSort("asc")}
          >
            Price: Low to High
          </button>
          <button
            className="block w-full bg-indigo-300 text-white py-2 px-4 rounded hover:bg-indigo-400"
            onClick={() => handleSort("desc")}
          >
            Price: High to Low
          </button>
        </div>
        <button
          className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={resetFilters}
        >
          Reset Filters
        </button>
      </aside>

      <main className="w-full lg:w-3/4 pl-0 lg:pl-6 flex flex-col min-h-screen">
        {/* Main content area */}
        <div className="flex-grow">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <FaSpinner className="animate-spin text-indigo-500 text-4xl" />
            </div>
          ) : currentBikes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentBikes.map((bike) => (
                <div
                  key={bike.id}
                  className="bg-white border p-4 shadow-md hover:shadow-xl transition-shadow rounded-lg flex flex-col h-full"
                >
                  {/* Fixed height container for image */}
                  <div className="h-48 mb-3 flex items-center justify-center overflow-hidden bg-white-50 rounded-t-lg">
                    <img
                      src={bike.image || "/default-image.jpg"}
                      alt={bike.model}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mt-2">
                      <h3 className="text-base font-medium truncate">
                        {bike.model}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 mb-3">
                      Year: {bike.registrationYear || "Unknown"}
                    </p>

                    <h2 className="text-sm font-medium">Available at</h2>
                    <div className="flex items-center">
                      <span className="text-indigo-500 mr-1">
                        <FaMapMarkerAlt />
                      </span>
                      <p className="text-sm text-gray-600">{bike.storeName}</p>
                    </div>

                    <div className="flex items-center mt-3">
                      <span className="text-sm font-semibold text-gray-700">
                        Price:
                      </span>
                      <span className="text-lg font-bold ml-2">
                        ₹{bike.perDayRent}/day
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Fuel excluded, No distance limit
                    </p>
                  </div>
                  {bike.id === staticBikeDetails.id ? (
                    <button
                      className="mt-3 w-full bg-gray-300 text-gray-700 py-2 px-2 rounded-lg"
                      disabled
                    >
                      Coming Soon
                    </button>
                  ) : (
                    <button
                      className="mt-3 w-full bg-indigo-500 text-white py-2 px-2 hover:bg-indigo-600 transition-colors rounded-lg"
                      onClick={() =>
                        navigate(`/bike-details`, {
                          state: {
                            id: bike.id,
                            model: bike.model,
                            name: bike.name,
                            img: bike.image,
                            basePrice: bike.perDayRent,
                            deposit: bike.deposit,
                            registrationYear: bike.registrationYear,
                            storeName: bike.storeName,
                            categoryName: bike.categoryName,
                            categoryId: bike.categoryId,
                          },
                        })
                      }
                    >
                      Rent Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-center text-gray-500">No bikes available</p>
            </div>
          )}
        </div>

        {/* Pagination area - fixed at the bottom */}
        {filteredBikes.length > 0 && (
          <div className="mt-8 mb-4 py-4 border-t border-gray-200">
            <div className="flex justify-center items-center">
              {[
                ...Array(Math.ceil(filteredBikes.length / bikesPerPage)).keys(),
              ].map((page) => (
                <button
                  key={page + 1}
                  onClick={() => paginate(page + 1)}
                  className={`px-3 py-2 mx-1 border rounded-full ${
                    currentPage === page + 1
                      ? "bg-indigo-500 text-white"
                      : "bg-white text-gray-700"
                  } hover:bg-indigo-400 hover:text-white transition-colors`}
                >
                  {page + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BikeListPage;

