import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for order details, loading, and error handling
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Order ID from the successful payment (you can pass it from the payment page or generate it automatically)
  const orderId = location.state?.orderId;  // Assuming the order ID is passed when navigating here

  // If orderId is not passed, display an error or redirect the user
  if (!orderId) {
    return <div>No Order ID provided, unable to fetch order details.</div>;
  }

  // Fetch order details based on the order ID
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        // Example API endpoint to fetch order details using the order ID
        const response = await fetch(`https://example.com/api/orders/${orderId}`);
        const data = await response.json();
        if (response.ok) {
          setOrderDetails(data);
        } else {
          throw new Error("Failed to fetch order details.");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!orderDetails) {
    return <div>No order details available.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-semibold text-center mb-6">Order Confirmation</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold">Order Details</h2>
        <p className="mt-2"><strong>Order ID:</strong> {orderDetails.orderId}</p>
        <p className="mt-2"><strong>Bike:</strong> {orderDetails.bike}</p>
        <p className="mt-2"><strong>Total Price:</strong> ₹{orderDetails.totalPrice}</p>
        <p className="mt-2"><strong>Rental Days:</strong> {orderDetails.rentalDays}</p>
        <p className="mt-2"><strong>Order Date:</strong> {new Date(orderDetails.orderDate).toLocaleDateString()}</p>
        <p className="mt-2"><strong>Status:</strong> {orderDetails.status}</p>

        <div className="mt-4">
          <h3 className="text-xl font-semibold">Delivery Details</h3>
          <p><strong>Pickup Location:</strong> {orderDetails.pickupLocation}</p>
          <p><strong>Delivery Location:</strong> {orderDetails.deliveryLocation}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
