import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  password: {
    trim: true,
    required: true,
    type: String,
  },
  phone: {
    type: String,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
  },
  address: {
    type: String,
  },
  secret: {
    type: String,
  },
  isTwoFactorEnabled: {
    type: Boolean,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

UserSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", UserSchema);
