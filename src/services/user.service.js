import env from "#configs/env";
import User from "#models/user";
import uploadFiles from "#utils/uploadFile";
import httpStatus from "#utils/httpStatus";
import { session } from "#middlewares/session";
import { createToken } from "#utils/jwt";
import { generateQRCode, verifyOTP } from "#utils/twoFactorAuth";

const allowedFileUploads = [
  "profilePic",
  "aadhaarCard",
  "panCard",
  "otherDocument",
];

export const getUsers = async (id, filter = {}) => {
  if (!id) {
    const userData = await User.find(filter);
    return userData;
  }
  const userData = await User.findById(id).populate("role");
  return userData;
};

export const loginUser = async (userData) => {
  const { email, password, otp } = userData;
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw {
      status: false,
      httpStatus: httpStatus.UNAUTHORIZED,
      message: "User doesn't exist",
    };
  }
  if (!existingUser.isPasswordCorrect(password)) {
    throw {
      status: false,
      message: "Incorrect Password",
      httpStatus: httpStatus.UNAUTHORIZED,
    };
  }
  if (existingUser.isTwoFactorEnabled && !otp) {
    throw {
      status: false,
      message: "Please enter the otp",
      otpRequired: true,
      httpStatus: httpStatus.UNAUTHORIZED,
    };
  }
  if (existingUser.isTwoFactorEnabled && !verifyOTP(existingUser.secret, otp)) {
    throw {
      status: false,
      message: "Invalid Otp",
      httpStatus: httpStatus.UNAUTHORIZED,
    };
  }
  const payload = {
    id: existingUser.id,
    email,
  };

  const token = createToken(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_TOKEN_AGE,
  });
  return { token, userData: existingUser };
};

export const enable2FA = async (id) => {
  const existingUser = await User.findUserById(id);

  const { secret, qrCode } = await generateQRCode({
    label: existingUser.email,
    issuer: "Toy Project",
  });
  existingUser.secret = secret;
  existingUser.isTwoFactorEnabled = true;
  await existingUser.save();
  return { secret, qrCode };
};

export const disable2FA = async (id) => {
  const existingUser = await User.findUserById(id);
  existingUser.secret = null;
  existingUser.isTwoFactorEnabled = false;
  await existingUser.save();
  return true;
};

export const createUser = async (userData) => {
  const files = session.get("files");

  const { isTwoFactorEnabled } = userData;
  isTwoFactorEnabled === "true"
    ? (userData.isTwoFactorEnabled = true)
    : (userData.isTwoFactorEnabled = false);

  const user = new User(userData);
  const filePaths = await uploadFiles(files, `users/${user.id}`);
  for (let i in filePaths) {
    user[i] = filePaths[i];
  }
  await user.save();
  return user;
};

export const updateUser = async (id, updates) => {
  const user = await User.findById(id);
  for (const key in updates) {
    user[key] = updates[key];
  }
  await user.save();
  return user;
};

export const deleteUser = async (id) => {
  const existingUser = await User.findByIdAndDelete(id);
  return true;
};
