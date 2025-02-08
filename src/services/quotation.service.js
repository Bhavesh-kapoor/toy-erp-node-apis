import Service from "#services/base";
import Quotation from "#models/quotation";
import httpStatus from "#utils/httpStatus";
import ActivityLogService from "#services/activitylog";
import mongoose from "mongoose";
import LeadService from "#services/lead";
import LedgerService from "#services/ledger";
import UserService from "#services/user";
import PackingService from "#services/packing";

class QuotationService extends Service {
  static Model = Quotation;

  static async get(id, filter) {
    const initialStage = [
      {
        $lookup: {
          from: "users",
          localField: "preparedBy",
          foreignField: "_id",
          as: "preparedByData",
        },
      },
      {
        $lookup: {
          from: "ledgers",
          localField: "customer",
          foreignField: "_id",
          as: "customerData",
        },
      },

      {
        $lookup: {
          from: "leads",
          localField: "lead",
          foreignField: "_id",
          as: "leadData",
        },
      },
    ];

    const extraStage = [
      {
        $project: {
          preparedByName: { $arrayElemAt: ["$preparedByData.name", 0] },
          preparedByEmail: { $arrayElemAt: ["$preparedByData.email", 0] },
          customerName: { $arrayElemAt: ["$customerData.companyName", 0] },
          leadName: {
            $concat: [
              { $arrayElemAt: ["$leadData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$leadData.lastName", 0] },
            ],
          },
          quotationNo: 1,
          netAmount: 1,
          status: 1,
          _id: 1,
        },
      },
    ];

    if (!id) {
      const quotationData = this.Model.findAll(
        filter,
        initialStage,
        extraStage,
      );
      return quotationData;
    }

    //WARN: Fix the case when the data isn't there
    const quotationData = await this.Model.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      ...initialStage,
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "productuoms",
                localField: "uom",
                foreignField: "_id",
                as: "uom",
              },
            },
            { $unwind: "$uom" },
            {
              $project: {
                _id: 0,
                name: 1,
                description: 1,
                productCode: 1,
                uom: "$uom.shortName",
              },
            },
          ],
          as: "productDetails",
        },
      },
      {
        $addFields: {
          products: {
            $map: {
              input: "$products",
              as: "product",
              in: {
                $mergeObjects: [
                  "$$product",
                  {
                    $arrayElemAt: [
                      "$productDetails",
                      {
                        $indexOfArray: [
                          "$productDetails._id",
                          "$$product.product",
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
          leadName: {
            $concat: [
              { $arrayElemAt: ["$leadData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$leadData.lastName", 0] },
            ],
          },
          preparedByName: { $arrayElemAt: ["$preparedByData.name", 0] },
          preparedByEmail: { $arrayElemAt: ["$preparedByData.email", 0] },
          customerName: { $arrayElemAt: ["$customerData.companyName", 0] },
        },
      },
      {
        $project: {
          productDetails: 0,
          preparedByData: 0,
          customerData: 0,
          leadData: 0,
        },
      },
    ]);
    return quotationData[0];
  }

  static async getLimitedFields(filters = {}) {
    const pipeline = [
      {
        $project: {
          name: "$quotationNo",
        },
      },
    ];

    pipeline.unshift({
      $match: filters,
    });

    const data = await this.Model.aggregate(pipeline);
    return data;
  }

  static async getBaseFields() {
    const customerData = LedgerService.getWithAggregate([
      {
        $match: {
          ledgerType: { $in: ["Customer", "Both"] },
        },
      },
      {
        $project: {
          name: "$companyName",
        },
      },
    ]);

    const leadData = LeadService.getWithAggregate([
      {
        $project: {
          name: {
            $concat: ["$firstName", " ", "$lastName"],
          },
        },
      },
    ]);

    const preparedByData = UserService.getUserByRole("Salesperson");

    // FIX: this should be changes to a generic function to handle all this
    const [customers, leads, preparedBy] = await Promise.all([
      customerData,
      leadData,
      preparedByData,
    ]);
    return {
      customers,
      leads,
      preparedBy,
    };
  }

  static async create(quotationData) {
    const { customer, lead } = quotationData;
    if (!customer && !lead) {
      throw {
        status: false,
        message: "No lead or customer is associated with this quotation",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }
    if (customer && lead) {
      throw {
        status: false,
        message: "Both customer and lead ain't allowed",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (customer) delete quotationData.lead;
    if (lead) delete quotationData.customer;

    const set = new Set();
    quotationData.products.forEach((ele) => {
      set.add(ele.product);
    });

    if (set.size !== quotationData.products.length) {
      throw {
        status: false,
        message: "Duplicate entries for products are not allowed",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (lead) {
      const existingQuotation = await this.Model.findOne({ lead });

      if (existingQuotation && existingQuotation.status === "Approved") {
        throw {
          status: false,
          message:
            "A ledger entry has been created for this lead already, please create quotation using that",
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }

      if (existingQuotation && existingQuotation.status === "Pending") {
        throw {
          status: false,
          message: "Another pending quotation for this lead already exists",
          httpStatus: httpStatus.CONFLICT,
        };
      }

      const existingLead = await LeadService.getDocById(lead);
      const existingLedger = await LedgerService.getDoc(
        { email: existingLead.email },
        true,
      );
      if (existingLedger) {
        throw {
          status: false,
          message:
            "A customer with this email already exists. Please select that customer",
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }
    }
    const quotation = await this.Model.create(quotationData);
    await ActivityLogService.create({
      quotation: quotation.id,
      action: "QUOTATION_CREATED",
      description: `A new quotation with id ${quotation.id} is created`,
    });
    return quotation;
  }

  static async update(id, updates) {
    const status = updates.status;

    const quotation = await this.Model.findDocById(id);

    if (status && status !== quotation.status) {
      throw {
        status: false,
        message: "Updating status via this route ain't allowed",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (quotation.paid) {
      throw {
        status: false,
        message: "Cannot update a completed sale",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (quotation.status !== "Pending") {
      switch (quotation.status) {
        case "Approved":
          throw {
            status: false,
            message:
              "Cannot update approved quotation, please set it to pending",
            httpStatus: httpStatus.BAD_REQUEST,
          };
        case "Cancelled":
          throw {
            status: false,
            message: "Cannot update a cancelled quotation",
            httpStatus: httpStatus.BAD_REQUEST,
          };
      }
    }
    quotation.update(updates);
    quotation.invoiceId = null;
    await quotation.save();
    await ActivityLogService.create({
      quotationId: id,
      action: "QUOTATION_UPDATED",
      description: `Quotation updated for the customer ${quotation.customer}`,
    });

    return quotation;
  }

  static async changeQuotationStatus(id, quotationData) {
    const quotation = await this.Model.findDocById(id);
    const { status: existingStatus } = quotation;
    const { status } = quotationData;

    if (status === existingStatus) {
      return;
    }

    if (quotation.paid) {
      throw {
        status: false,
        message: "Cannot update a completed sale",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (quotation.invoiceId) {
      throw {
        status: false,
        message: "Cannot update a quotation with active billing",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (quotation.packingId) {
      throw {
        status: false,
        message: "Quotation already has an active packing",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    switch (existingStatus) {
      case "Cancelled":
        throw {
          status: false,
          message: "Unable to update a cancelled quotation",
          httpStatus: httpStatus.BAD_REQUEST,
        };
      case "Approved":
        const existingPacking = await PackingService.getWithAggregate([
          {
            $match: {
              quotationId: id,
            },
          },
        ]);
        if (existingPacking.length) {
          throw {
            status: false,
            message: "Please delete the existing packing for this quotation",
            httpStatus: httpStatus.BAD_REQUEST,
          };
        }
    }

    if (status === "Cancelled") {
      quotation.status = "Cancelled";
      await quotation.save();
      return true;
    }

    if (status === "Approved" && quotation.lead && !quotation.customer) {
      const lead = await LeadService.get(quotation.lead);
      const existingCustomer = await LedgerService.getDoc(
        {
          email: lead.email,
        },
        true,
      );

      if (existingCustomer) {
        quotation.customer = existingCustomer._id;
      } else {
        const customer = await LedgerService.create({
          companyName: lead.companyName ?? lead.firstName + lead.lastName ?? "",
          contactPerson: lead.firstName,
          ledgerType: "Customer",
          address1: lead.address,
          mobileNo: lead.phone,
          email: lead.email,
        });

        const customerId = customer.id;
        quotation.customer = customerId;
      }
    }

    quotation.status = status;

    if (status === "Approved") {
      quotation.latestData = quotation.products;
      quotation.lastData = quotation.latestData;
    }

    await quotation.save();
    await ActivityLogService.create({
      quotationId: id,
      action:
        quotation.status === "Approved"
          ? "QUOTATION_APPROVED"
          : "QUOTATION_UPDATED",
      description: `Quotation approved for the customer ${quotation.customer}`,
    });
    return quotation;
  }
}

export default QuotationService;
