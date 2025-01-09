import Role from "#models/role";

export const getRole = async (id, filter = {}) => {
  if (!id) {
    const roleData = await Role.findAll(filter);
    return roleData;
  }
  const roleData = await Role.findById(id);
  return roleData;
};

export const getLimitedRoleFields = async (fields) => {
  const roleData = await Role.find().select("id name");
  return roleData;
};

export const createRole = async (roleData) => {
  const role = await Role.create(roleData);
  return role;
};

export const updateRole = async (id, updates) => {
  const role = await Role.findById(id);
  for (const key in updates) {
    role[key] = updates[key];
  }

  await role.save();
  return role;
};

export const deleteRole = async (id) => {
  const existingRole = await Role.findByIdAndDelete(id);
  return true;
};
