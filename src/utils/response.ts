import { COOKIE_JWT_NAME } from "./cookie";
import { generateJWT } from "./jwt";

export const loggedHeaders = (data: Object) => {
  const headers = new Headers();
  headers.set("Set-Cookie", `${COOKIE_JWT_NAME}=${generateJWT(data)}`);
  return headers;
};
