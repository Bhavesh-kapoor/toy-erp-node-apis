import Party from "#models/party";
import _ from "lodash";

export const getParty = async (id, filter = {}) => {
  if (!id) {
    const partyData = await Party.findAll(filter);
    return partyData;
  }
  const partyData = await Party.findById(id);
  return partyData;
};

export const createParty = async (partyData) => {
  const party = await Party.create(partyData);
  return party;
};

export const updateParty = async (id, updates) => {
  const party = await Party.findById(id);

  Object.assign(party, updates);
  await party.save();
  return party;
};

export const deleteParty = async (id) => {
  const existingParty = await Party.findByIdAndDelete(id);
  return true;
};
