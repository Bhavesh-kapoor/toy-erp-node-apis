import Service from "#services/base";
import Invoice from "#models/invoice";
import mongoose from "mongoose";
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
        $unwind: {
          path: "$invoiceToDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "ledgers",
          localField: "shipTo",
          foreignField: "_id",
          as: "shipToDetails",
        },
      },
      {
        $unwind: {
          path: "$shipToDetails",
          preserveNullAndEmptyArrays: true,
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
        $unwind: {
          path: "$preparedByDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "quotations",
          localField: "quotation",
          foreignField: "_id",
          as: "quotationDetails",
        },
      },
      {
        $unwind: {
          path: "$quotationDetails",
          preserveNullAndEmptyArrays: true,
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
          invoiceTo: "$invoiceToDetails.companyName",
          shipTo: "$shipToDetails.companyName",
          preparedBy: "$preparedByDetails.name",
          quotationNo: "$quotationDetails.quotationNo",
        },
      },
    ];

    if (!id) {
      const invoiceData = this.Model.findAll(filter, initialStage, extraStage);
      return invoiceData;
    }
    const invoiceData = await this.Model.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      ...initialStage,
      {
        $lookup: {
          from: "products",
          localField: "quotationDetails.products.product",
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
              $lookup: {
                from: "productcategories",
                localField: "productCategory",
                foreignField: "_id",
                as: "productcategories",
              },
            },
            {
              $unwind: {
                path: "$productcategories",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                description: 1,
                productCode: 1,
                uom: "$uom.shortName",
                hsnCode: "$productcategories.hsnCode",
              },
            },
          ],
          as: "productDetails",
        },
      },
      {
        $addFields: {
          invoiceToName: "$invoiceToDetails.companyName",
          shipToName: "$shipToDetails.companyName",
          shipToAddress: "$shipToDetails.address1",
          preparedByName: "$preparedByDetails.name",
          preparedById: "$preparedByDetails._id",
          quotationNo: "$quotationDetails.quotationNo",
          quotationId: "$quotationDetails._id",
          products: {
            $map: {
              input: "$quotationDetails.products",
              as: "product",
              in: {
                $mergeObjects: [
                  "$$product",
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$productDetails",
                          as: "detail",
                          cond: { $eq: ["$$detail._id", "$$product.product"] },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          productDetails: 0,
          invoiceToDetails: 0,
          shipToDetails: 0,
          preparedByDetails: 0,
          quotationDetails: 0,
        },
      },
    ]);
    //FIX: solve this using aggregation
    return invoiceData[0];
  }
}

export default InvoiceService;
