import { jwtVerify, SignJWT } from "jose";
import env from "../../env.js";
import { createSecretKey } from "node:crypto";

export const generateToken = async (payload) => {
  const secret = env.JWT_SECRET;
  const secretKey = createSecretKey(secret, "utf-8");

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN || "7d")
    .sign(secretKey);
};

export const verifyToken = async (token) => {
  const secretKey = createSecretKey(env.JWT_SECRET, "utf-8");
  const { payload } = await jwtVerify(token, secretKey);
  return payload;
};
