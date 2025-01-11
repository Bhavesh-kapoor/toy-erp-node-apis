import env from "#configs/env";
import User from "#models/user";
import Service from "#services/base";
import { createToken } from "#utils/jwt";
import httpStatus from "#utils/httpStatus";
import { session } from "#middlewares/session";
import {
  generateQRCode,
  verifyOTP,
  generateToken,
  generateSecret,
} from "#utils/twoFactorAuth";

class UserService extends Service {
  static Model = User;

  static async get(id, filter) {
    if (id) {
      let user = await this.Model.findDocById(id);
      console.log(user);
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
    const { email, password, otp } = userData;

    let existingUser = await this.Model.findDoc({ email });

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

    await existingUser.populate({
      path: "role",
      select: "name permissions",
    });

    const selectedFields = [
      "name",
      "dob",
      "mobile",
      "email",
      "role",
      "profilePic",
      "mobileNo",
    ];

    const token = createToken(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_TOKEN_AGE,
    });

    const user = {};
    selectedFields.forEach((key) => {
      user[key] = existingUser[key];
    });

    user.permissions = user.role.permissions;
    user.role = user.role.name;
    return { token, userData: user };
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

    delete userData.password;
    delete userData.address;
    delete userData.isTwoFactorEnabled;
    user.update(userData);
    await user.save();
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

export default UserService;
