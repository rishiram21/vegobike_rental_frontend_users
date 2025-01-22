import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaFilter,
  FaChevronUp,
  FaTimes,
  FaChevronDown,
  FaSpinner,
  FaGasPump,
  FaCogs,
  FaMapMarkerAlt,
} from "react-icons/fa";
import axios from "axios";

const BikeListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData } = location.state || {};

  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    fuelType: [],
    transmissionType: [],
    location: "",
  });
  const [sortOrder, setSortOrder] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true); // Loading state
  const bikesPerPage = 15;

  // Fetch all bikes from the backend
  useEffect(() => {
    if (formData) {
      fetchAvailableBikes();
    } else {
      console.error(
        "No form data found. Please return to the home page and make a selection."
      );
      // Optionally, navigate back to the home page
      navigate("/");
    }
  }, [formData]);

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
      const response = await axios.get("http://localhost:8081/vehicle/available", {
        params,
      });
      const bikesData = response.data?.content || [];
      setBikes(bikesData);
      setFilteredBikes(bikesData);
    } catch (error) {
      console.error("Error fetching bikes:", error);
      setBikes([]);
      setFilteredBikes([]);
    } finally {
      setLoading(false); // Stop loading
    }    
  };
  

  const applyFilters = (filters, order) => {
    let result = [...bikes];

    // Apply fuel type filter
    if (filters.fuelType.length > 0) {
      result = result.filter((bike) =>
        filters.fuelType.includes(bike.fuelType || "Petrol")
      );
    }

    // Apply transmission type filter
    if (filters.transmissionType.length > 0) {
      result = result.filter((bike) =>
        filters.transmissionType.includes(bike.transmissionType || "Gear")
      );
    }

    // Apply location filter
    if (filters.location) {
      result = result.filter((bike) => bike.storeName === filters.location);
    }

    // Apply sorting
    if (order === "asc")
      result.sort((a, b) => a.registrationYear - b.registrationYear);
    if (order === "desc")
      result.sort((a, b) => b.registrationYear - a.registrationYear);

    setFilteredBikes(result);
  };

  const toggleFilter = (filterArray, value) =>
    filterArray.includes(value)
      ? filterArray.filter((item) => item !== value)
      : [...filterArray, value];

  const updateFilters = (filterType, value) => {
    const newFilters = { ...selectedFilters };

    if (filterType === "fuelType") {
      newFilters.fuelType = toggleFilter(newFilters.fuelType, value);
    } else if (filterType === "transmissionType") {
      newFilters.transmissionType = toggleFilter(
        newFilters.transmissionType,
        value
      );
    } else if (filterType === "location") {
      newFilters.location = value;
    }

    setSelectedFilters(newFilters);
    applyFilters(newFilters, sortOrder);
  };

  const handleSort = (order) => {
    setSortOrder(order);
    applyFilters(selectedFilters, order);
  };

  // Get current bikes to render based on pagination
  const indexOfLastBike = currentPage * bikesPerPage;
  const indexOfFirstBike = indexOfLastBike - bikesPerPage;
  const currentBikes = filteredBikes.slice(indexOfFirstBike, indexOfLastBike);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="w-full min-h-screen bg-orange-50">
      <div className="container mx-auto py-6 flex flex-col lg:flex-row">
        {/* Filter Section */}
        <aside
          className={`w-full lg:w-1/4 bg-orange-50 p-4 border-2 border-stone-200 fixed ${
            isFilterOpen ? "block" : "hidden"
          } lg:block z-50 top-0 h-full lg:static lg:h-auto`}
        >
          <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center">
            Filters <FaFilter size={24} className="ml-2 text-orange-500" />
          </h3>
          {/* Fuel Type Filter */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2 text-sm text-gray-700">
              Fuel Type
            </h4>
            <label className="flex items-center mb-2 text-sm">
              <input
                type="checkbox"
                onChange={() => updateFilters("fuelType", "Petrol")}
                className="mr-2"
              />
              <FaGasPump className="mr-2 text-orange-500" /> Petrol
            </label>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                onChange={() => updateFilters("fuelType", "Electric")}
                className="mr-2"
              />
              <FaGasPump className="mr-2 text-green-500" /> Electric
            </label>
          </div>
 
          {/* Transmission Type Filter */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2 text-sm text-gray-700">Transmission Type</h4>
            <label className="flex items-center mb-2 text-sm">
              <input
                type="checkbox"
                onChange={() => updateFilters("transmissionType", "Gear")}
                className="mr-2"
              />
              <FaCogs className="mr-2 text-orange-500" /> Gear
            </label>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                onChange={() => updateFilters("transmissionType", "Gearless")}
                className="mr-2"
              />
              <FaCogs className="mr-2 text-green-500" /> Gearless
            </label>
          </div>

          {/* Location Filter */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2 text-sm text-gray-700">Location</h4>
            <select
              className="w-full p-3 border bg-white text-gray-700"
              onChange={(e) => updateFilters("location", e.target.value)}
            >
              <option value="">All</option>
              <option value="Hinjewadi">Hinjewadi</option>
              <option value="Kharadi Store">Kharadi Store</option>
              <option value="Koregaon Park">Koregaon Park</option>
            </select>
          </div>

          {/* Sort By Registration Year */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2 text-sm text-gray-700">Sort By</h4>
            <button
              className="block w-full mb-2 p-2 bg-orange-400 hover:bg-orange-500 text-white"
              onClick={() => handleSort("asc")}
            >
              Low to High
            </button>
            <button
              className="block w-full mb-2 p-2 bg-orange-400 hover:bg-orange-500 text-white"
              onClick={() => handleSort("desc")}
            >
              High to Low
            </button>
          </div>

          {/* Close Filter Button */}
          <button
            className="lg:hidden fixed bottom-5 right-5 w-16 h-16 bg-red-500 text-white shadow-lg flex items-center justify-center transition-transform transform hover:scale-110"
            onClick={() => setIsFilterOpen(false)}
          >
            <FaTimes size={24} />
          </button>
        </aside>

        {/* Small Screen Filter Button */}
        <button
          className="lg:hidden fixed bottom-5 left-5 w-16 h-16 bg-orange-500 text-white shadow-lg flex items-center justify-center transition-transform transform hover:scale-110 z-50"
          onClick={() => {
            setIsFilterOpen(!isFilterOpen);
            if (!isFilterOpen) window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          {isFilterOpen ? <FaChevronUp size={24} /> : <FaFilter size={24} />}
        </button>

        {/* Bike List Section */}
        <main className="w-full lg:w-3/4 pl-0 lg:pl-6">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <FaSpinner className="animate-spin text-orange-500 text-4xl" />
            </div>
          ) : currentBikes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentBikes.map((bike) => (
                <div
                  key={bike.id}
                  className="bg-white border border-gray-300 rounded overflow-hidden shadow-md transition-transform transform hover:scale-105"
                >
                  <div className="relative h-36 bg-gray-100 flex justify-center items-center">
                    <img
                      src={bike.image || "/default-image.jpg"}
                      alt={bike.model}
                      className="object-contain h-36 w-full"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-md font-bold text-gray-800 truncate">{bike.model}</h3>
                    <p className="text-xs text-gray-600">Brand: {bike.brand}</p>
                    <p className="text-xs text-gray-600">Year: {bike.registrationYear || "Unknown"}</p>
                    <p className="text-xs text-gray-600 flex items-center">
                      <FaMapMarkerAlt className="mr-1 text-red-500 animate-bounce" /> {bike.storeName}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      ₹{bike.brand === "Honda" ? 499 : 599}/day
                    </p>
                    <p className="text-sm font-semibold text-gray-700">Deposit: ₹2000</p>
                    <ul className="text-xs text-gray-600 mt-1 list-disc ml-4">
                      <li>Fuel Excluded</li>
                      <li>No Distance Limit</li>
                    </ul>
                    <button
                      className="mt-2 w-full bg-orange-500 text-white py-1 px-3 hover:bg-orange-600 transition-colors text-sm"
                      onClick={() =>
                        navigate(`/bike-details`, {
                          state: {
                            id: bike.id,
                            model:bike.model,
                            name: bike.name,
                            img: bike.image,
                            basePrice: bike.brand === "Honda" ? 499 : 599,
                            deposit: 2000,
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No bikes available</p>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center mt-6">
            {[...Array(Math.ceil(filteredBikes.length / bikesPerPage)).keys()].map((page) => (
              <button
                key={page + 1}
                onClick={() => paginate(page + 1)}
                className={`px-3 py-2 mx-1 border rounded-full ${
                  currentPage === page + 1
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-700"
                } hover:bg-orange-400 hover:text-white`}
              >
                {page + 1}
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
export default BikeListPage;