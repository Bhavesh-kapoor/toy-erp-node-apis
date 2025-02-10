import Role from "#models/role";
import httpStatus from "#utils/httpStatus";
import Service from "#services/base";

class RoleService extends Service {
  static Model = Role;

  static defaultRoles = ["Admin"];

  static async getLimitedRoleFields(fields) {
    const roleData = await Role.find().select("id name");
    return roleData;
  }

  static async update(id, updateData) {
    const role = await this.Model.findDocById(id);
    if (this.defaultRoles.includes(role.name)) {
      throw {
        status: false,
        message: "Editing default roles isn't allowed",
        httpStatus: httpStatus.FORBIDDEN,
      };
    }
    role.update(updates);
    await role.save();
    return role;
  }
}

export default RoleService;
