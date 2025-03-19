import React, { useState, useEffect, useRef } from "react";
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
  const [stores, setStores] = useState([]);

  const { formData } = location.state || {};

  // Static bike details
  const staticBikeDetails = {
    id: 1,
    model: "Ola Electric",
    image: "/ola.jpg",
    perDayRent: 399,
    deposit: 0, // Assuming no deposit mentioned
    registrationYear: 2017,
    storeName: "Ok Bikes Wakad",
    categoryName: "Scooter",
    categoryId: 1,
    fuelType: "Electric",
    brand: "Ola",
    vehicleType: "Scooter",
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

  // Static filters
  const filters = {
    vehicleTypes: ["Scooter", "Bike"],
    brands: ["Bajaj", "Honda", "Ola","Yamaha"],
    fuelTypes: ["CNG", "Electric", "PETROL"],
    locations: ["OK Bikes Mangalvar Peth", "Ok Bikes Bavdhan", "Ok Bikes Wakad"],
  };

  useEffect(() => {
    if (formData) {
      fetchStoreLocations();
      fetchAvailableBikes();
    } else {
      console.error(
        "No form data found. Please return to the home page and make a selection."
      );
      navigate("/");
    }
  }, [formData]);

  const handleStoreChange = (bikeId, newStore) => {
    console.log(`Bike ID: ${bikeId}, New Store: ${newStore}`);
    // Update the store for the bike if needed
  };

  const fetchStoreLocations = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/store/all`, {
        params: {
          page: 0,
          size: 100, // Adjust the size as needed to fetch all stores
          sortBy: "storeName",
          sortDirection: "asc",
        },
      });

      console.log("Backend response:", response.data); // Log the response

      const storeLocations = response.data.content.map((store) => store.storeName);
      console.log("Store locations:", storeLocations); // Log the store locations

      setFilters((prevFilters) => ({
        ...prevFilters,
        locations: storeLocations,
      }));
    } catch (error) {
      console.error("Error fetching store locations:", error);
    }
  };

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
      // Combine fetched bikes with the static bike
      const combinedBikes = [...bikesData, staticBikeDetails];
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
        filters.vehicleType.includes(bike.vehicleType)
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

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (showFilters && filterRef.current) {
      filterRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showFilters]);

  return (
    <div className="container mx-auto py-6 flex flex-col lg:flex-row relative min-h-screen mt-14">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="lg:hidden fixed bottom-4 left-4 bg-orange-500 text-white p-3 square shadow-lg z-50 flex items-center gap-2"
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
          {filters.vehicleTypes.map((type) => (
            <label key={type} className="flex items-center mb-2 text-sm">
              <input
                type="checkbox"
                className="mr-2"
                onChange={() => updateFilters("vehicleType", type)}
              />
              {type}
            </label>
          ))}
        </div>
        <div className="mb-6">
          <h4 className="font-semibold mb-2 text-sm text-gray-700">Brands</h4>
          {filters.brands.map((brand) => (
            <label key={brand} className="flex items-center mb-2 text-sm">
              <input
                type="checkbox"
                className="mr-2"
                onChange={() => updateFilters("brands", brand)}
              />
              {brand}
            </label>
          ))}
        </div>
        <div className="mb-6">
          <h4 className="font-semibold mb-2 text-sm text-gray-700">Fuel Type</h4>
          {filters.fuelTypes.map((fuelType) => (
            <label key={fuelType} className="flex items-center mb-2 text-sm">
              <input
                type="checkbox"
                className="mr-2"
                onChange={() => updateFilters("fuelType", fuelType)}
              />
              {fuelType}
            </label>
          ))}
        </div>
        <div className="mb-6">
          <h4 className="font-semibold mb-2 text-sm text-gray-700">Location</h4>
          <select
            className="w-full p-3 border-2 border-gray-300 bg-white text-gray-700 text-sm transition-all duration-300 ease-in-out transform hover:scale-105 focus:ring-2 focus:outline-none"
            onChange={(e) => updateFilters("location", e.target.value)}
          >
            <option value="">All</option>
            {filters.locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
        <h4 className="font-semibold mb-2 text-sm text-gray-700">Sort By</h4>
        <div className="mb-6 flex flex-row gap-2">
          <button
            className="block w-full bg-orange-300 text-white"
            onClick={() => handleSort("asc")}
          >
            Price: Low to High
          </button>
          <button
            className="block w-full bg-orange-300 text-white"
            onClick={() => handleSort("desc")}
          >
            Price: High to Low
          </button>
        </div>
        <button
          className="w-full p-2 bg-red-500 text-white"
          onClick={resetFilters}
        >
          Reset Filters
        </button>
      </aside>

      <main className="w-full lg:w-3/4 pl-0 lg:pl-6">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <FaSpinner className="animate-spin text-orange-500 text-4xl" />
          </div>
        ) : currentBikes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentBikes.map((bike) => (
              <div
                key={bike.id}
                className="bg-white border p-4 shadow-md hover:shadow-xl transition-shadow rounded-lg"
              >
                <img
                  src={bike.image || "/default-image.jpg"}
                  alt={bike.model}
                  className="w-full h-40 object-contain rounded-t-lg"
                />
                <div className="flex justify-between items-center mt-2">
                  <h3 className="text-base font-medium truncate">
                    {bike.model}
                  </h3>
                </div>
                <p className="text-xs text-gray-600 mt-1 mb-3">
                  Year: {bike.registrationYear || "Unknown"}
                </p>

                <h2>Available at</h2>
                <div className="flex items-center">
                  <span className="text-green-500 mr-1">
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
                {bike.id === staticBikeDetails.id ? (
                  <button
                    className="mt-3 w-full bg-gray-300 text-gray-700 py-2 px-2 rounded-lg"
                    disabled
                  >
                    Coming Soon
                  </button>
                ) : (
                  <button
                    className="mt-3 w-full bg-orange-500 text-white py-2 px-2 hover:bg-orange-600 transition-colors rounded-lg"
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
          <p className="text-center text-gray-500">No bikes available</p>
        )}

        <div className="flex justify-center items-center mt-6">
          {[
            ...Array(Math.ceil(filteredBikes.length / bikesPerPage)).keys(),
          ].map((page) => (
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
  );
};

export default BikeListPage;
