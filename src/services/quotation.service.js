import Quotation from "#models/quotation";
import Service from "#services/base";

class QuotationService extends Service {
  static Model = Quotation;

  static create = async function (quotationData) {
    const quotation = await this.Model.create(quotationData);
    await ActivityService.create({
      quotation: quotation.id,
      action: "QUOTATION_CREATED",
      description: `A new quotation with id ${quotation.id} is created`,
    });
    return quotation;
  };
}

export default QuotationService;
