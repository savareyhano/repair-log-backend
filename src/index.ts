import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import route from "@/route.js";

const app = new OpenAPIHono().basePath("/api/v1");

app.openapi(
  route,
  (c) => {
    const { id } = c.req.valid("param");
    return c.json(
      {
        id,
        age: 30,
        name: "Jhon Thor",
      },
      200
    );
  },
  // Hook
  (result, c) => {
    if (!result.success) {
      return c.json(
        {
          code: 400,
          message: "Validation Error",
        },
        400
      );
    }
  }
);

app.doc31("/docs", {
  openapi: "3.1.1",
  info: {
    version: "1.0.0",
    title: "Repair Log API",
  },
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
