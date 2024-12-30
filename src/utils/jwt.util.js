import jwt from "jsonwebtoken";
import env from "#configs/env";

export const createToken = (payload, secret = env.JWT_SECRET, options) => {
  const token = jwt.sign(payload, secret, { ...options });
  return token;
};

export const verifyToken = (token, secret = env.JWT_SECRET) => {
  try {
    const payload = jwt.verify(token, secret);
    return payload;
  } catch (err) {
    throw new Error("Invalid jwt");
  }
};
