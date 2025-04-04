import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaCalendar,
  FaShieldAlt,
  FaUserCircle,
} from "react-icons/fa";
 
const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
 
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
 
    if (!token) {
      navigate("/login");
      return;
    }
 
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
 
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }
 
        const data = await response.json();
        setUserData(data);
        localStorage.setItem("userData", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching user data:", error);
        localStorage.removeItem("jwtToken");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };
 
    fetchUserProfile();
  }, [navigate]);
 
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex justify-center items-center">
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
                <ProfileDetail icon={<FaPhone />} label="Phone Number" value={userData.phoneNumber} />
                <ProfileDetail icon={<FaEnvelope />} label="Email Address" value={userData.email} />
                <ProfileDetail icon={<FaIdCard />} label="Aadhar Number" value={userData.aadharNumber} />
                <ProfileDetail icon={<FaCalendar />} label="Account Created" value={new Date(userData.createdAt).toLocaleString()} />
                <ProfileDetail icon={<FaShieldAlt />} label="Role" value={userData.role} />
                <ProfileDetail icon={<FaUserCircle />} label="Username" value={userData.username} />
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
 
const ProfileDetail = ({ icon, label, value }) => (
  <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
    <div className="text-gray-400">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value || "N/A"}</p>
    </div>
  </div>
);
 
export default ProfilePage;
 
 