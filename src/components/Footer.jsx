import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Bike Rental Service. All Rights Reserved.
        </p>
        <p className="text-xs mt-1">Designed for bike enthusiasts who love adventure.</p>
      </div>
    </footer>
  );
};

export default Footer;
