import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8080/api/candidate/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      setSuccess(data.message || "Signup successful");
      setLoading(false);

      // After signup, navigate to login
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 60 }}>
      <form onSubmit={handleSubmit} style={{ width: 360, display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ textAlign: "center" }}>Candidate Signup</h2>
        {error && <div style={{ color: "#b00020" }}>{error}</div>}
        {success && <div style={{ color: "green" }}>{success}</div>}
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: 10 }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 10 }}
        />
        <input
          type="tel"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: 10 }}
        />
        <button type="submit" style={{ padding: 10 }} disabled={loading}>
          {loading ? "Signing up..." : "Signup"}
        </button>
        <div style={{ textAlign: "center" }}>
          <a href="/login">Already have an account? Login</a>
        </div>
      </form>
    </div>
  );
};

export default Signup;
