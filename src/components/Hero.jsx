import React from "react";

const Hero = () => {
  return (
    <div
      id="home"
      className="bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 text-white py-20 text-center"
    >
      <h1 className="text-5xl font-bold animate-fade-in">Welcome to OkBikes</h1>
      <p className="mt-4 text-lg animate-slide-in">
        Your ultimate bike rental solution
      </p>
      <button className="mt-6 px-6 py-3 bg-orange-600 text-white rounded-lg shadow-lg hover:bg-orange-700">
        Explore Bikes
      </button>
    </div>
  );
};

export default Hero;
