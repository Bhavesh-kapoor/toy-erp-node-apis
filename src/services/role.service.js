import Role from "#models/role";
import Service from "#services/base";

class RoleService extends Service {
  static Model = Role;

  static async getLimitedRoleFields(fields) {
    const roleData = await Role.find().select("id name");
    return roleData;
  }
}

export default RoleService;
