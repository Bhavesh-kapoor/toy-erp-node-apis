import { ActivityLog } from "../models/activitylog.model.js";

/**
 * Service for managing activity logs.
 */
class ActivityLogService {
  /**
   * Create a new activity log.
   * @param {Object} data - Data for the new activity log.
   * @param {string} data.leadId - ID of the lead associated with the activity.
   * @param {string} data.userId - ID of the user who performed the action.
   * @param {string} data.action - Action type (e.g., "STATUS_UPDATED").
   * @param {string} data.description - Description of the action.
   * @param {Object} [data.metadata] - Optional metadata related to the action.
   * @returns {Promise<Object>} - Response with status, message, and data.
   */
  static async createLog(data) {
    try {
      const newLog = new ActivityLog(data);
      const savedLog = await newLog.save();
      return {
        status: 201,
        message: "Activity log created successfully.",
        data: savedLog,
      };
    } catch (error) {
      return {
        status: 500,
        message: `Failed to create activity log: ${error.message}`,
      };
    }
  }

  /**
   * Fetch activity logs by lead ID with filters.
   * @param {string} leadId - Lead ID to filter logs.
   * @param {Object} query - Query parameters for filtering and pagination.
   * @returns {Promise<Object>} - Paginated list of activity logs with metadata.
   * @throws {Error} - If fetching fails.
   */
  static async fetchLogsByLeadId(leadId, query) {
    try {
      const {
        role,
        status,
        endDate,
        page = 1,
        startDate,
        searchkey,
        limit = 10,
        search = "",
        sortdir = "desc",
        sortkey = "createdAt",
      } = query;

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);

      const pipeline = [];
      const matchStage = { leadId }; // Always match the leadId

      // Apply role filter
      if (role) matchStage.role = role;

      // Apply search filter
      if (search && searchkey)
        matchStage[searchkey] = { $regex: search, $options: "i" };

      // Apply status filter
      if (status) matchStage.status = status;

      // Apply date filters
      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
      }

      // Add match stage if any filters are applied
      if (Object.keys(matchStage).length > 0)
        pipeline.push({ $match: matchStage });

      // Add sorting
      pipeline.push({
        $sort: { [sortkey]: sortdir === "asc" ? 1 : -1 },
      });

      // Add pagination
      pipeline.push({ $skip: (pageNumber - 1) * limitNumber });
      pipeline.push({ $limit: limitNumber });

      // Count total documents for pagination metadata
      const countPipeline = [...pipeline];
      countPipeline.pop(); // Remove $skip and $limit stages
      countPipeline.pop();

      countPipeline.push({
        $count: "totalCount",
      });

      // Execute the aggregation pipelines
      const [logs, countResult] = await Promise.all([
        ActivityLog.aggregate(pipeline).collation({
          locale: "en",
          strength: 2, // Case-insensitive collation
        }),
        ActivityLog.aggregate(countPipeline),
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
    } catch (error) {
      throw new Error(`Failed to fetch activity logs: ${error.message}`);
    }
  }

  /**
   * Update an activity log by ID.
   * @param {string} logId - ID of the log to update.
   * @param {Object} updates - Fields to update.
   * @returns {Promise<Object>} - Response with status, message, and data.
   */
  static async updateLog(logId, updates) {
    try {
      const updatedLog = await ActivityLog.findByIdAndUpdate(logId, updates, {
        new: true,
        runValidators: true,
      });
      if (!updatedLog) {
        return {
          status: 404,
          message: `Activity log with ID ${logId} not found.`,
        };
      }
      return {
        status: 200,
        message: "Activity log updated successfully.",
        data: updatedLog,
      };
    } catch (error) {
      return {
        status: 500,
        message: `Failed to update activity log: ${error.message}`,
      };
    }
  }

  /**
   * Delete an activity log by ID.
   * @param {string} logId - ID of the log to delete.
   * @returns {Promise<Object>} - Response with status, message, and data.
   */
  static async deleteLog(logId) {
    try {
      const deletedLog = await ActivityLog.findByIdAndDelete(logId);
      if (!deletedLog) {
        return {
          status: 404,
          message: `Activity log with ID ${logId} not found.`,
        };
      }
      return {
        status: 200,
        message: "Activity log deleted successfully.",
        data: deletedLog,
      };
    } catch (error) {
      return {
        status: 500,
        message: `Failed to delete activity log: ${error.message}`,
      };
    }
  }

  /**
   * Fetch all unique actions performed for a specific lead.
   * @param {string} leadId - Lead ID to filter logs.
   * @returns {Promise<Object>} - Response with status, message, and data.
   */
  static async fetchUniqueActions(leadId) {
    try {
      const actions = await ActivityLog.find({ leadId }).distinct("action");
      return {
        status: 200,
        message: "Unique actions fetched successfully.",
        data: actions,
      };
    } catch (error) {
      return {
        status: 500,
        message: `Failed to fetch unique actions: ${error.message}`,
      };
    }
  }
}

export default ActivityLogService;
