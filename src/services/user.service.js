import env from "#configs/env";
import User from "#models/user";
import Service from "#services/base";
import Address from "#models/address";
import { createToken } from "#utils/jwt";
import httpStatus from "#utils/httpStatus";
import uploadFiles from "#utils/uploadFile";
import { session } from "#middlewares/session";
import AddressService from "#services/address";
import {
  generateQRCode,
  verifyOTP,
  generateToken,
  generateSecret,
} from "#utils/twoFactorAuth";

// TODO: Implement with both creation and update
const allowedFileUploads = new Set([
  "profilePic",
  "aadhaarCardDoc",
  "panCardDoc",
  "otherDocument",
]);

class UserService extends Service {
  static Model = User;

  static async get(id, filter) {
    if (id) {
      let user = await this.Model.findDocById(id);
      user.role = user.role.id;
      user = user.toJSON();
      user = { ...user, ...user?.address, _id: id };
      delete user.address;
      delete user.department;
      return user;
    }
    const initialStage = [
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "role",
        },
      },
    ];
    //id,name,email,mobileNo,role,createdAt,status
    const extraStage = [
      {
        $project: {
          name: 1,
          email: 1,
          mobileNo: 1,
          createdAt: 1,
          status: 1,
          role: { $arrayElemAt: ["$role.name", 0] },
        },
      },
    ];
    return this.Model.findAll(filter, initialStage, extraStage);
  }

  static async getUserByRole(role = "Employee") {
    const salesPersonData = await this.Model.aggregate([
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "role",
        },
      },
      {
        $unwind: "$role",
      },
      {
        $match: {
          "role.name": role,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
        },
      },
    ]);
    return salesPersonData;
  }

  static async loginUser(userData) {
    // id,name,dob,mobile,email,role,profilePic
    const { email, password, otp } = userData;

    let existingUser = await this.Model.findOne({ email })
      .populate("role", "name permissions")
      .select(
        "name dob mobile email role profilePic password mobileNo secret isTwoFactorEnabled",
      );

    if (!(await existingUser.isPasswordCorrect(password))) {
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
    existingUser = existingUser.toJSON();
    existingUser.permissions = existingUser.role.permissions;
    existingUser.role = existingUser.role.name;
    delete existingUser.password;
    delete existingUser.secret;
    delete existingUser.isTwoFactorEnabled;
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

    userData.isTwoFactorEnabled = false;
    const { address } = userData;
    delete userData.address;

    const user = new User();
    userData.id = user.id;
    address.recipient = user.id;
    address.belongsTo = "User";

    user.update(userData);

    //TODO: implement aws s3
    //const filePaths = await uploadFiles(
    //  files,
    //  `users/${user.id}`,
    //  allowedFileUploads,
    //);

    // TODO: send password via email
    const password = generateSecret(10);
    user.password = password;

    //for (let i in filePaths) {
    //  user[i] = filePaths[i];
    //}

    await user.save();
    return user;
  }

  static async update(id, userData) {
    const user = await User.findDocById(id);

    // TODO: Handle file updates here

    let { address: existingAddress } = userData;
    const address = await AddressService.getSafe(user.address);

    address.update(existingAddress);
    await address.save();

    delete userData.password;
    delete userData.address;
    delete userData.isTwoFactorEnabled;
    user.update(userData);
    await user.save();
    user.address = address;
    return user;
  }

  static async forgotPasswordRequest(userData) {
    const { email } = userData;
    const user = await User.findDoc({ email });
    const { otp, secret } = generateToken(user.secret);
    user.forgotPassSecret = secret;
    await user.save();
    //TODO: Send email to the end user;
    return otp;
  }

  static async verifyOTP(otpData) {
    const { email, otp } = otpData;
    const user = await User.findDoc({ email });
    const { forgotPassSecret, id } = user;
    if (!forgotPassSecret || !verifyOTP(forgotPassSecret, otp, 10)) {
      throw {
        status: false,
        message:
          "Invalid otp, please provide a valid otp or make a new request",
        httpStatus: httpStatus.UNAUTHORIZED,
      };
    }
    const payload = { id, email };
    const token = createToken(payload, env.JWT_SECRET, {
      expiresIn: "180s",
    });

    user.forgotPassSecret = null;

    await user.save();
    return { token };
  }

  static async changePassword(userData) {
    const { password } = userData;
    const payload = session.get("payload");
    const user = await User.findDocById(payload.id);
    user.password = password;
    await user.save();
  }

  static async deleteData(id) {
    const user = await User.findDocById(id);
    //const addresses = user.addresses.map((id) => Address.findDocById(id));
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
    for (let i in existingAddresses) {
      let add = existingAddresses[i];
      if (add === null) {
        throw {
          status: false,
          message: `address with id ${addresses[i]} doesn't exist`,
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }
    }
  } catch (err) {
    throw {
      status: false,
      message: err.message,
      httpStatus: err.httpStatus,
    };
  }
}

export default UserService;
