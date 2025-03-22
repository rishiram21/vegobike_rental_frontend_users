import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaPhone, FaEnvelope, FaIdCard } from "react-icons/fa";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch user data from API
    fetch(`${import.meta.env.VITE_BASE_URL}/fetch-user-details`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUserData(data);
        localStorage.setItem("userData", JSON.stringify(data));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      });
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 px-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>

        {userData ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-orange-600 p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="bg-white rounded-full p-3">
                  <FaUser className="text-orange-600 text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{userData.name}</h2>
                  <p className="text-orange-100">{userData.email}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
                  <FaPhone className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{userData.phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
                  <FaEnvelope className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium">{userData.email}</p>
                  </div>
                </div>

                {userData.address && (
                  <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
                    <FaIdCard className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{userData.address}</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                className="mt-6 w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md transition-colors"
                onClick={() => navigate("/edit-profile")}
              >
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">User information not available.</p>
            <button
              className="mt-4 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md transition-colors"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
