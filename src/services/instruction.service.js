import httpStatus from "#utils/httpStatus";
import Instruction from "#models/instruction";

export const getInstruction = async (id, filter = {}) => {
  if (!id) {
    const instructionData = await Instruction.find(filter);
    return instructionData;
  }
  const instructionData = await Instruction.findById(id);
  return instructionData;
};

export const createInstruction = async (instructionData) => {
  const instruction = await Instruction.create(instructionData);
  return instruction;
};

export const updateInstruction = async (id, updates) => {
  const instruction = await Instruction.findById(id);
  for (const key in updates) {
    instruction[key] = updates[key];
  }

  await instruction.save();
  return instruction;
};

export const deleteInstruction = async (id) => {
  const existingInstruction = await Instruction.findByIdAndDelete(id);
  return true;
};
