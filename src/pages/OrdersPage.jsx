import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { FaMotorcycle } from "react-icons/fa";

// OrderCard Component
const OrderCard = ({ order }) => {
  if (!order) return null; // Guard clause to handle undefined order

  return (
    <div className="bg-white w-full max-w-sm rounded-lg shadow-lg overflow-hidden mb-6 border border-gray-300">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <FaMotorcycle className="text-orange-500 text-2xl mr-3" />
          <h3 className="text-xl font-semibold">Shine</h3>
        </div>
        <p className="text-gray-600 mb-2">Order ID: {order.id || order.bookingId || "N/A"}</p>
        <p className="text-gray-600 mb-2">Price: ₹{order.totalprice || order.totalAmount || "N/A"}</p>
        <p className="text-gray-600 mb-2">Rental Days: {order.rentalDays || "N/A"}</p>
        <p className="text-gray-600 mb-2">Order Date: {order.orderDate || order.createdAt || "N/A"}</p>
        <p className="text-gray-600 mb-2">Status: {order.status || "N/A"}</p>
        <a href={`/order/${order.id}`} className="text-blue-500 underline">
          View Order Details
        </a>
      </div>
    </div>
  );
};

// OrdersPage Component
const OrdersPage = () => {
  const location = useLocation();
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
      }
    };

    fetchOrderData();
  }, [location.state]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Loading Order Details...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">{fetchStatus}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Error Loading Order</h2>
        <p className="text-red-500 mb-4">{error}</p>
        <p className="mb-4">{fetchStatus}</p>
        <a href="/" className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600">
          Return to Home
        </a>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">No Order Details Found</h2>
        <p className="mb-4">We couldn't find any order information.</p>
        <p className="mb-4">{fetchStatus}</p>
        <a href="/" className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600">
          Return to Home
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Details</h2>
      <OrderCard order={orderDetails} />
    </div>
  );
};

export default OrdersPage;
