import mongoose from "mongoose";

const CallSchema = new mongoose.Schema({
  callerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  callType: { type: String, enum: ["audio", "video"], required: true },
  status: { type: String, enum: ["ongoing", "ended", "missed"], default: "ongoing" },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model("Call", CallSchema);
