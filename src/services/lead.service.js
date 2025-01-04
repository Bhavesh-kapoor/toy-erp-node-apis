import User from "#models/user";
import Lead from "#models/lead";
import Address from "#models/address";
import httpStatus from "#utils/httpStatus";

export const getLeads = async (id, filter = {}) => {
  if (!id) {
    const leadData = await Lead.findAll(filter);
    return leadData;
  }
  const leadData = await Lead.findById(id);
  return leadData;
};

export const createLead = async (leadData) => {
  const { assignedSalesPerson: userId } = leadData;
  if (userId) {
    const user = await User.findUserById(userId);
    if (!user) {
      throw {
        status: false,
        message: "SalesPerson not found",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }
    leadData.assignedDate = new Date();
  }
  const { addresses } = leadData;
  let selected = 0;
  const addedAddresses = addresses.map((address) => {
    address.selected ? (selected += 1) : null;
    return Address.create(address);
  });

  if (selected !== 1) {
    throw {
      status: false,
      message: "Only one primary address is allowed",
      httpStatus: httpStatus.CONFLICT,
    };
  }

  await Promise.all(addedAddresses);

  const lead = await Lead.create(leadData);
  return lead;
};

export const updateLead = async (id, updates) => {
  const lead = await Lead.findById(id);
  const existingStatus = lead.status;
  for (const key in updates) {
    lead[key] = updates[key];
  }
  await lead.validate();

  if (existingStatus !== updates.status) {
    if (!updates.statusUpdate) {
      throw {
        status: false,
        message: "A reason is required to make a status update",
        httpStatus: httpStatus.NOT_FOUND,
      };
    }
    const obj = {
      update: `status changed from ${lead.get("status")} to ${lead.status}`,
      message: updates.statusUpdate,
    };
    lead.updateComments.push(obj);
  }

  await lead.save();
  return lead;
};

export const deleteLead = async (id) => {
  await Lead.findByIdAndDelete(id);
  return true;
};
