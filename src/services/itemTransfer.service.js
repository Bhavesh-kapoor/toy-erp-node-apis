import Service from "#services/base";
import ItemTransfer from "#models/itemTransfer";
import mongoose from "mongoose";
class ItemTransferService extends Service {
  static Model = ItemTransfer;

  static async get(id, filter) {
    const initialStage = [];

    const extraStage = [
    //   {
    //     $project: {
    //       _id: 1,
    //       billNumber: 1,
    //       billDate: 1,
    //       itemTransferTo: 1,
    //       referenceNo: 1,
    //       shipTo: 1,
    //       itemTransferTo: "$itemTransferToDetails.companyName",
    //       shipTo: "$shipToDetails.companyName",
    //       preparedBy: "$preparedByDetails.name",
    //       quotationNo: "$quotationDetails.quotationNo",
    //     },
    //   },
    ];

    if (!id) {
      const itemTransferData = this.Model.findAll(
        filter,
        initialStage,
        extraStage
      );
      return itemTransferData;
    }
    const itemTransferData = await this.Model.aggregate([
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
          shipTo: 1,
          itemTransferToName: "$itemTransferToDetails.companyName",
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
          itemTransferToDetails: 0,
          shipToDetails: 0,
          preparedByDetails: 0,
          quotationDetails: 0,
        },
      },
    ]);
    //FIX: solve this using aggregation
    return itemTransferData[0];
  }
}

export default ItemTransferService;
