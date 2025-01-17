import mongoose from "mongoose";
import Lead from "#models/lead";
import Service from "#services/base";
import httpStatus from "#utils/httpStatus";
import ActivityLogService from "#services/activitylog";
import LedgerService from "#services/ledger";

class LeadService extends Service {
  static Model = Lead;

  static async get(id, filter) {
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
          companyName: "$companyName",
          leadId: 1,
          name: {
            $concat: [
              { $ifNull: ["$firstName", ""] },
              " ",
              { $ifNull: ["$lastName", ""] },
            ],
          },
          email: 1,
          phone: 1,
          source: 1,
          priorityLevel: 1,
          status: 1,
          lastName: 1,
          _id: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    if (!id) {
      const leadData = this.Model.findAll(filter, initialStage, extraStage);
      return leadData;
    }

    const leadData = await this.Model.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $set: {
          line1: "$address.line1",
          city: "$address.city",
          street: "$address.street",
          state: "$address.state",
          pinCode: "$address.pinCode",
          country: "$address.country",
          landmark: "$address.landmark",
          line1Company: "$companyAddress.line1",
          cityCompany: "$companyAddress.city",
          streetCompany: "$companyAddress.street",
          stateCompany: "$companyAddress.state",
          pinCodeCompany: "$companyAddress.pinCode",
          countryCompany: "$companyAddress.country",
          landmarkCompany: "$companyAddress.landmark",
        },
      },
      {
        $unset: ["address", "companyAddress"],
      },
    ]);

    return leadData[0];
  }

  static async create(leadData) {
    delete leadData.statusUpdate;

    const existingLedger = await LedgerService.getSafe(null, {
      email: leadData.email,
    });

    if (existingLedger) {
      throw {
        status: false,
        message: "A ledger entry is already present for this lead",
        httpStatus: httpStatus.CONFLICT,
      };
    }

    const lead = new this.Model(leadData);
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

    await ActivityLogService.create(activityLogData);
    return lead;
  }
  static async update(id, updates) {
    const lead = await this.Model.findDocById(id);
    const existingStatus = lead.status;
    const existingStatusUpdates = lead.statusUpdate;
    delete updates.statusUpdate;

    if (updates.email && lead.email !== updates.email) {
      throw {
        status: false,
        message: "A Ledger entry with this email is already present",
        httpStatus: httpStatus.CONFLICT,
      };
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
