import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8080/api/candidate/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // store token and user
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user || {}));
      }

      setLoading(false);
      navigate("/");
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 60 }}>
      <form onSubmit={handleSubmit} style={{ width: 360, display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ textAlign: "center" }}>Candidate Login</h2>
        {error && <div style={{ color: "#b00020" }}>{error}</div>}
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
        <button type="submit" style={{ padding: 10 }} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <div style={{ textAlign: "center" }}>
          <a href="/signup">Don't have an account? Signup</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
