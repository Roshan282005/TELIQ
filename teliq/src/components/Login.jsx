import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase.js";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login"); // login, register, forgot
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:3000"; // ✅ Backend server

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let endpoint = "";
      let body = {};

      if (mode === "register") {
        endpoint = "/api/register";
        body = {
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        };
      } else if (mode === "login") {
        endpoint = "/api/login";
        body = {
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        };
      } else if (mode === "forgot") {
        endpoint = "/api/forgot-password";
        body = { email: formData.email }; // only email needed
      }

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        if (mode === "forgot") {
          setError("Password reset link sent to your email.");
        } else {
          onLogin(data.user, data.contacts || []);
        }
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Request Error:", err);
      setError("Network error. Check server connection.");
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.uid) {
        setError("Google sign in failed: no user ID");
        return;
      }

      const res = await fetch(`${API_BASE}/api/auth/firebase-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onLogin(data.user, data.contacts || []);
      } else {
        setError(data.error || "Google sign in failed on server");
      }
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      setError("Google sign in failed: " + err.message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f0f0",
      }}
    >
      <div
        style={{
          width: "400px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          {mode === "login"
            ? "Login"
            : mode === "register"
            ? "Register"
            : "Forgot Password"}
        </h2>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div style={{ marginBottom: "10px" }}>
              <label>👤 Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                }}
              />
            </div>
          )}

          {(mode === "register" || mode === "login" || mode === "forgot") && (
            <div style={{ marginBottom: "10px" }}>
              <label>📧 Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                }}
              />
            </div>
          )}

          {(mode === "register" || mode === "login") && (
            <div style={{ marginBottom: "10px" }}>
              <label>📞 Phone (optional)</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                }}
              />
            </div>
          )}

          {mode !== "forgot" && (
            <div style={{ marginBottom: "10px" }}>
              <label>🔒 Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: loading ? "#ccc" : "#25d366",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? "Loading..."
              : mode === "login"
              ? "Login"
              : mode === "register"
              ? "Register"
              : "Reset Password"}
          </button>
        </form>

        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <button
            onClick={handleGoogleSignIn}
            style={{
              padding: "10px",
              backgroundColor: "#4285f4",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Sign in with Google
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          {mode === "login" && (
            <>
              <button
                onClick={() => setMode("register")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#25d366",
                  cursor: "pointer",
                }}
              >
                Register
              </button>{" "}
              |
              <button
                onClick={() => setMode("forgot")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#25d366",
                  cursor: "pointer",
                }}
              >
                Forgot Password
              </button>
            </>
          )}
          {(mode === "register" || mode === "forgot") && (
            <button
              onClick={() => setMode("login")}
              style={{
                background: "none",
                border: "none",
                color: "#25d366",
                cursor: "pointer",
              }}
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
