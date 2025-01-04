import mongoose, { Schema } from "mongoose";

// TODO Proper data insertion and filterable check
class BaseSchema extends Schema {
  constructor(schemaDefinition, options) {
    super(schemaDefinition, options);

    this.statics.create = async function (documentData) {
      const modelKeys = this.schema.tree;
      const idChecks = [];
      for (let i in modelKeys) {
        console.log(modelKeys);
      }
      const createdDoc = new this(documentData);
      await createdDoc.save();
      return createdDoc;
    };

    this.statics.findAll = async function (filters) {
      const {
        endDate,
        page = 1,
        startDate,
        searchkey,
        limit = 10,
        search = "",
        sortdir = "desc",
        sortkey = "createdAt",
      } = filters;

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);

      const matchStage = {};
      const pipeline = [{ $match: matchStage }];

      // Apply search filter
      if (search && searchkey) {
        matchStage[searchkey] = { $regex: search, $options: "i" };
      }
      delete filters.search;
      delete filters.searchkey;

      // Apply date filters
      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
        delete filters.startDate;
        delete filters.endDate;
      }

      // Add sorting
      pipeline.push({
        $sort: { [sortkey]: sortdir === "asc" ? 1 : -1 },
      });
      delete filters.sortkey;
      delete filters.sortdir;

      // Add pagination
      pipeline.push({ $skip: (pageNumber - 1) * limitNumber });
      pipeline.push({ $limit: limitNumber });
      delete filters.page;
      delete filters.limit;

      // Add filters if any
      for (let filter in filters) {
        [(matchStage[filter] = filters[filter])];
        delete filters[filter];
      }

      // Count total documents for pagination metadata
      const countPipeline = [...pipeline];
      countPipeline.splice(-2); // Remove $skip and $limit stages

      countPipeline.push({
        $count: "totalCount",
      });

      // Execute the aggregation pipelines
      const [logs, countResult] = await Promise.all([
        this.aggregate(pipeline).collation({
          locale: "en",
          strength: 2, // Case-insensitive collation
        }),
        this.aggregate(countPipeline),
      ]);

      const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;
      const totalPages = Math.ceil(totalCount / limitNumber);

      return {
        data: logs,
        meta: {
          totalCount,
          totalPages,
          limit: limitNumber,
          currentPage: pageNumber,
        },
      };
    };
  }
}

export default BaseSchema;
