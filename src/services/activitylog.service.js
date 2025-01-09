import Service from "#services/base";
import ActivityLog from "#models/activityLog";

class ActivityLogService extends Service {
  static Model = ActivityLog;

  static async fetchUniqueActions(leadId) {
    const actions = await ActivityLog.find({ leadId }).distinct("action");
    return actions;
  }
}

export default ActivityLogService;
