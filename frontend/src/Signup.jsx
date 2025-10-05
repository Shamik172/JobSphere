import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/interviewer/signup`,
        form,
        { withCredentials: true } // ✅ cookie allow
      );

      setMessage(res.data.message); // ✅ server sirf message bhej raha
      setTimeout(() => navigate("/login"), 1500); // redirect to login page
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Signup</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-80">
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Signup
        </button>
      </form>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
};

export default Signup;
