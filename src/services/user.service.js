import env from "#configs/env";
import User from "#models/user";
import Service from "#services/base";
import Address from "#models/address";
import { createToken } from "#utils/jwt";
import httpStatus from "#utils/httpStatus";
import uploadFiles from "#utils/uploadFile";
import { session } from "#middlewares/session";
import { generateQRCode, verifyOTP } from "#utils/twoFactorAuth";

// TODO: Implement with both creation and update
const allowedFileUploads = new Set([
  "profilePic",
  "aadhaarCard",
  "panCard",
  "otherDocument",
]);

class UserService extends Service {
  static Model = User;

  static async loginUser(userData) {
    const { email, password, otp } = userData;
    const existingUser = await this.Model.findDocByFilters({ email });

    if (!existingUser.isPasswordCorrect(password)) {
      throw {
        status: false,
        message: "Incorrect Password",
        httpStatus: httpStatus.UNAUTHORIZED,
      };
    }
    if (existingUser.isTwoFactorEnabled && !otp) {
      throw {
        status: false,
        message: "Please enter the otp",
        otpRequired: true,
        httpStatus: httpStatus.UNAUTHORIZED,
      };
    }
    if (
      existingUser.isTwoFactorEnabled &&
      !verifyOTP(existingUser.secret, otp)
    ) {
      throw {
        status: false,
        message: "Invalid Otp",
        httpStatus: httpStatus.UNAUTHORIZED,
      };
    }
    const payload = {
      id: existingUser.id,
      email,
    };

    const token = createToken(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_TOKEN_AGE,
    });
    return { token, userData: existingUser };
  }

  static async enable2FA(id) {
    const existingUser = await this.Model.findDocById(id);

    const { secret, qrCode } = await generateQRCode({
      label: existingUser.email,
      issuer: "Toy Project",
    });

    existingUser.secret = secret;
    existingUser.isTwoFactorEnabled = true;
    await existingUser.save();
    return { secret, qrCode };
  }

  static async disable2FA(id) {
    const existingUser = await this.Model.findDocById(id);
    existingUser.secret = null;
    existingUser.isTwoFactorEnabled = false;
    await existingUser.save();
    return true;
  }
  static async create(userData) {
    const files = session.get("files");

    const { isTwoFactorEnabled } = userData;
    isTwoFactorEnabled === "true"
      ? (userData.isTwoFactorEnabled = true)
      : (userData.isTwoFactorEnabled = false);

    const user = new User();
    userData.id = user.id;
    await addressManager(userData);
    user.update(userData);
    const filePaths = await uploadFiles(
      files,
      `users/${user.id}`,
      allowedFileUploads,
    );

    for (let i in filePaths) {
      user[i] = filePaths[i];
    }
    await user.save();
    return user;
  }

  static async update(id, userData) {
    const files = session.get("files");
    const user = await User.findDocById(id);
    delete userData.isTwoFactorEnabled;
    delete userData.password;
    userData.id = id;
    await addressManager(userData);

    // TODO: Handle file updates here

    user.update(userData);
    await user.save();
    return user;
  }

  static async deleteData(id) {
    const user = await User.findDocById(id);
    const addresses = user.addresses.map((id) => Address.findDocById(id));
  }
}

export async function addressManager(updates) {
  try {
    const { addresses, id } = updates;

    let existingAddresses = [];
    let selected = 0;

    for (let i in addresses) {
      const address = addresses[i];
      address.isActive === true || address.isActive === "true"
        ? (selected += 1)
        : null;
      if (address.id || address._id) {
        address.recipient = id;
        addresses[i] = address.id || address._id;
        existingAddresses.push(
          Address.findByIdAndUpdate(addresses[i], address, {
            runValidators: true,
            new: true,
          }),
        );
        continue;
      }
      const newAddress = new Address(address);
      newAddress.recipient = id;
      newAddress.save();
      existingAddresses.push(newAddress);
      addresses[i] = newAddress.id;
    }

    if (selected !== 1) {
      throw {
        status: false,
        message: "Only one primary address is allowed",
        httpStatus: httpStatus.CONFLICT,
      };
    }

    existingAddresses = await Promise.all(existingAddresses);
  } catch (err) {
    throw {
      status: false,
      message: err.message,
      httpStatus: err.httpStatus,
    };
  }
}

export default UserService;
