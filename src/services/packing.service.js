import Service from "#services/base";
import Packing from "#models/packing";
import mongoose from "mongoose";

class PackingService extends Service {
  static Model = Packing;

  static async get(id, filter) {
    const initialStage = [
      {
        $lookup: {
          localField: "customer",
          foreignField: "_id",
          from: "ledgers",
          as: "customerData",
        },
      },
      {
        $lookup: {
          localField: "quotationId",
          foreignField: "_id",
          from: "quotations",
          as: "quotationData",
        },
      },
      {
        $lookup: {
          localField: "packedBy",
          foreignField: "_id",
          from: "users",
          as: "packedByData",
        },
      },
    ];

    // FIX: Has to be fixed later
    const extraStage = [
      {
        $project: {
          packingNo: 1,
          quotationNo: { $arrayElemAt: ["$quotationData.quotationNo", 0] },
          customer: { $arrayElemAt: ["$customerData.companyName", 0] },
          netAmount: { $arrayElemAt: ["$quotationData.netAmount", 0] },
          packedBy: { $arrayElemAt: ["$packedByData.name", 0] },
          packingDate: 1,
          totalQuantity: 1,
          netPackedQuantity: 1,
        },
      },
    ];

    if (!id) {
      return this.Model.findAll(filter, initialStage, extraStage);
    }

    initialStage.push({
      $lookup: {
        from: "products", // Replace with the name of your products collection
        localField: "quotationData.products.product",
        foreignField: "_id",
        as: "productDetails",
        pipeline: [
          {
            $project: {
              productCode: 1,
            },
          },
        ],
      },
    });

    extraStage[0]["$project"]["products"] = {
      $map: {
        input: { $arrayElemAt: ["$quotationData.products", 0] },
        as: "product",
        in: {
          $mergeObjects: [
            "$$product",
            {
              productCode: {
                $let: {
                  vars: {
                    productDetail: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$productDetails",
                            as: "detail",
                            cond: {
                              $eq: ["$$detail._id", "$$product.product"],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: "$$productDetail.productCode",
                },
              },
            },
          ],
        },
      },
    };

    const data = await this.Model.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      ...initialStage,
      ...extraStage,
    ]);
    return data[0];
  }
}

export default PackingService;
