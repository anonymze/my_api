import { Effect, Either } from "effect";
import { queriesDB } from "../db/database";
import type { User } from "../types/user";
import { verifyJWT } from "./jwt";

export const withAuth =
  (handler: (req: Request, user: User) => Promise<Response>) =>
  async (req: Request & { user: unknown }): Promise<Response> => {
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

    return handler(req, user);
  };

export const getUser = (emailUser: string) => {
  return queriesDB.getUserByEmail.get(emailUser) as User;
};
