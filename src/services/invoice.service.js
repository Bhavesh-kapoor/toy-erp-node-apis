import Service from "#services/base";
import Invoice from "#models/invoice";

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
      const leadData = this.Model.findAll(filter, initialStage, extraStage);
      return leadData;
    }
    console.log(id);
    const leadData = await this.Model.aggregate([
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
    return leadData;
  }
}

export default InvoiceService;
