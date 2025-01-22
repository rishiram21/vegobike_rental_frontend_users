import React from "react";

const ProfilePage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Main Content */}
      <div className="container mx-auto py-8 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 bg-white shadow rounded-lg">
            <div className="p-4 text-center">
              <img
                src="https://via.placeholder.com/100"
                alt="Profile"
                className="rounded-full mx-auto"
              />
              <h2 className="mt-2 text-lg font-bold text-gray-700">Omkar Om</h2>
            </div>
            <nav className="text-left">
              <ul>
                <li className="py-2 px-4 bg-green-100 text-green-600 font-semibold">
                  Profile
                </li>
                <li className="py-2 px-4 text-gray-700 hover:bg-gray-100">
                  Bookings
                </li>
                <li className="py-2 px-4 text-gray-700 hover:bg-gray-100">
                  Go Coins
                </li>
              </ul>
            </nav>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-3 bg-white shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <h4 className="text-sm text-gray-500">Name</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Omkar Om</span>
                    <button className="text-green-600">Edit</button>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <h4 className="text-sm text-gray-500">Email</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">omkar@example.com</span>
                    <button className="text-green-600">Edit</button>
                  </div>
                </div>

                {/* Mobile */}
                <div>
                  <h4 className="text-sm text-gray-500">Mobile</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">+91 1234567890</span>
                    <button className="text-green-600">Edit</button>
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <h4 className="text-sm text-gray-500">Gender</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Male</span>
                    <button className="text-green-600">Edit</button>
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <h4 className="text-sm text-gray-500">Date of Birth</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">01 Jan 1990</span>
                    <button className="text-green-600">Edit</button>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h4 className="text-sm text-gray-500">Emergency Contact</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">+91 9876543210</span>
                    <button className="text-green-600">Edit</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
