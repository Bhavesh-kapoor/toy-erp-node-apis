import Role from "../models/role.model.js";

/**
 * Service for managing roles and permissions.
 */
class PermissionService {
  /**
   * Create a new role.
   * @param {Object} data - Data for the new role.
   * @param {string} data.name - Name of the role.
   * @param {Array} data.permissions - Permissions for the role.
   * @param {string} [data.description] - Optional description of the role.
   * @returns {Promise<Object>} - Created role document with a status message.
   * @throws {Error} - If creation fails.
   */
  static async createRole(data) {
    try {
      const newRole = new Role(data);
      const role = await newRole.save();
      return {
        status: "success",
        message: "Role created successfully.",
        data: role,
      };
    } catch (error) {
      throw new Error(`Failed to create role: ${error.message}`);
    }
  }

  /**
   * Fetch all roles with optional filters.
   * @param {Object} [filters] - Filters for querying roles.
   * @returns {Promise<Object[]>} - List of roles with status message.
   * @throws {Error} - If fetching fails.
   */
  static async fetchRoles(filters = {}) {
    try {
      const roles = await Role.find(filters).sort({ createdAt: -1 });
      return {
        status: "success",
        message: "Roles fetched successfully.",
        data: roles,
      };
    } catch (error) {
      throw new Error(`Failed to fetch roles: ${error.message}`);
    }
  }

  /**
   * Update a role by ID.
   * @param {string} roleId - ID of the role to update.
   * @param {Object} updates - Fields to update.
   * @returns {Promise<Object>} - Updated role document with status message.
   * @throws {Error} - If update fails or role is not found.
   */
  static async updateRole(roleId, updates) {
    try {
      const updatedRole = await Role.findByIdAndUpdate(roleId, updates, {
        new: true,
        runValidators: true,
      });
      if (!updatedRole) {
        throw new Error(`Role with ID ${roleId} not found.`);
      }
      return {
        status: "success",
        message: "Role updated successfully.",
        data: updatedRole,
      };
    } catch (error) {
      throw new Error(`Failed to update role: ${error.message}`);
    }
  }

  /**
   * Delete a role by ID.
   * @param {string} roleId - ID of the role to delete.
   * @returns {Promise<Object>} - Deleted role document with status message.
   * @throws {Error} - If deletion fails or role is not found.
   */
  static async deleteRole(roleId) {
    try {
      const deletedRole = await Role.findByIdAndDelete(roleId);
      if (!deletedRole) {
        throw new Error(`Role with ID ${roleId} not found.`);
      }
      return {
        status: "success",
        message: "Role deleted successfully.",
        data: deletedRole,
      };
    } catch (error) {
      throw new Error(`Failed to delete role: ${error.message}`);
    }
  }

  /**
   * Check if a role has specific permission for a module.
   * @param {string} roleId - ID of the role to check.
   * @param {string} module - Name of the module.
   * @param {string} action - CRUD action to check (e.g., "create", "read").
   * @returns {Promise<Object>} - Permission status with a message.
   * @throws {Error} - If checking fails.
   */
  static async hasPermission(roleId, module, action) {
    try {
      const role = await Role.findById(roleId);
      if (!role) throw new Error(`Role with ID ${roleId} not found.`);

      const permission = role.permissions.find(
        (perm) => perm.module === module
      );
      if (!permission || permission.access.get(action) === undefined) {
        return {
          status: "failure",
          message: `Permission for action '${action}' on module '${module}' is not defined.`,
          data: null,
        };
      }
      return {
        status: "success",
        message: `Permission check for action '${action}' on module '${module}' succeeded.`,
        data: permission.access.get(action),
      };
    } catch (error) {
      throw new Error(`Failed to check permission: ${error.message}`);
    }
  }
}

export default PermissionService;
