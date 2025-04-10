import mongoose from "mongoose";
import Service from "#services/base";
import Invoice from "#models/invoice";
import UserService from "#services/user";
import httpStatus from "#utils/httpStatus";
import LedgerService from "#services/ledger";
import PackingService from "#services/packing";
import PaymentService from "#services/payment";
import ReceivingService from "#services/receiving";
import QuotationService from "#services/quotation";

class InvoiceService extends Service {
  static Model = Invoice;

  static async get(id, filter) {
    const initialStage = [
      {
        $lookup: {
          from: "ledgers",
          localField: "invoiceTo",
          foreignField: "_id",
          as: "invoiceToDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "preparedBy",
          foreignField: "_id",
          as: "preparedByDetails",
        },
      },
      {
        $lookup: {
          from: "quotations",
          localField: "quotationId",
          foreignField: "_id",
          as: "quotationDetails",
        },
      },
    ];

    const extraStage = [
      {
        $project: {
          _id: 1,
          billNumber: 1,
          billDate: 1,
          invoiceTo: 1,
          referenceNo: 1,
          shipTo: 1,
          invoiceTo: { $arrayElemAt: ["$invoiceToDetails.companyName", 0] },
          preparedBy: { $arrayElemAt: ["$preparedByDetails.name", 0] },
          quotationNo: { $arrayElemAt: ["$quotationDetails.quotationNo", 0] },
          netAmount: { $arrayElemAt: ["$quotationDetails.netAmount", 0] },
        },
      },
    ];

    if (!id) {
      const invoiceData = this.Model.findAll(filter, initialStage, extraStage);
      return invoiceData;
    }

    //const invoiceData = await this.Model.aggregate([
    //  { $match: { _id: new mongoose.Types.ObjectId(id) } },
    //  ...initialStage,
    //  {
    //    $project: {
    //      _id: 1,
    //      billNumber: 1,
    //      billDate: 1,
    //      invoiceTo: 1,
    //      referenceNo: 1,
    //      shipTo: 1,
    //      preparedBy: 1,
    //      quotationNo: { $arrayElemAt: ["$quotationDetails.quotationNo", 0] },
    //      quotationId: 1,
    //      netAmount: { $arrayElemAt: ["$quotationDetails.netAmount", 0] },
    //      remarks: 1,
    //      vehicleDetails: 1,
    //      driverName: 1,
    //      driverPhone: 1,
    //      dispatchMode: 1,
    //      placeOfSupply: 1,
    //      transportThrough: 1,
    //      grOrLrNumber: 1,
    //    },
    //  },
    //]);
    //
    //if (!invoiceData.length) {
    //  throw {
    //    status: false,
    //    message: "Invoice not found",
    //    httpStatus: httpStatus.NOT_FOUND,
    //  };
    //}
    //

    const invoice = await this.Model.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "packings",
          localField: "packingId",
          foreignField: "_id",
          as: "packing",
        },
      },
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
            { $unwind: { path: "$uom", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
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
          packingNo: { $arrayElemAt: ["$packing.packingNo", 0] },
          packing: { $arrayElemAt: ["$packing", 0] },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "packing.products.product",
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
            { $unwind: { path: "$uom", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
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
    ]);

    if (!invoice.length) {
      throw {
        status: false,
        message: "Invoice doesn't exist",
        httpStatus: httpStatus.NOT_FOUND,
      };
    }

    const output = invoice[0];

    const { packing, productDetails } = output;

    for (let i of packing.products) {
      for (let j of productDetails) {
        if (j._id.toString() === i.product.toString()) {
          i.name = j.name;
          i.productCode = j.productCode;
          i.uom = j.uom;
          break;
        }
      }
    }
    delete output.productDetails;
    return output;

    //const invoice = invoiceData[0];
    //const quotation = await QuotationService.get(invoice.quotationId);
    //
    //invoice.quotation = quotation;
    //
    //return invoice;
  }

  static async getBaseFields() {
    const userData = UserService.getUserByRole("Accountant");
    const ledgerData = LedgerService.getWithAggregate([
      {
        $match: {
          ledgerType: {
            $in: ["Customer", "Both"],
          },
        },
      },
      {
        $project: {
          name: "$companyName",
        },
      },
    ]);
    const packingData = PackingService.getWithAggregate([
      {
        $match: {
          packed: true,
          invoiceId: null,
        },
      },
      {
        $project: {
          name: "$packingNo",
        },
      },
    ]);

    const [users, packings, ledgers] = await Promise.all([
      userData,
      packingData,
      ledgerData,
    ]);
    return {
      users,
      packings,
      ledgers,
    };
  }

  static async create(invoiceData) {
    const { packingId } = invoiceData;
    const packing = await PackingService.getDocById(packingId);
    const { quotationId } = packing;
    const quotation = await QuotationService.getDocById(quotationId);
    if (packing.invoiceId) {
      throw {
        status: false,
        message: "Another bill for this packing already exists",
        httpStatus: httpStatus.CONFLICT,
      };
    }

    if (!packing.packed) {
      throw {
        status: false,
        message: `Cannot create invoice for unpacked packing`,
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    invoiceData.invoiceTo = quotation.customer;
    invoiceData.quotationId = quotationId;

    const invoice = await this.Model.create(invoiceData);
    packing.invoiceId = invoice._id;
    await packing.save();
    return invoice;
  }

  static async update(id) {
    throw {
      status: false,
      message: "Updating an invoice is not allowed",
      httpStatus: httpStatus.BAD_REQUEST,
    };
  }

  static async deleteDoc(id) {
    const invoice = await this.Model.findDocById(id);

    const receivings = await ReceivingService.getWithAggregate([
      {
        $match: {
          invoiceId: new mongoose.Types.ObjectId(id),
        },
      },
    ]);

    if (receivings.length) {
      throw {
        status: false,
        message: "Please delete the receivings related to this invoice",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    //TODO: Purchase Return will be added here;
    const packing = await PackingService.getDocById(invoice.packingId);
    packing.invoiceId = null;
    await packing.save();
    await invoice.deleteOne();
  }
}

export default InvoiceService;
