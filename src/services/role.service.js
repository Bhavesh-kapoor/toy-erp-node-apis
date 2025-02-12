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

  static async update(id, updates) {
    const role = await this.Model.findDocById(id);

    role.update(updates);
    if (this.defaultRoles[role["name"]]) {
      const permission = this.defaultRoles[role["name"]];
      role.permissions.forEach((ele, index) => {
        for (let i in permission[ele["module"]]) {
          ele.access.set(i, permission[ele["module"]][i]);
        }
      });
    }
    await role.save();
    return role;
  }

  static defaultRoles = {
    Admin: {
      Dashboard: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
      "Manage Ledger": {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
      "Role Management": {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
      "Manage Employee": {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
      "Manage Leads": {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
      "Manage Products": {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
      "Manage Quotations": {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
      "Manage Warehouse": {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
      "Manage Purchase": {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
      "Manage Billing": {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
      "Manage Payment": {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    },
    Salesperson: {
      Dashboard: {
        create: false,
        read: false,
        update: false,
        delete: false,
      },
      "Manage Quotations": {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
      "Manage Ledger": {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
      "Manage Leads": {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    },
    Warehouse: {
      Dashboard: {
        create: false,
        read: false,
        update: false,
        delete: false,
      },
      "Manage Warehouse": {
        create: true,
        read: true,
        update: true,
        delete: true,
      },

      "Manage Purchase": {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    },
    Accountant: {
      Dashboard: {
        create: false,
        read: false,
        update: false,
        delete: false,
      },
      "Manage Purchase": {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
      "Manage Billing": {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
      "Manage Payment": {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    },
  };
}

export default RoleService;
