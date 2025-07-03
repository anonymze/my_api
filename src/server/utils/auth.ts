import { Effect, Either } from "effect";
import { queriesDB } from "../db/database";
import type { User } from "../types/user";
import { verifyJWT } from "./jwt";

export const withAuth =
  (handler: (req: Request, user: User) => Promise<Response>) =>
  async (req: Request): Promise<Response> => {
    const tokenEffect = await Effect.runPromise(
      Effect.either(verifyJWT(req.headers)),
    );

    if (Either.isLeft(tokenEffect)) {
      return Response.json(tokenEffect.left, { status: 401 });
    }

    if (typeof tokenEffect.right === "string") {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = getUser(tokenEffect.right.email);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return handler(req, user);
  };

export const getUser = (emailUser: string) => {
  return queriesDB.getUserByEmail.get(emailUser) as User | undefined;
};

export const hashPassword = async (password: string) => {
  return Bun.password.hash(password);
};

export const verifyPassword = async (password: string, hash: string) => {
  return Bun.password.verify(password, hash);
};
