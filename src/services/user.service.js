import User from "#models/user";

export const getUsers = async (id, filter = {}) => {
  if (!id) {
    const userData = await User.find(filter);
    return userData;
  }
  const userData = await User.findById(id);
  return userData;
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
