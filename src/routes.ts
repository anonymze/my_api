import { Effect, Either } from "effect";
import { loginSchema } from "./types/login";
import { withAuth } from "./utils/auth";
import { validateRequest } from "./utils/request";
import { loggedHeaders } from "./utils/response";

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

  const { email } = result.right;

  return Response.json(
    { email },
    {
      headers: loggedHeaders({
        email,
      }),
    },
  );
};

const protectedRoute = withAuth(async (_, user) => {
  return Response.json(user);
});

export { loginRoute, protectedRoute };
