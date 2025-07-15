"use client"

import { useState, useEffect } from "react";
import AdminPanel from "./adm";

export default function AdminLog() {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedKey = localStorage.getItem("adminKey");
    if (savedKey) setAdminKey(savedKey);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Optionally, you can verify the key with a test API call here
    localStorage.setItem("adminKey", inputKey);
    setAdminKey(inputKey);
    setInputKey("");
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("adminKey");
    setAdminKey(null);
  };

  if (!adminKey) {
    return (
      <form onSubmit={handleSubmit}>
        <label>
          <span style={{ color: 'white' }}>Enter Admin Key:</span>
          <input
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
          />
        </label>
        <button type="submit">Enter</button>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </form>
    );
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      <button onClick={handleLogout}>Logout</button>
      <AdminPanel></AdminPanel>
    </div>
  );
}