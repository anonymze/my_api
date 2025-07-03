import { Effect, Either } from "effect";
import { loginSchema } from "./types/login";
import { getUser, verifyPassword, withAuth } from "./utils/auth";
import { validateRequest } from "./utils/request";
import { jsonResponseLogged } from "./utils/response";

const loginRoute = async (req: Request): Promise<Response> => {
  const result = await Effect.runPromise(
    Effect.either(
      validateRequest({
        req,
        schemaBody: loginSchema,
      }),
    ),
  );

  if (Either.isLeft(result)) {
    return Response.json(result.left, { status: 400 });
  }

  const { email, password } = result.right;

  const user = getUser(email);

  if (!user || !(await verifyPassword(password, user.hash))) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const { hash, ...restUser } = user;

  return jsonResponseLogged(restUser, user);
};

const protectedRoute = withAuth(async (_, user) => {
  return jsonResponseLogged(
    {
      message: "OK",
    },
    user,
  );
});

export { loginRoute, protectedRoute };
