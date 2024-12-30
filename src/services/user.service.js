import env from "#configs/env";
import User from "#models/user";
import httpStatus from "#utils/httpStatus";
import { createToken } from "#utils/jwt";

export const getUsers = async (id, filter = {}) => {
  if (!id) {
    const userData = await User.find(filter);
    return userData;
  }
  const userData = await User.findById(id);
  return userData;
};

export const loginUser = async (userData) => {
  const { email, password } = userData;
  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    throw {
      status: false,
      httpStatus: httpStatus.UNAUTHORIZED,
      message: "User doesn't exist",
    };
  }
  if (!(await existingUser.isPasswordCorrect(password))) {
    throw {
      status: false,
      httpStatus: httpStatus.UNAUTHORIZED,
      message: "Incorect password",
    };
  }

  const payload = {
    id: existingUser.id,
  };

  const token = createToken(payload, env.JWT_SECRET, { expiresIn: "24h" });
  return token;
};

export const createUser = async (userData) => {
  const user = await User.create(userData);
  return user;
};

export const updateUser = async (id, updates) => {
  const user = await User.findById(id);
  return user;
};

export const deleteUser = async (id) => {
  const findUserBYid = await User.findByIdAndDelete(id);
  return findUserBYid;
};
