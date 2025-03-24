import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import loginRoute from './routes/login-route.js';
import { HTTPException } from 'hono/http-exception';

const app = new Hono();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN!,
    credentials: true,
  })
);

app.basePath('/api').route('/login', loginRoute);

app.all('*', (c) => {
  return c.json(
    {
      status: 'fail',
      message: 'Not found',
    },
    404
  );
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      {
        status: 'fail',
        message: err.message,
      },
      err.status
    );
  } else {
    return c.json(
      {
        status: 'error',
        message: 'Something went wrong',
      },
      500
    );
  }
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
