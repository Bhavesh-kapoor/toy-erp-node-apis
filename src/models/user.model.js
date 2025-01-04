import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import httpStatus from "#utils/httpStatus";
import Role from "#models/role";
import BaseSchema from "#models/base";

const userSchema = new BaseSchema(
  {
    // Personal Details
    name: {
      type: String,
      required: true,
      trim: true,
    },
    profilePic: {
      type: String,
      isFile: true,
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
    birthDate: {
      type: Date,
    },
    joiningDate: {
      type: Date,
    },
    leavingDate: {
      type: Date,
    },

    // Contact Details
    mobileNo: {
      type: String,
      required: true,
    },
    altMobileNo: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    familyRefInfo: {
      type: String,
    },

    // Address Details
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

    // Salary Details
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

    // Expenses (if applicable)
    expenses: {
      type: [mongoose.Schema.Types.Mixed], // Array to store flexible expense objects
    },

    // Role
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Role,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Department,
    },

    // Active Status
    status: {
      type: Boolean,
      default: true,
    },

    // Authentication
    password: {
      type: String,
      required: true,
      trim: true,
    },
    secret: {
      type: String,
      required: true,
    },
    isTwoFactorEnabled: {
      type: Boolean,
      required: true,
    },

    // Metadata and Soft Delete
    metaData: {
      type: mongoose.Schema.Types.Mixed,
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
