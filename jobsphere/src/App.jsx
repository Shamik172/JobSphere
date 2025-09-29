import React from 'react'

const App = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🚀 Welcome to Vite + React + Tailwind
        </h1>
        <p className="text-gray-600 mb-6">
          Edit <code className="bg-gray-200 px-1 rounded">App.jsx</code> and save to test HMR updates.
        </p>
        <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
          Get Started
        </button>
      </div>
    </div>
  )
}

export default App
