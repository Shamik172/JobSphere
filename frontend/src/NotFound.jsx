import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Oops! Page not found.</p>
      <Link
        to="/"
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-semibold"
      >
        Go to Home
      </Link>
    </div>
  );
}
