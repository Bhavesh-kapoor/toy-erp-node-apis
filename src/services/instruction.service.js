import httpStatus from "#utils/httpStatus";
import Instruction from "#models/instruction";
import Service from "#services/base";

class InstructionService extends Service {
  static Model = Instruction;
}

export default InstructionService;
