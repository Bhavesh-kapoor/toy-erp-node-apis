import Lead from "#models/lead";
import httpStatus from "#utils/httpStatus";

export const getLeads = async (id, filter = {}) => {
  if (!id) {
    const leadData = await Lead.find(filter);
    return leadData;
  }
  const leadData = await Lead.findById(id);
  return leadData;
};

export const createLead = async (leadData) => {
  const lead = await Lead.create(leadData);
  return lead;
};

export const updateLead = async (id, updates) => {
  const lead = await Lead.findById(id);
  for (const key in updates) {
    lead[key] = updates[key];
  }
  await lead.save();
  return lead;
};

export const deleteLead = async (id) => {
  const existingLead = await Lead.findByIdAndDelete(id);
  return true;
};
