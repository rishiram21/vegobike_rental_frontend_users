import React, { useState } from "react";

const Notification = ({ message, type, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className={`p-6 bg-white border rounded-lg shadow-lg text-center animate-fadeIn ${
          type === "success" ? "border-green-500" : "border-red-500"
        }`}
      >
        <h2 className={`text-lg font-bold ${type === "success" ? "text-green-500" : "text-red-500"}`}>
          {type === "success" ? "Success!" : "Error!"}
        </h2>
        <p className="mt-2 text-gray-700">{message}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const AuthPopup = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    otp: "",
    aadharFront: "",
    aadharBack: "",
    drivingLicense: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, [name]: reader.result }));
      };
    }
  };

  const handleSendOtp = () => {
    if (!formData.contactNumber || formData.contactNumber.length !== 10) {
      setNotification({ message: "Please enter a valid 10-digit contact number.", type: "error" });
      return;
    }
    setOtpSent(true);
    setNotification({ message: "OTP has been sent to your contact number.", type: "success" });
  };

  const handleOtpLogin = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setNotification({ message: "Please enter a valid 6-digit OTP.", type: "error" });
      return;
    }
    onLogin(formData);
    setNotification({ message: "Login successful!", type: "success" });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.aadharFront || !formData.aadharBack || !formData.drivingLicense) {
      setNotification({ message: "Please upload all required documents.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8081/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          contactNumber: formData.contactNumber,
          aadharFront: formData.aadharFront,
          aadharBack: formData.aadharBack,
          drivingLicense: formData.drivingLicense,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setNotification({ message: "Registration successful! Please login.", type: "success" });
        setIsLogin(true);
      } else {
        setNotification({ message: result.message || "Registration failed. Please try again.", type: "error" });
      }
    } catch (error) {
      setNotification({ message: "Error: Unable to register. Please try again later.", type: "error" });
      console.error("Registration Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <button className="absolute top-2 right-2 text-gray-500 text-xl" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-lg font-bold mb-4">
          {isLogin ? "Login with OTP" : "Create an Account"}
        </h2>

        <form onSubmit={isLogin ? handleOtpLogin : handleRegister} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium">Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              maxLength="10"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              required
            />
          </div>

          {isLogin && !otpSent && (
            <button
              type="button"
              onClick={handleSendOtp}
              className="w-full bg-orange-400 text-white py-2 rounded hover:bg-orange-500 transition"
            >
              Send OTP
            </button>
          )}

          {otpSent && isLogin && (
            <div>
              <label className="block text-sm font-medium">Enter OTP</label>
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                className="w-full p-2 border border-gray-300 rounded text-sm"
                required
              />
            </div>
          )}

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium">Aadhar Card Front</label>
                <input
                  type="file"
                  name="aadharFront"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Aadhar Card Back</label>
                <input
                  type="file"
                  name="aadharBack"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Driving License</label>
                <input
                  type="file"
                  name="drivingLicense"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-orange-400 text-white py-2 rounded hover:bg-orange-500 transition"
            disabled={loading}
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="text-sm text-center mt-4">
          {isLogin ? (
            <p>
              Don’t have an account?{" "}
              <button onClick={() => setIsLogin(false)} className="text-orange-500 underline">
                Register
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button onClick={() => setIsLogin(true)} className="text-orange-500 underline">
                Login
              </button>
            </p>
          )}
        </div>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default AuthPopup;
