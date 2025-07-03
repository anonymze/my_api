import { Effect, Either } from "effect";
import { queriesDB } from "../db/database";
import { verifyJWT } from "./jwt";

export const withAuth =
  (handler: (req: Request, user: unknown) => Promise<Response>) =>
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

    return handler(req, getUser(tokenEffect.right.email));
  };

export const getUser = (emailUser: string) => {
  return queriesDB.getUserByEmail.get(emailUser);
};
