import { createNamespace } from "cls-hooked";

export const session = createNamespace("userSession");

const sessionMiddleware = (req, _res, next) => {
  session.run(() => {
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
