import bcrypt from "bcrypt";
import env from "../../env.js";

export const hashPassword = async (password) => {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
};

export const comparePassword = async (plainText, hashed) => {
  return bcrypt.compare(plainText, hashed);
};
