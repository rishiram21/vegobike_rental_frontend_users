import React, { useState, useEffect } from "react";
import axios from "axios";
import RazorpayButton from "./RazorpayButton";

const AsyncRazorpayButton = ({ 
  bikeModel, 
  customer, 
  createBooking, 
  onSuccess, 
  onError 
}) => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  const initializeBooking = async () => {
    try {
      setLoading(true);
      
      // Step 1: Create booking (which includes Razorpay order creation)
      const bookingResponse = await createBooking();
      
      // Validate critical response fields
      if (!bookingResponse?.bookingId) {
        throw new Error("Booking ID missing in response");
      }
      
      if (!bookingResponse?.orderId) {
        throw new Error("Razorpay order ID missing in response");
      }
      
      if (!bookingResponse?.amount) {
        throw new Error("Payment amount missing in response");
      }

      setOrderData({
        bookingId: bookingResponse.bookingId,
        orderId: bookingResponse.orderId,
        amount: bookingResponse.amount / 100, // Convert from paise to rupees
        documentMessage: bookingResponse.documentMessage || ""
      });

    } catch (err) {
      console.error("Booking initialization error:", err);
      
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying... Attempt ${retryCount + 1}`);
        setRetryCount(retryCount + 1);
        return;
      }
      
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeBooking();
  }, [retryCount]); // Retry when retryCount changes

  if (loading) {
    return (
      <div className="w-full text-center py-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
          <div className="text-sm text-gray-500">Creating your booking...</div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="w-full text-center py-4">
        <div className="text-red-500 mb-2">Failed to initialize payment</div>
        <button 
          onClick={() => {
            setRetryCount(0);
            initializeBooking();
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {orderData.documentMessage && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded text-sm">
          {orderData.documentMessage}
        </div>
      )}
      
      <RazorpayButton
        amount={orderData.amount}
        bikeModel={bikeModel}
        customer={customer}
        orderId={orderData.orderId}
        bookingId={orderData.bookingId}
        handleOnlinePaymentSuccess={() => onSuccess(orderData)}
      />
    </div>
  );
};

export default AsyncRazorpayButton;