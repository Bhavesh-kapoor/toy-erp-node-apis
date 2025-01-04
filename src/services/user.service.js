import env from "#configs/env";
import User from "#models/user";
import Service from "#services/base";
import { createToken } from "#utils/jwt";
import httpStatus from "#utils/httpStatus";
import uploadFiles from "#utils/uploadFile";
import { session } from "#middlewares/session";
import { generateQRCode, verifyOTP } from "#utils/twoFactorAuth";

// TODO: Implement with both creation and update
const allowedFileUploads = [
  "profilePic",
  "aadhaarCard",
  "panCard",
  "otherDocument",
];

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

    const user = new User(userData);
    const filePaths = await uploadFiles(files, `users/${user.id}`);
    for (let i in filePaths) {
      user[i] = filePaths[i];
    }
    await user.save();
    return user;
  }
}

export default UserService;
