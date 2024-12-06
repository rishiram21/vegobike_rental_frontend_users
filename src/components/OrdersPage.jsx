import React from "react";

const OrdersPage = () => {
  return (
    <div className="container mx-auto py-16">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <p>No orders found. Start booking now!</p>
      </div>
    </div>
  );
};

export default OrdersPage;
