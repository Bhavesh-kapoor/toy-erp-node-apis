import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import httpStatus from "#utils/httpStatus";

const userSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.statics.findUserById = async function (id) {
  const user = await this.findById(id);
  if (!user) {
    throw {
      status: false,
      message: "User not found",
      httpStatus: httpStatus.NOT_FOUND,
    };
  }
  return user;
};

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
