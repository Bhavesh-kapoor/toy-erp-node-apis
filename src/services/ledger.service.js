import Ledger from "#models/ledger";
import _ from "lodash";

export const getLedger = async (id, filter = {}) => {
  if (!id) {
    const ledgerData = await Ledger.findAll(filter);
    return ledgerData;
  }
  const ledgerData = await Ledger.findById(id);
  return ledgerData;
};

export const createLedger = async (ledgerData) => {
  const ledger = await Ledger.create(ledgerData);
  return ledger;
};

export const updateLedger = async (id, updates) => {
  const ledger = await Ledger.findById(id);

  Object.assign(ledger, updates);
  await ledger.save();
  return ledger;
};

export const deleteLedger = async (id) => {
  const existingLedger = await Ledger.findByIdAndDelete(id);
  return true;
};
