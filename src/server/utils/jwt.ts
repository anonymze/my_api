import { Effect } from "effect";
import jwt from "jsonwebtoken";
import { COOKIE_JWT_NAME, getCookie } from "./cookie";

export const generateJWT = (data: Object) => {
  const payload = {
    ...data,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
  };

  return jwt.sign(payload, process.env.JWT_SECRET!);
};

export const verifyJWT = (headers: Bun.BunRequest["headers"]) => {
  const token = getCookie(headers, COOKIE_JWT_NAME);
  if (!token) return Effect.fail("No JWT token found");

  return Effect.try({
    try: () => jwt.verify(token, process.env.JWT_SECRET!),
    catch: (error) => (error instanceof Error ? error.message : String(error)),
  });
};
