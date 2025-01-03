import { createNamespace } from "cls-hooked";
import mongoose from "mongoose";

export const session = createNamespace("userSession");
export const transactionMethods = ["POST", "PUT", "PATCH", "DELETE"]; // Request methods in which a transaction will be initiated

const sessionMiddleware = (req, _res, next) => {
  session.run(async () => {
    if (transactionMethods.includes(req.method)) {
      const transactionSession = await mongoose.startSession();
      transactionSession.startTransaction();
      session.set("transaction", transactionSession);
    }
    session.set("user", req.user);
    session.set("files", req.files ?? null);
    next();
  });
};

export const setSessionData = (key, value) => {
  session.set(key, value);
};

export const getSessionData = (key) => {
  return session.get(key);
};

export default sessionMiddleware;
