import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  chatType: { type: String, enum: ["private", "group"], required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  lastMessage: {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    sentAt: Date
  }
});

export default mongoose.model("Chat", chatSchema);
