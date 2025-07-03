import { Effect } from "effect";
import * as z from "zod/v4";

type ContentType =
  | "application/json"
  | "application/x-www-form-urlencoded"
  | "multipart/form-data"
  | "text/plain";

export const validateContentType = <T extends ContentType>(
  headers: Bun.BunRequest["headers"],
  expectedType: T,
) => {
  const contentType = headers.get("content-type");

  if (!contentType) return Effect.fail("Missing Content-Type header");
  if (contentType.includes(expectedType)) return Effect.succeed(expectedType);

  return Effect.fail(
    `Expected Content-Type: ${expectedType}, but got: ${contentType}`,
  );
};

export const validateJsonContent = <T>(req: Request, schema: z.ZodSchema<T>) =>
  Effect.gen(function* () {
    const data = yield* Effect.tryPromise({
      try: () => req.json(),
      catch: (_) => "You are not sending JSON data",
    });

    const result = schema.safeParse(data);

    if (!result.success) {
      return yield* Effect.fail(z.treeifyError(result.error));
    }

    return result.data;
  });

export const validateRequest = ({
  req,
  schemaBody,
  expectedContentType = "application/json",
}: {
  req: Request;
  schemaBody: z.ZodSchema<any>;
  expectedContentType?: ContentType;
}) =>
  Effect.gen(function* () {
    yield* validateContentType(req.headers, expectedContentType);
    const data = yield* validateJsonContent(req, schemaBody);
    return data;
  });
