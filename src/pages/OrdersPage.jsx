import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaMotorcycle, FaCalendarAlt, FaMapMarkerAlt, FaRupeeSign, FaUser, FaPhone } from "react-icons/fa";
import { useGlobalState } from "../context/GlobalStateContext";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { addOrder, user } = useGlobalState();
  const [mostRecentOrder, setMostRecentOrder] = useState(null);
  const [otherOrders, setOtherOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        // Retrieve JWT token from localStorage or sessionStorage
        const token = localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");

        if (!token) {
          setError("User not authenticated. Please log in.");
          setLoading(false);
          return;
        }

        // Fetch order history
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/booking/user/bookings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.length > 0) {
          // Sort orders by bookingId (most recent first)
          const sortedOrders = response.data.sort((a, b) => b.bookingId - a.bookingId);

          // Separate the most recent order from the rest
          const [recentOrder, ...remainingOrders] = sortedOrders;

          setMostRecentOrder(recentOrder);
          setOtherOrders(remainingOrders);
        } else {
          setError("No orders found for this user.");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch order history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };

  // User Profile Card Component
  const UserProfileCard = () => (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-orange-50">
        <h2 className="text-xl font-semibold text-gray-800">User Details</h2>
      </div>

      <div className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <div className="bg-orange-100 rounded-full p-4 mb-4 md:mb-0 md:mr-6">
            <FaUser className="text-orange-600 text-2xl" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium text-gray-800">{user?.name || "N/A"}</p>
            </div>

            <div className="flex flex-col md:flex-row md:space-x-6">
              <div className="flex items-start space-x-3">
                <FaPhone className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user?.phoneNumber || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Order card component to avoid duplication
  const OrderCard = ({ order }) => (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FaMotorcycle className="text-orange-600 text-lg" />
            <h3 className="font-medium text-gray-800">{order.vehicleName || "N/A"}</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium
            ${order.status === "Completed" ? "bg-green-100 text-green-800" :
            order.status === "Upcoming" ? "bg-blue-100 text-blue-800" :
            order.status === "Active" ? "bg-yellow-100 text-yellow-800" :
            order.status === "Cancelled" ? "bg-red-100 text-red-800" :
            "bg-gray-100 text-gray-800"}`}>
            {order.status || "N/A"}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start space-x-3">
          <FaCalendarAlt className="text-gray-400 mt-1" />
          <div>
            <p className="text-sm text-gray-500">Order Date</p>
            <p className="font-medium">{formatDate(order.orderDate || order.createdAt)}</p>
          </div>
        </div>

        {/* Add Start Date (Pickup Date) */}
        <div className="flex items-start space-x-3">
          <FaCalendarAlt className="text-gray-400 mt-1" />
          <div>
            <p className="text-sm text-gray-500">Start Date</p>
            <p className="font-medium">{formatDate(order.pickupDate || order.startTime)}</p>
          </div>
        </div>

        {/* Add End Date (Drop Date) */}
        <div className="flex items-start space-x-3">
          <FaCalendarAlt className="text-gray-400 mt-1" />
          <div>
            <p className="text-sm text-gray-500">End Date</p>
            <p className="font-medium">{formatDate(order.dropDate || order.endTime)}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <FaMapMarkerAlt className="text-gray-400 mt-1" />
          <div>
            <p className="text-sm text-gray-500">Rental Days</p>
            <p className="font-medium">{order.rentalDays || "N/A"}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <FaRupeeSign className="text-gray-400 mt-1" />
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="font-medium">₹{order.totalprice || order.totalAmount || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 flex justify-between">
        <p className="text-sm text-gray-500">Order ID: {order.id || order.bookingId || "N/A"}</p>
        <Link to={`/order/${order.id}`} className="text-sm font-medium text-orange-600 hover:text-orange-800">
          View Order Details
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen text-center pt-24">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/" className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>

        {/* User Profile Card */}
        {user && <UserProfileCard />}

        {mostRecentOrder === null && otherOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No Orders Found</h2>
            <p className="text-gray-600 mb-6">You have not placed any orders yet.</p>
            <Link to="/" className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600">
              Book Now
            </Link>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Other Orders Column */}
            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-500">
                All Other Orders
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                  {otherOrders.length}
                </span>
              </h2>

              {otherOrders.length > 0 ? (
                otherOrders.map((order) => <OrderCard key={order.id || order._id} order={order} />)
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-500">No other orders</p>
                </div>
              )}
            </div>

            {/* Most Recent Order Column */}
            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-yellow-500">
                Most Recent Order
              </h2>

              {mostRecentOrder ? (
                <OrderCard order={mostRecentOrder} />
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-500">No recent orders</p>
                  <Link to="/" className="inline-block mt-4 text-orange-600 hover:text-orange-800 font-medium">
                    Book a vehicle now
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;




// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate, Link } from "react-router-dom";
// import axios from "axios";
// import { FaMotorcycle, FaCalendarAlt, FaMapMarkerAlt, FaRupeeSign } from "react-icons/fa";

// const OrdersPage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [orderDetails, setOrderDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [fetchStatus, setFetchStatus] = useState("Initializing...");
//   const [checkoutData, setCheckoutData] = useState(null);

//   useEffect(() => {
//     const fetchOrderData = async () => {
//       try {
//         setLoading(true);
//         setFetchStatus("Starting fetch process...");

//         // Check if user is logged in
//         const token = localStorage.getItem("jwtToken");
//         if (!token) {
//           navigate("/login");
//           return;
//         }

//         if (location.state && location.state.order) {
//           setFetchStatus("Order data found in navigation state");
//           setOrderDetails(location.state.order);
//           setCheckoutData(location.state.checkoutData);
//           setLoading(false);
//           return;
//         }

//         const orderId = location.state?.order?.id || sessionStorage.getItem('lastOrderId');

//         if (orderId) {
//           sessionStorage.setItem('lastOrderId', orderId);
//           setFetchStatus(`Fetching order details for ID: ${orderId}`);
//           const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/booking/${orderId}`, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           });

