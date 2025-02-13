import mongoose, { Schema } from "mongoose";
import httpStatus from "#utils/httpStatus";

class BaseSchema extends Schema {
  constructor(schemaDefinition, options = {}) {
    super(schemaDefinition, {
      timestamps: true,
      versionKey: false,
      ...options,
    });

    // TODO: Implement check for refPath
    this.pre("save", async function (next) {
      const modelKeys = this.constructor.schema.tree;
      const idChecks = [];
      for (let key in modelKeys) {
        if (!modelKeys[key].ref) continue;
        const model =
          typeof modelKeys[key].ref !== "string"
            ? modelKeys[key].ref
            : mongoose.model(modelKeys[key].ref);

        if (modelKeys[key].required === true) {
          const check = model.findDocById(this[key], false, { name: key });
          idChecks.push(check);
        } else if (this[key]) {
          const check = model.findDocById(this[key], false, { name: key });
          idChecks.push(check);
        }
      }
      await Promise.all(idChecks);
      next();
    });

    //TODO: add a common file uploader for all operations
    //this.post("save", async function (doc, next) {
    //  const files = session.get("files");
    //  next();
    //});

    this.statics.findDoc = async function (filters = {}, allowNull = false) {
      const doc = await this.findOne(filters);

      if (!doc && !allowNull) {
        throw {
          status: false,
          message: `${this.modelName} doesn't exist`,
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }

      return doc;
    };

    this.statics.findDocById = async function (id, allowNull, options = {}) {
      //const fields = Object.keys(this.schema.tree);
      //const populateFieldsArr = fields
      //  .filter((field) => this.schema.tree[field].ref)
      //  .map((field) => ({
      //    path: field,
      //    model: this.schema.tree[field].ref,
      //  }));
      //
      const doc = await this.findById(id); /**.populate(populateFieldsArr);***/

      if (!doc && !allowNull) {
        throw {
          status: false,
          message: `${options?.name ?? this.modelName} with id ${id} doesn't exist`,
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }
      return doc;
    };

    this.statics.findAll = async function (
      filters = {},
      initialStage = [],
      extraStages = [],
    ) {
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
      const pipeline = [];

      if (initialStage?.length) pipeline.push(...initialStage);

      pipeline.push({ $match: matchStage });

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
        const modelKeys = this.schema.paths;
        matchStage[filter] = filters[filter];
        if (modelKeys?.[filter]?.instance === "ObjectId") {
          matchStage[filter] = new mongoose.Types.ObjectId(filters[filter]);
        } else if (modelKeys?.[filter]?.instance === "String") {
          matchStage[filter] = filters[filter].toString();
        }
        delete filters[filter];
      }

      extraStages?.length ? pipeline.push(...extraStages) : null;

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
        this.aggregate(countPipeline).collation({
          locale: "en",
          strength: 2, // Case-insensitive collation
        }),
      ]);
      const totalItems = countResult.length > 0 ? countResult[0].totalCount : 0;
      const totalPages = Math.ceil(totalItems / limitNumber);

      return {
        result: logs,
        pagination: {
          totalItems,
          totalPages,
          itemsPerPage: limitNumber,
          currentPage: pageNumber,
        },
      };
    };

    this.methods.update = function (updates) {
      delete updates.updatedAt;
      for (let i in updates) {
        this[i] = updates[i];
      }
    };
  }
}

export default BaseSchema;
