import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Stories() {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/stories")
      .then((res) => res.json())
      .then((data) => setStories(data))
      .catch((err) => console.error("Error fetching stories:", err));

    socket.on("newStory", (newStory) => {
      setStories((prev) => [newStory, ...prev]);
    });

    socket.on("storyViewed", ({ storyId, userId }) => {
      setStories((prev) =>
        prev.map((story) =>
          story._id === storyId
            ? { ...story, views: [...(story.views || []), userId] }
            : story
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div style={{ border: "1px solid gray", padding: "10px", width: "300px" }}>
      <h3>Stories</h3>
      {stories.length === 0 ? (
        <p>No stories</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {stories.map((story) => (
            <li key={story._id} style={{ margin: "10px 0" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={story.user?.profilePic || "https://via.placeholder.com/50"}
                  alt="Profile"
                  style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                />
                <div style={{ marginLeft: "10px" }}>
                  <b>{story.user?.username || "Unknown"}</b>
                  <p>{story.type}: {story.content}</p>
                  <small>Expires at: {new Date(story.expiresAt).toLocaleString()}</small>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
