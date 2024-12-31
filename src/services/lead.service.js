import User from "#models/user";
import Lead from "#models/lead";
import httpStatus from "#utils/httpStatus";

export const getLeads = async (id, filter = {}) => {
  if (!id) {
    const leadData = await Lead.find(filter);
    return leadData;
  }
  const leadData = await Lead.findById(id).populate("salesPerson");
  return leadData;
};

export const createLead = async (leadData) => {
  const { salesPerson: userId } = leadData;
  userId ? await User.findUserById(userId) : null;
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
  const existingLead = await Lead.findByIdAndDelete(id);
  return true;
};
