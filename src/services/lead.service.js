import Lead from "#models/lead";
import Address from "#models/address";
import httpStatus from "#utils/httpStatus";
import Service from "#services/base";
import { addressManager } from "#services/user";
import ActivityLogService from "#services/activitylog";

class LeadService extends Service {
  static Model = Lead;

  static async get(id, filter) {
    if (id) {
      return this.Model.findDocById(id);
    }

    const initialStage = [
      {
        $lookup: {
          from: "users",
          localField: "assignedSalesPerson",
          foreignField: "_id",
          as: "assignedSalesPerson",
        },
      },
    ];

    const extraStage = [
      {
        $project: {
          salesPersonName: { $arrayElemAt: ["$assignedSalesPerson.name", 0] },
          salesPersonEmail: { $arrayElemAt: ["$assignedSalesPerson.email", 0] },
          companyName: "$companyDetails.companyName",
          leadId: 1,
          name: {
            $concat: [
              { $ifNull: ["$personalDetails.firstName", ""] },
              " ",
              { $ifNull: ["$personalDetails.lastName", ""] },
            ],
          },
          email: "$personalDetails.email",
          phone: "$personalDetails.phone",
          source: "$sourceName",
          priorityLevel: 1,
          status: 1,
          updatedAt: 1,
          _id: 1,
        },
      },
    ];

    const leadData = this.Model.findAll(filter, initialStage, extraStage);
    return leadData;
  }

  static async create(leadData) {
    const lead = new this.Model(leadData);
    leadData.id = lead.id;
    await addressManager(leadData);

    for (const key in leadData) {
      lead[key] = leadData[key] ?? lead[key];
    }

    await lead.save();
    const activityLogData = {
      leadId: lead.id,
      ...(lead.assignedSalesPerson ? { userId: lead.assignedSalesPerson } : {}),
      action: "LEAD_CREATED",
      description: "A new lead was successfully created by the user.",
      metadata: {
        message: "This is a dummy data",
      },
    };

    await ActivityLog.create(activityLogData);
    return lead;
  }
  static async update(id, updates) {
    const lead = await this.Model.findDocById(id);
    const existingStatus = lead.status;
    const existingStatusUpdates = lead.statusUpdate;

    updates.id = id;
    await addressManager(updates);

    for (const key in updates) {
      lead[key] = updates[key] ?? lead[key];
    }
    await lead.validate();
    if (updates.status && existingStatus !== updates.status) {
      if (
        updates.statusUpdate ||
        updates.statusUpdate.length <= existingStatusUpdates.length
      ) {
        throw {
          status: false,
          message: "A reason is required to make a status update",
          httpStatus: httpStatus.NOT_FOUND,
        };
      }
      await ActivityLogService.create({
        leadId: lead.id,
        ...(lead.assignedSalesPerson
          ? { userId: lead.assignedSalesPerson }
          : {}),
        action: "LEAD_UPDATED",
        description: `Lead status was changed from ${existingStatus} to ${updates.status}`,
        metadata: updates.statusUpdate[updates.statusUpdate.length - 1],
      });
    }

    if (
      updates.statusUpdate &&
      updates.statusUpdate.length < existingStatusUpdates.length
    ) {
      throw {
        status: false,
        message: "Invalid changes to status updates are not allowed",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    await lead.save();
    return lead;
  }
}

export default LeadService;
