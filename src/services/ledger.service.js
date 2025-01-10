import _ from "lodash";
import Ledger from "#models/ledger";
import Service from "#services/base";

class LedgerService extends Service {
  static Model = Ledger;
}

export default LedgerService;
