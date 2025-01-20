import mongoose from "mongoose";
import Counter from "#models/counter";

export async function setUpCounter() {
  let existingCounter = await Counter.findOne();
  if (!existingCounter) {
    existingCounter = await Counter.create({});
  }
  return existingCounter;
}

export async function defaultOperations() {
  const db = mongoose.connection;

  const { Warehouse, Role, Counter } = db.models;

  // Set Up Warehouses
  await manageWarehouses(Warehouse);

  // Set Up Roles
  await manageRoles(Role);
}

async function manageWarehouses(Model) {
  const existing = await Model.find();
  if (existing.length !== 2) {
    for (let i = 0; i < 2; i++) {
      const warehouseData = {
        name: `Warehouse ${i}`,
        stock: new Map(),
      };
      await Model.create(warehouseData);
    }
  }
}

async function manageRoles(Model) {
  const existingAdmin = await Model.findOne({ name: "Admin" });
  const existingSalespersonRole = await Model.findOne({ name: "Salesperson" });
  const existingWarehouseRole = await Model.findOne({ name: "Warehouse" });
  const existingAccountantRole = await Model.findOne({ name: "Accountant" });

  if (!existingAdmin) {
    await Model.create({
      name: "Admin",
      description: "Admin Rights",
      status: true,
      permissions: [
        {
          module: "Dashboard",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        {
          module: "Manage Ledger",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        {
          module: "Role Management",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        {
          module: "Manage Employee",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        {
          module: "Manage Leads",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        {
          module: "Manage Products",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        {
          module: "Manage Quotations",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        {
          module: "Manage Warehouse",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        {
          module: "Manage Purchase",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        {
          module: "Manage Billing",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        {
          module: "Manage Payment",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
      ],
    });
  }
  if (!existingSalespersonRole) {
    await Model.create({
      name: "Salesperson",
      permissions: [
        {
          module: "Dashboard",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        {
          module: "Manage Ledger",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        {
          module: "Role Management",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Employee",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Leads",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        {
          module: "Manage Products",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Quotations",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        {
          module: "Manage Warehouse",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Purchase",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Billing",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Payment",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
      ],
    });
  }
  if (!existingWarehouseRole) {
    await Model.create({
      name: "Warehouse",
      permissions: [
        {
          module: "Dashboard",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        {
          module: "Manage Ledger",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Role Management",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Employee",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Leads",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Products",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Quotations",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Warehouse",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        {
          module: "Manage Purchase",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Billing",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Payment",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
      ],
    });
  }
  if (!existingAccountantRole) {
    await Model.create({
      name: "Accountant",
      permissions: [
        {
          module: "Dashboard",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Ledger",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Role Management",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Employee",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Leads",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Products",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Quotations",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Warehouse",
          access: {
            create: false,
            read: false,
            update: false,
            delete: false,
          },
        },
        {
          module: "Manage Purchase",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        {
          module: "Manage Billing",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        {
          module: "Manage Payment",
          access: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
      ],
    });
  }
}
