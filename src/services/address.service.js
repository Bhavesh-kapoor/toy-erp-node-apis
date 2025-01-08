import Address from "#models/address";
import Service from "#services/base";

class AddressService extends Service {
  static Model = Address;
}

export default AddressService;
