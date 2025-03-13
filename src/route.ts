import { createRoute } from "@hono/zod-openapi";
import { ParamsSchema, UserSchema } from "./schema/user.js";
import ErrorSchema from "./schema/error.js";

const userRoute = createRoute({
  method: "get",
  path: "/users/{id}",
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "Retrieve user by id",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Error: Bad Request",
    }
  },
});

export default userRoute;
