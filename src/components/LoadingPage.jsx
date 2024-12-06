import React from "react";

const LoadingPage = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center backdrop-blur-lg z-50">
      <img src="/bikes/loading1.gif" alt="Loading..." />
    </div>
  );
};

export default LoadingPage;
