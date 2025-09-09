import { useState, useEffect } from "react";

export default function ProfileSetup({ user, onUpdate }) {
  const [profile, setProfile] = useState({
    username: user?.username || "",
    phone: user?.phone || "",
    profilePic: user?.profilePic || "",
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (response.ok) {
        onUpdate(profile);
        alert("Profile updated successfully");
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  return (
    <div style={{ width: "300px", borderRight: "1px solid #e0e0e0", padding: "10px" }}>
      <h3>Profile Setup</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={profile.username}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Phone:</label>
          <input
            type="text"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Profile Picture URL:</label>
          <input
            type="text"
            name="profilePic"
            value={profile.profilePic}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>
        <button type="submit" style={{ backgroundColor: "#25d366", color: "white", border: "none", padding: "10px", borderRadius: "5px", width: "100%" }}>
          Update Profile
        </button>
      </form>
    </div>
  );
}
