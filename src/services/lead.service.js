import User from "#models/user";
import Lead from "#models/lead";
import Address from "#models/address";
import httpStatus from "#utils/httpStatus";
import Service from "#services/base";

class LeadService extends Service {
  static Model = Lead;

  static async create(leadData) {
    const { assignedSalesPerson: userId } = leadData;
    if (userId) {
      leadData.assignedDate = new Date();
    }

    const { addresses = [] } = leadData;
    let selected = 0;
    const addedAddresses = addresses.map((address) => {
      address.isActive ? (selected += 1) : null;
      return Address.create(address);
    });

    if (selected !== 1) {
      throw {
        status: false,
        message: "Only one primary address is allowed",
        httpStatus: httpStatus.CONFLICT,
      };
    }

    const createdAddresses = await Promise.all(addedAddresses);
    leadData.addresses = [];
    createdAddresses.forEach((ele, index) => leadData.addresses.push(ele.id));
    const lead = await this.Model.create(leadData);
    return lead;
  }
}

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

export default LeadService;
