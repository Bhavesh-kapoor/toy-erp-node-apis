import Department from "#models/department";

export const getDepartment = async (id, filter = {}) => {
  if (!id) {
    const departmentData = await Department.find(filter);
    return departmentData;
  }
  const departmentData = await Department.findById(id);
  return departmentData;
};

export const createDepartment = async (departmentData) => {
  const department = await Department.create(departmentData);
  return department;
};

export const updateDepartment = async (id, updates) => {
  const department = await Department.findById(id);
  for (const key in updates) {
    department[key] = updates[key];
  }
};

export const deleteDepartment = async (id) => {
  const existingDepartment = await Department.findByIdAndDelete(id);
  return true;
};
