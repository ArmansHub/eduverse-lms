import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "student" },
    childId: { type: String },
    plan: { type: String, default: "free" },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);

export default User;