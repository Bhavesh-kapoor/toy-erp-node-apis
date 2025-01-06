import Quotation from "#models/quotation";
import Service from "#services/base";

class QuotationService extends Service {
  static Model = Quotation;
}

export default QuotationService;
