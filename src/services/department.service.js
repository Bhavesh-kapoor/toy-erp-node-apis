import Department from "#models/department";
import Service from "#services/base";

class DepartmentService extends Service {
  static Model = Department;
}

export default DepartmentService;
