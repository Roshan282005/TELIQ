import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true }, // URL or text content
  type: { type: String, enum: ["text", "image", "video"], default: "text" },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24 hours
  views: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who viewed the story
});

export default mongoose.model("Story", storySchema);
