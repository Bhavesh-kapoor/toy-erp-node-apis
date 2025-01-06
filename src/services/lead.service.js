import Lead from "#models/lead";
import Address from "#models/address";
import httpStatus from "#utils/httpStatus";
import Service from "#services/base";
import { addressManager } from "#services/user";
import ActivityLogService from "#services/activitylog";

class LeadService extends Service {
  static Model = Lead;

  static async create(leadData) {
    const lead = new this.Model(leadData);
    leadData.id = lead.id;
    await addressManager(leadData);

    for (const key in leadData) {
      lead[key] = leadData[key] ?? lead[key];
    }

    return await lead.save();
  }
}

export const updateLead = async (id, updates) => {
  const lead = await Lead.findById(id);
  const existingStatus = lead.status;
  const existingStatusUpdates = lead.statusUpdate;

  updates.id = id;
  await addressManager(updates);

  for (const key in updates) {
    lead[key] = updates[key] ?? lead[key];
  }
  await lead.validate();
  if (existingStatus !== updates.status) {
    if (updates.statusUpdate.length <= existingStatusUpdates.length) {
      throw {
        status: false,
        message: "A reason is required to make a status update",
        httpStatus: httpStatus.NOT_FOUND,
      };
    }
    // TODO: create a new activitylog here
    await ActivityLogService.create({
      leadId: lead.id,
      ...(lead.assignedSalesPerson ? { userId: lead.assignedSalesPerson } : {}),
      action: "LEAD_UPDATED",
      description: `Lead status was changed from ${existingStatus} to ${updates.status}`,
      metadata: updates.statusUpdate[updates.statusUpdate.length - 1],
    });
  }

  if (updates.statusUpdate.length < existingStatusUpdates.length) {
    throw {
      status: false,
      message: "Invalid changes to status updates are not allowed",
      httpStatus: httpStatus.BAD_REQUEST,
    };
  }

  await lead.save();
  return lead;
};

export default LeadService;
