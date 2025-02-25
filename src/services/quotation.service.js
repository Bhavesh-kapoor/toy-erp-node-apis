import mongoose from "mongoose";
import Service from "#services/base";
import LeadService from "#services/lead";
import UserService from "#services/user";
import Quotation from "#models/quotation";
import httpStatus from "#utils/httpStatus";
import LedgerService from "#services/ledger";
import PackingService from "#services/packing";
import { session } from "#middlewares/session";
import { sendEmail } from "#configs/nodeMailer";
import ActivityLogService from "#services/activitylog";

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
      {
        $lookup: {
          from: "packings",
          localField: "packingId",
          foreignField: "_id",
          as: "packingData",
        },
      },
      {
        $lookup: {
          from: "invoices",
          localField: "invoiceId",
          foreignField: "_id",
          as: "invoiceData",
        },
      },
    ];

    const extraStage = [
      {
        $project: {
          preparedByName: { $arrayElemAt: ["$preparedByData.name", 0] },
          preparedByEmail: { $arrayElemAt: ["$preparedByData.email", 0] },
          customerName: { $arrayElemAt: ["$customerData.companyName", 0] },
          packed: {
            $cond: {
              if: {
                $eq: [
                  { $type: { $arrayElemAt: ["$packingData.packed", 0] } },
                  "bool",
                ],
              },
              then: { $arrayElemAt: ["$packingData.packed", 0] },
              else: "Not created",
            },
          },
          leadName: {
            $concat: [
              { $arrayElemAt: ["$leadData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$leadData.lastName", 0] },
            ],
          },
          quotationNo: 1,
          netAmount: 1,
          billNumber: { $arrayElemAt: ["$invoiceData.billNumber", 0] },
          invoiceGenerated: {
            $cond: {
              if: { $eq: [{ $type: "$invoiceId" }, "objectId"] }, // Correct way to check ObjectId type
              then: true,
              else: false,
            },
          },
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
          as: "productDetails",
        },
      },
      {
        $addFields: {
          products: {
            $cond: {
              if: { $isArray: "$products" },
              then: {
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
                              {
                                $map: {
                                  input: "$productDetails",
                                  as: "pd",
                                  in: { $toString: "$$pd._id" },
                                },
                              },
                              { $toString: "$$product.product" },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                },
              },
              else: [],
            },
          },
        },
      },
      {
        $project: {
          productDetails: 0,
          preparedByData: 0,
          customerData: 0,
          leadData: 0,
          packingData: 0,
          invoiceData: 0,
        },
      },
    ]);

    const quotation = quotationData[0];
    const { products } = quotation;
    const taxSummary = {};

    products.forEach((ele, index) => {
      const obj = taxSummary[ele["category"]];
      if (obj) {
        (obj.taxableAmount += ele.taxableAmount),
          (obj.quantity += ele.quantity),
          (obj.taxAmount += ele.gstAmount),
          (obj.totalAmount += ele.totalAmount);
      } else {
        taxSummary[ele["category"]] = {
          taxableAmount: ele.taxableAmount,
          quantity: ele.quantity,
          gst: ele.gst,
          taxAmount: ele.gstAmount,
          totalAmount: ele.totalAmount,
          hsn: ele.hsn,
        };
      }
    });
    quotation.taxSummary = taxSummary;
    return quotation;
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

  static async sendQuotation(id, data) {
    const quotation = await this.Model.findDocById(id);
    const pdf = session.get("files");

    console.log(pdf);

    // Email options
    const mailOptions = {
      from: '"Volvrit" <deepak.singh@volvrit.com>', // Sender's email
      to: userData.email, // Receiver's email
      subject: "Test Email with Nodemailer", // Email subject
      text: "Hello, this is a test email sent using Nodemailer!", // Plain text body
      attachments: [
        {
          filename: req.file.originalname, // Keep original filename
          content: req.file.buffer, // File buffer
        },
      ],
    };
    //await sendEmail(mailOptions);
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
