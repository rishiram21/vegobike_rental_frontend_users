import React from "react";
import { User, Mail, Phone, Calendar, Heart, Shield, MapPin, Award, Edit, Camera } from "lucide-react";

const ProfilePage = () => {
  // Static user data for Maya Patel
  const userData = {
    name: "Maya Patel",
    email: "maya.patel@example.com",
    mobile: "+91 9234567890",
    gender: "Female",
    dateOfBirth: "23 Sep 1994",
    emergencyContact: "+91 8456789012",
    location: "Pune, India",
    occupation: "Product Manager",
    joinDate: "January 2023",
    interests: ["Tech Startups", "Photography", "Fitness", "Interior Design"],
    achievements: [
      { title: "Product Launch of the Year", date: "December 2023" },
      { title: "Leadership Excellence Award", date: "May 2024" }
    ]
  };

  // Color theme options - uncomment one set to use
  /*
  // 1. Elegant Teal & Gold
  const colors = {
    primary: "from-teal-500 to-teal-700",
    accent: "teal-500",
    accentHover: "teal-600",
    highlight: "teal-50",
    text: "teal-700",
    pill: "bg-amber-100 text-amber-700",
    icon: "text-amber-500",
    border: "border-teal-100"
  };
  */
  
  /* 
  // 2. Royal Purple & Coral
  const colors = {
    primary: "from-purple-600 to-indigo-700",
    accent: "purple-600",
    accentHover: "purple-700",
    highlight: "purple-50",
    text: "purple-700",
    pill: "bg-coral-100 text-coral-700",
    icon: "text-coral-500",
    border: "border-purple-100"
  };
  */

  /*
  // 3. Ocean Blue & Sunshine
  const colors = {
    primary: "from-blue-500 to-blue-700",
    accent: "blue-500",
    accentHover: "blue-600",
    highlight: "blue-50",
    text: "blue-700",
    pill: "bg-yellow-100 text-yellow-700",
    icon: "text-yellow-500",
    border: "border-blue-100"
  };
  */

  /*
  // 4. Forest Green & Peach
  const colors = {
    primary: "from-green-600 to-green-800",
    accent: "green-600",
    accentHover: "green-700",
    highlight: "green-50",
    text: "green-700",
    pill: "bg-orange-100 text-orange-700",
    icon: "text-orange-500",
    border: "border-green-100"
  };
  */

  
  // 5. Midnight & Rose
  const colors = {
    primary: "from-gray-800 to-gray-900",
    accent: "gray-800",
    accentHover: "gray-900",
    highlight: "gray-100",
    text: "gray-800",
    pill: "bg-rose-100 text-rose-700",
    icon: "text-rose-500",
    border: "border-gray-200"
  };
  

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className={`bg-gradient-to-r ${colors.primary} py-8 px-6`}>
        <div className="container mx-auto">
          <h1 className="text-white text-2xl font-bold">My Profile</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6 text-center">
                <div className="relative inline-block">
                  <img
                    src="/api/placeholder/150/150"
                    alt="Profile"
                    className={`rounded-full mx-auto h-32 w-32 object-cover border-4 ${colors.border}`}
                  />
                  <span className={`absolute bottom-2 right-2 bg-${colors.accent} rounded-full p-1 text-white`}>
                    <Camera size={16} />
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-800">{userData.name}</h2>
                <p className={`text-${colors.accent} font-medium`}>{userData.occupation}</p>
                <p className="text-gray-500 text-sm flex items-center justify-center mt-2">
                  <MapPin size={16} className="mr-1" />
                  {userData.location}
                </p>
                <p className="text-gray-500 text-sm mt-1">Member since {userData.joinDate}</p>
              </div>
              <nav className="border-t border-gray-100">
                <ul>
                  <li className={`py-3 px-6 bg-${colors.highlight} text-${colors.text} font-medium flex items-center`}>
                    <User size={18} className="mr-3" />
                    Profile
                  </li>
                  <li className="py-3 px-6 text-gray-700 hover:bg-gray-50 flex items-center transition duration-150">
                    <Award size={18} className="mr-3" />
                    Achievements
                  </li>
                  <li className="py-3 px-6 text-gray-700 hover:bg-gray-50 flex items-center transition duration-150">
                    <Shield size={18} className="mr-3" />
                    Privacy
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                  <button className={`px-4 py-2 bg-${colors.accent} text-white rounded-md hover:bg-${colors.accentHover} transition duration-150`}>
                    Save Changes
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm text-gray-500 mb-1 flex items-center">
                      <User size={16} className="mr-2" />
                      Name
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800 font-medium">{userData.name}</span>
                      <button className={`text-${colors.accent} hover:text-${colors.accentHover}`}>
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm text-gray-500 mb-1 flex items-center">
                      <Mail size={16} className="mr-2" />
                      Email
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800 font-medium">{userData.email}</span>
                      <button className={`text-${colors.accent} hover:text-${colors.accentHover}`}>
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm text-gray-500 mb-1 flex items-center">
                      <Phone size={16} className="mr-2" />
                      Mobile
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800 font-medium">{userData.mobile}</span>
                      <button className={`text-${colors.accent} hover:text-${colors.accentHover}`}>
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm text-gray-500 mb-1">Gender</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800 font-medium">{userData.gender}</span>
                      <button className={`text-${colors.accent} hover:text-${colors.accentHover}`}>
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm text-gray-500 mb-1 flex items-center">
                      <Calendar size={16} className="mr-2" />
                      Date of Birth
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800 font-medium">{userData.dateOfBirth}</span>
                      <button className={`text-${colors.accent} hover:text-${colors.accentHover}`}>
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm text-gray-500 mb-1 flex items-center">
                      <Heart size={16} className="mr-2" />
                      Emergency Contact
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800 font-medium">{userData.emergencyContact}</span>
                      <button className={`text-${colors.accent} hover:text-${colors.accentHover}`}>
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Interests & Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Interests */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.interests.map((interest, index) => (
                      <span key={index} className={`${colors.pill} px-3 py-1 rounded-full text-sm`}>
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Achievements */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Achievements</h3>
                  <div className="space-y-3">
                    {userData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center">
                        <Award className={colors.icon} size={18} />
                        <div className="ml-2">
                          <p className="text-gray-800 font-medium">{achievement.title}</p>
                          <p className="text-gray-500 text-sm">{achievement.date}</p>
                        </div>
                      </div>
                    ))}
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