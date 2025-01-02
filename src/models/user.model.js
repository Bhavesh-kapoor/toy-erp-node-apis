import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import httpStatus from "#utils/httpStatus";
import Role from "#models/role";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    profilePic: {
      type: String,
      isFile: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Department,
    },
    qualification: {
      type: String,
    },
    panNo: {
      type: String,
    },
    aadhaarNo: {
      type: Number,
    },
    address: {
      type: String,
    },
    pinCode: {
      type: String,
    },
    state: {
      type: String,
      required: true,
    },
    mobileNo: {
      type: String,
      required: true,
    },
    altMobileNo: {
      type: String,
    },
    familyRefInfo: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    birthDate: {
      type: Date,
    },
    joiningDate: {
      type: Date,
    },
    leavingDate: {
      type: Date,
    },
    basic: {
      type: Number,
    },
    hra: {
      type: Number,
    },
    conveyance: {
      type: Number,
    },
    total: {
      type: Number,
    },
    panCard: { type: String },

    aadhaarCard: { type: String },

    otherDocuments: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Role,
      required: true,
    },
    secret: {
      type: String,
      required: true,
    },
    isTwoFactorEnabled: {
      type: Boolean,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

import Department from "#models/department";
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
