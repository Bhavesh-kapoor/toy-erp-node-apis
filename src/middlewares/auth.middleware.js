import User from "#models/user";
import { verifyToken } from "#utils/jwt";
import httpStatus from "#utils/httpStatus";
import { session } from "#middlewares/session";

export async function authentication(req, res, next) {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      throw {
        status: false,
        httpStatus: httpStatus.UNAUTHORIZED,
        message: "Invalid token please login again",
      };
    }

    const payload = verifyToken(token);
    let user = await User.findOne({ _id: payload.id })
      .populate("role", "name permissions")
      .select("name dob mobile email role profilePic password mobileNo");

    if (!user) {
      throw {
        status: false,
        httpStatus: httpStatus.UNAUTHORIZED,
        message: "User doesn't exist",
      };
    }
    user = user.toJSON();
    user.permissions = user.role.permissions;
    user.role = user.role.name;
    delete user.password;

    req.user = user;
    session.set("user", user);
    session.set("payload", payload);
    next();
  } catch (err) {
    next(err);
  }
}

export function authorization(role) {
  return async function (req, _res, next) {
    const payload = session.get("payload");
    if (payload.role === ADMIN) return next();
    if (role === ADMIN || role !== payload.role) {
      throw {
        status: false,
        message: "Operation not permitted",
        httpStatus: httpStatus.FORBIDDEN,
      };
    }
    next();
  };
}
