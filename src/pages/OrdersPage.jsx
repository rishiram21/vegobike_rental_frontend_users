import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaMotorcycle, FaCalendarAlt, FaMapMarkerAlt, FaRupeeSign } from "react-icons/fa";

const OrdersPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchStatus, setFetchStatus] = useState("Initializing...");

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        setFetchStatus("Starting fetch process...");

        if (location.state && location.state.order) {
          setFetchStatus("Order data found in navigation state");
          setOrderDetails(location.state.order);
          setLoading(false);
          return;
        }

        const orderId = location.state?.order?.id || sessionStorage.getItem('lastOrderId');

        if (orderId) {
          sessionStorage.setItem('lastOrderId', orderId);
          setFetchStatus(`Fetching order details for ID: ${orderId}`);
          const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/booking/${orderId}`);

          if (response.data) {
            setFetchStatus("Order details retrieved successfully");
            setOrderDetails(response.data);
          } else {
            setFetchStatus("API returned no data");
            setError("No order details returned from API");
          }
        } else {
          const userId = 2;
          setFetchStatus(`Fetching all orders for user ID: ${userId}`);
          const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/booking/user/${userId}`);

          if (response.data && response.data.length > 0) {
            setFetchStatus(`Found ${response.data.length} orders, using most recent`);
            setOrderDetails(response.data[0]);
          } else {
            setFetchStatus("No orders found for this user");
            setError("No orders found for this user");
          }
        }
      } catch (err) {
        setFetchStatus(`Error occurred: ${err.message}`);
        setError(err.message || "Failed to fetch order details");
      } finally {
        setLoading(false);
        window.scrollTo(0, 0); // Scroll to top
      }
    };

    fetchOrderData();
  }, [location.state, navigate]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-600">{fetchStatus}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 text-center">
        <h2 className="text-2xl font-bold mb-4">Error Loading Order</h2>
        <p className="text-red-500 mb-4">{error}</p>
        <p className="mb-4">{fetchStatus}</p>
        <Link to="/" className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600">
          Return to Home
        </Link>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 text-center">
        <h2 className="text-2xl font-bold mb-4">No Order Details Found</h2>
        <p className="mb-4">We couldn't find any order information.</p>
        <p className="mb-4">{fetchStatus}</p>
        <Link to="/" className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Order Details</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <FaMotorcycle className="text-orange-600 text-lg" />
                <h3 className="font-medium text-gray-800">{orderDetails.vehicleName || "N/A"}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${orderDetails.status === 'Completed' ? 'bg-green-100 text-green-800' :
                orderDetails.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                orderDetails.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'}`}>
                {orderDetails.status || "N/A"}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-start space-x-3">
              <FaCalendarAlt className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium">{formatDate(orderDetails.orderDate || orderDetails.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaMapMarkerAlt className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Rental Days</p>
                <p className="font-medium">{orderDetails.rentalDays || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FaRupeeSign className="text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-medium">₹{orderDetails.totalprice || orderDetails.totalAmount || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 flex justify-between">
            <p className="text-sm text-gray-500">Order ID: {orderDetails.id || orderDetails.bookingId || "N/A"}</p>
            <Link
              to={`/order/${orderDetails.id}`}
              className="text-sm font-medium text-orange-600 hover:text-orange-800"
            >
              View Order Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;


// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import axios from "axios";
// import { FaMotorcycle } from "react-icons/fa";

// // OrderCard Component
// const OrderCard = ({ order }) => {
//   if (!order) return null; // Guard clause to handle undefined order

//   return (
//     <div className="bg-white w-full max-w-sm rounded-lg shadow-lg overflow-hidden mb-6 border border-gray-300">
//       <div className="p-6">
//         <div className="flex items-center mb-4">
//           <FaMotorcycle className="text-orange-500 text-2xl mr-3" />
//           <h3 className="text-xl font-semibold">{order.vehicleName || "N/A"}</h3>
//         </div>
//         <p className="text-gray-600 mb-2">Order ID: {order.id || order.bookingId || "N/A"}</p>
//         <p className="text-gray-600 mb-2">Price: ₹{order.totalprice || order.totalAmount || "N/A"}</p>
//         <p className="text-gray-600 mb-2">Rental Days: {order.rentalDays || "N/A"}</p>
//         <p className="text-gray-600 mb-2">Order Date: {order.orderDate || order.createdAt || "N/A"}</p>
//         <p className="text-gray-600 mb-2">Status: {order.status || "N/A"}</p>
//         <a href={`/order/${order.id}`} className="text-blue-500 underline">
//           View Order Details
//         </a>
//       </div>
//     </div>
//   );
// };

// // OrdersPage Component
// const OrdersPage = () => {
//   const location = useLocation();
//   const [orderDetails, setOrderDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [fetchStatus, setFetchStatus] = useState("Initializing...");

//   useEffect(() => {
//     const fetchOrderData = async () => {
//       try {
//         setLoading(true);
//         setFetchStatus("Starting fetch process...");

//         if (location.state && location.state.order) {
//           setFetchStatus("Order data found in navigation state");
//           setOrderDetails(location.state.order);
//           setLoading(false);
//           return;
//         }

//         const orderId = location.state?.order?.id || sessionStorage.getItem('lastOrderId');

//         if (orderId) {
//           sessionStorage.setItem('lastOrderId', orderId);
//           setFetchStatus(`Fetching order details for ID: ${orderId}`);
//           const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/booking/${orderId}`);

//           if (response.data) {
//             setFetchStatus("Order details retrieved successfully");
//             setOrderDetails(response.data);
//           } else {
//             setFetchStatus("API returned no data");
//             setError("No order details returned from API");
//           }
//         } else {
//           const userId = 2;
//           setFetchStatus(`Fetching all orders for user ID: ${userId}`);
//           const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/booking/user/${userId}`);

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
//       }
//     };

//     fetchOrderData();
//   }, [location.state]);

//   if (loading) {
//     return (
//       <div className="container mx-auto py-8 px-4 text-center">
//         <h2 className="text-2xl font-bold mb-4">Loading Order Details...</h2>
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
//         <p className="mt-4 text-gray-600">{fetchStatus}</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto py-8 px-4 text-center">
//         <h2 className="text-2xl font-bold mb-4">Error Loading Order</h2>
//         <p className="text-red-500 mb-4">{error}</p>
//         <p className="mb-4">{fetchStatus}</p>
//         <a href="/" className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600">
//           Return to Home
//         </a>
//       </div>
//     );
//   }

//   if (!orderDetails) {
//     return (
//       <div className="container mx-auto py-8 px-4 text-center">
//         <h2 className="text-2xl font-bold mb-4">No Order Details Found</h2>
//         <p className="mb-4">We couldn't find any order information.</p>
//         <p className="mb-4">{fetchStatus}</p>
//         <a href="/" className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600">
//           Return to Home
//         </a>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto py-8 px-4">
//       <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Details</h2>
//       <OrderCard order={orderDetails} />
//     </div>
//   );
// };

// export default OrdersPage;



// import React, { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { FaMotorcycle, FaCalendarAlt, FaMapMarkerAlt, FaRupeeSign } from "react-icons/fa";

// const OrdersPage = () => {
//   const [bookings, setBookings] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Check if user is logged in
//     const token = localStorage.getItem("jwtToken");
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     // Fetch user bookings
//     // Replace with your actual API call:
//     // fetchUserBookings(token)
//     //   .then(data => {
//     //     setBookings(data);
//     //     setIsLoading(false);
//     //   })
//     //   .catch(error => {
//     //     console.error("Error fetching bookings:", error);
//     //     setIsLoading(false);
//     //   });
    
//     // For demo, using sample data
//     const sampleBookings = [
//       {
//         id: "OKBK123456",
//         bikeModel: "Honda Activa",
//         startDate: "2025-03-15T00:00:00.000Z",
//         endDate: "2025-03-18T00:00:00.000Z",
//         location: "Mumbai Central",
//         totalAmount: 1200,
//         status: "Completed"
//       },
//       {
//         id: "OKBK789012",
//         bikeModel: "Royal Enfield Classic 350",
//         startDate: "2025-03-25T00:00:00.000Z",
//         endDate: "2025-03-28T00:00:00.000Z",
//         location: "Pune Station",
//         totalAmount: 2400,
//         status: "Upcoming"
//       }
//     ];
    
//     // Simulate API call
//     setTimeout(() => {
//       setBookings(sampleBookings);
//       setIsLoading(false);
//     }, 500);
//   }, [navigate]);

//   // Format date for display
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen pt-20 px-4 flex justify-center items-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
//       <div className="container mx-auto max-w-3xl">
//         <h1 className="text-3xl font-bold text-gray-800 mb-6">My Bookings</h1>
        
//         {bookings.length > 0 ? (
//           <div className="space-y-4">
//             {bookings.map((booking) => (
//               <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
//                 <div className="p-4 border-b border-gray-100">
//                   <div className="flex justify-between items-center">
//                     <div className="flex items-center space-x-3">
//                       <FaMotorcycle className="text-orange-600 text-lg" />
//                       <h3 className="font-medium text-gray-800">{booking.bikeModel}</h3>
//                     </div>
//                     <span className={`px-3 py-1 rounded-full text-sm font-medium 
//                       ${booking.status === 'Completed' ? 'bg-green-100 text-green-800' : 
//                         booking.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' : 
//                         booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
//                         'bg-gray-100 text-gray-800'}`}>
//                       {booking.status}
//                     </span>
//                   </div>
//                 </div>
                
//                 <div className="p-4 space-y-3">
//                   <div className="flex items-start space-x-3">
//                     <FaCalendarAlt className="text-gray-400 mt-1" />
//                     <div>
//                       <p className="text-sm text-gray-500">Rental Period</p>
//                       <p className="font-medium">{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</p>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-start space-x-3">
//                     <FaMapMarkerAlt className="text-gray-400 mt-1" />
//                     <div>
//                       <p className="text-sm text-gray-500">Pickup Location</p>
//                       <p className="font-medium">{booking.location}</p>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-start space-x-3">
//                     <FaRupeeSign className="text-gray-400 mt-1" />
//                     <div>
//                       <p className="text-sm text-gray-500">Total Amount</p>
//                       <p className="font-medium">₹{booking.totalAmount.toLocaleString()}</p>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="px-4 py-3 bg-gray-50 flex justify-between">
//                   <p className="text-sm text-gray-500">Booking ID: {booking.id}</p>
//                   <Link 
//                     to={`/booking-details/${booking.id}`} 
//                     className="text-sm font-medium text-orange-600 hover:text-orange-800"
//                   >
//                     View Details
//                   </Link>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="bg-white rounded-lg shadow-md p-6 text-center">
//             <FaMotorcycle className="text-orange-600 text-3xl mx-auto mb-4" />
//             <h3 className="text-xl font-medium text-gray-800 mb-2">No Bookings Found</h3>
//             <p className="text-gray-600 mb-6">You haven't made any bike bookings yet.</p>
//             <Link 
//               to="/" 
//               className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md transition-colors"
//             >
//               Browse Bikes
//             </Link>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default OrdersPage;