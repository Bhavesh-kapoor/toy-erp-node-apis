import httpStatus from "#utils/httpStatus";
import Currency from "#models/currency";

export const getCurrency = async (id, filter = {}) => {
  if (!id) {
    const currencyData = await Currency.find(filter);
    return currencyData;
  }
  const currencyData = await Currency.findById(id).populate("parentCategory");
  return currencyData;
};

export const createCurrency = async (currencyData) => {
  const currency = await Currency.create(currencyData);
  return currency;
};

export const updateCurrency = async (id, updates) => {
  const currency = await Currency.findById(id);
  for (const key in updates) {
    currency[key] = updates[key];
  }

  await currency.save();
  return currency;
};

export const deleteCurrency = async (id) => {
  const existingCurrency = await Currency.findByIdAndDelete(id);
  return true;
};
