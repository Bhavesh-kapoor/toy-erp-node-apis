import User from "#models/user";
import { verifyToken } from "#utils/jwt";
import httpStatus from "#utils/httpStatus";

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
    const user = await User.findById(payload.id);
    if (!user) {
      throw {
        status: false,
        httpStatus: httpStatus.UNAUTHORIZED,
        message: "User doesn't exist",
      };
    }
    req.user = user;
    req.payload = payload;
    next();
  } catch (err) {
    next(err);
  }
}

export function authorization(role) {
  return async function (req, _res, next) {
    const payload = req.payload;
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
