import httpStatus from "#utils/httpStatus";
import Currency from "#models/currency";
import Service from "#services/base";

class CurrencyService extends Service {
  static Model = Currency;
}

export default CurrencyService;