//           if (response.data) {
//             setFetchStatus("Order details retrieved successfully");
//             setOrderDetails(response.data);
//           } else {
//             setFetchStatus("API returned no data");
//             setError("No order details returned from API");
//           }
//         } else {
//           const userId = 2; // Replace with actual user ID logic if needed
//           setFetchStatus(`Fetching all orders for user ID: ${userId}`);
//           const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/booking/user/${userId}`, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           });

//           if (response.data && response.data.length > 0) {
//             setFetchStatus(`Found ${response.data.length} orders, using most recent`);
//             setOrderDetails(response.data[0]);
//           } else {
//             setFetchStatus("No orders found for this user");
//             setError("No orders found for this user");
//           }
//         }
//       } catch (err) {
//         setFetchStatus(`Error occurred: ${err.message}`);
//         setError(err.message || "Failed to fetch order details");
//       } finally {
//         setLoading(false);
//         window.scrollTo(0, 0); // Scroll to top
//       }
//     };

//     fetchOrderData();
//   }, [location.state, navigate]);

//   // Format date for display
//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     if (isNaN(date)) return "Invalid Date";
//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen pt-20 px-4 flex justify-center items-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
//         <p className="mt-4 text-gray-600">{fetchStatus}</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 text-center">
//         <h2 className="text-2xl font-bold mb-4">Error Loading Order</h2>
//         <p className="text-red-500 mb-4">{error}</p>
//         <p className="mb-4">{fetchStatus}</p>
//         <Link to="/" className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600">
//           Return to Home
//         </Link>
//       </div>
//     );
//   }

//   if (!orderDetails) {
//     return (
//       <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 text-center">
//         <h2 className="text-2xl font-bold mb-4">No Order Details Found</h2>
//         <p className="mb-4">We couldn't find any order information.</p>
//         <p className="mb-4">{fetchStatus}</p>
//         <Link to="/" className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600">
//           Return to Home
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
//       <div className="container mx-auto max-w-3xl">
//         <h1 className="text-3xl font-bold text-gray-800 mb-6">Order Details</h1>
//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           <div className="p-4 border-b border-gray-100">
//             <div className="flex justify-between items-center">
//               <div className="flex items-center space-x-3">
//                 <FaMotorcycle className="text-orange-600 text-lg" />
//                 <h3 className="font-medium text-gray-800">{orderDetails.bikeDetails?.model || "N/A"}</h3>
//               </div>
//               <span className={`px-3 py-1 rounded-full text-sm font-medium
//                 ${orderDetails.status === 'Completed' ? 'bg-green-100 text-green-800' :
//                 orderDetails.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
//                 orderDetails.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
//                 'bg-gray-100 text-gray-800'}`}>
//                 {orderDetails.status || "N/A"}
//               </span>
//             </div>
//           </div>

