import type { User } from "../types/user";
import { COOKIE_JWT_NAME } from "./cookie";
import { generateJWT } from "./jwt";

export const loggedHeaders = (data: User) => {
  const { hash, ...restUser } = data;
  const headers = new Headers();
  headers.set("Set-Cookie", `${COOKIE_JWT_NAME}=${generateJWT(restUser)}`);
  return headers;
};

export const jsonResponseLogged = (body: any, dataJWT: User) => {
  return Response.json(body, {
    headers: loggedHeaders(dataJWT),
  });
};
