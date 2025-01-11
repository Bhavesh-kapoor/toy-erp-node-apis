import bcrypt from "bcryptjs";
import Role from "#models/role";
import mongoose, { Schema } from "mongoose";
import BaseSchema from "#models/base";
import httpStatus from "#utils/httpStatus";
import uploadFile from "#utils/uploadFile";

export const addressSchema = new Schema({
  line1: {
    type: String,
    required: true,
    trim: true,
  },
  street: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  pinCode: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (value) => /^[1-9]\d{4,9}$/.test(value), // Matches a 10-digit PIN code
      message: "Please enter a valid PIN code.",
    },
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  landmark: {
    type: String,
    trim: true,
  },
});

const userSchema = new BaseSchema({
  // Personal Details
  name: {
    type: String,
    required: true,
    trim: true,
  },
  profilePic: {
    type: String,
    file: true,
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
    type: addressSchema,
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

  // Documents
  panCardDoc: {
    type: String,
    file: true,
  },
  aadhaarCardDoc: {
    type: String,
    file: true,
  },
  otherDoc: {
    type: String,
    file: true,
  },
  forgotPassSecret: {
    type: String,
  },
});

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.pre("save", uploadFile);

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