//           <div className="p-4 space-y-3">
//             <div className="flex items-start space-x-3">
//               <FaCalendarAlt className="text-gray-400 mt-1" />
//               <div>
//                 <p className="text-sm text-gray-500">Order Date</p>
//                 <p className="font-medium">{formatDate(orderDetails.orderDate || orderDetails.createdAt)}</p>
//               </div>
//             </div>

//             <div className="flex items-start space-x-3">
//               <FaMapMarkerAlt className="text-gray-400 mt-1" />
//               <div>
//                 <p className="text-sm text-gray-500">Rental Days</p>
//                 <p className="font-medium">{orderDetails.rentalDays || "N/A"}</p>
//               </div>
//             </div>

//             <div className="flex items-start space-x-3">
//               <FaRupeeSign className="text-gray-400 mt-1" />
//               <div>
//                 <p className="text-sm text-gray-500">Total Amount</p>
//                 <p className="font-medium">₹{orderDetails.totalPrice || orderDetails.totalAmount || "N/A"}</p>
//               </div>
//             </div>
//           </div>

//           <div className="px-4 py-3 bg-gray-50 flex justify-between">
//             <p className="text-sm text-gray-500">Order ID: {orderDetails.id || orderDetails.bookingId || "N/A"}</p>
//             <Link
//               to={`/order/${orderDetails.id}`}
//               className="text-sm font-medium text-orange-600 hover:text-orange-800"
//             >
//               View Order Details
//             </Link>
//           </div>
//         </div>

//         {checkoutData && (
//           <div className="mt-6 bg-white rounded-lg shadow-md p-6">
//             <h2 className="text-2xl font-semibold text-gray-800 mb-4">Checkout Details</h2>
//             <div className="space-y-4">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-700">Bike Details</h3>
//                 <p className="text-sm text-gray-600">Model: {checkoutData.bike?.model}</p>
//                 <p className="text-sm text-gray-600">Package: {checkoutData.selectedPackage?.days} Days (₹{checkoutData.selectedPackage?.price}/day)</p>
//                 <p className="text-sm text-gray-600">Duration: {checkoutData.rentalDays} Days</p>
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-700">Pickup/Drop Dates</h3>
//                 <p className="text-sm text-gray-600">Pickup: {formatDate(checkoutData.pickupDate)}</p>
//                 <p className="text-sm text-gray-600">Drop: {formatDate(checkoutData.dropDate)}</p>
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-700">Pickup Option</h3>
//                 <p className="text-sm text-gray-600">{checkoutData.pickupOption}</p>
//                 <p className="text-sm text-gray-600">{checkoutData.pickupOption === "Self Pickup" ? checkoutData.storeName : checkoutData.addressDetails?.fullAddress || "Our Store Location: Rental Street"}</p>
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-700">Price Details</h3>
//                 <p className="text-sm text-gray-600">Base Price: ₹{checkoutData.basePrice}</p>
//                 <p className="text-sm text-gray-600">Delivery Charge: ₹{checkoutData.deliveryCharge}</p>
//                 <p className="text-sm text-gray-600">Convenience Fee: ₹{checkoutData.serviceCharge}</p>
//                 <p className="text-sm text-gray-600">Security Deposit: ₹{checkoutData.depositAmount}</p>
//                 <p className="text-sm text-gray-600">GST (18%): ₹{checkoutData.gstAmount?.toFixed(2) || "N/A"}</p>
//                 {checkoutData.discount > 0 && (
//                   <p className="text-sm text-gray-600">Discount: -₹{checkoutData.discount}</p>
//                 )}
//                 <p className="text-sm font-semibold text-gray-600">Total Payable: ₹{checkoutData.payableAmount?.toFixed(2) || "N/A"}</p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default OrdersPage;
