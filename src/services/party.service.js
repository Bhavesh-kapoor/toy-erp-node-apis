import httpStatus from "#utils/httpStatus";
import Party from "#models/party";

export const getParty = async (id, filter = {}) => {
  if (!id) {
    const partyData = await Party.find(filter);
    return partyData;
  }
  const partyData = await Party.findById(id).populate("parentCategory");
  return partyData;
};

export const createParty = async (partyData) => {
  const party = await Party.create(partyData);
  return party;
};

export const updateParty = async (id, updates) => {
  const party = await Party.findById(id);
  for (const key in updates) {
    party[key] = updates[key];
  }

  await party.save();
  return party;
};

export const deleteParty = async (id) => {
  const existingParty = await Party.findByIdAndDelete(id);
  return true;
};
