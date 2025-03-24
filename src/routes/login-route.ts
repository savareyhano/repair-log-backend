import 'dotenv/config';
import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import {
  generateGoogleOAuthURL,
  getGoogleUser,
} from '../services/oauth/google-oauth-service.js';
import {
  addUser,
  checkIfUserExistsByEmail,
} from '../services/db/users-service.js';
import { generateState } from '../utils/oauth.js';
import {
  addOAuthLink,
  checkIfUserHasOAuthLink,
} from '../services/db/oauth-service.js';
import { generateUserAccessToken } from '../services/token/token-service.js';

const loginRoute = new Hono()
  .get('/google', (c) => {
    const scope = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];
    const state = generateState();
    const googleOAuthURL = generateGoogleOAuthURL({ scope, state });

    setCookie(c, 'google_oauth_state', state, {
      maxAge: 60 * 10, // 10 minutes
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return c.redirect(googleOAuthURL);
  })
  .get('/google/callback', async (c) => {
    const { code, state } = c.req.query();
    const storedState = getCookie(c, 'google_oauth_state');

    if (!code || !state || !storedState || state !== storedState) {
      throw new HTTPException(400, { message: 'Please restart the process.' });
    }

    const googleUser = await getGoogleUser({ code });
    const userExists = await checkIfUserExistsByEmail({
      email: googleUser.email,
    });

    if (userExists) {
      const userHasOAuthLink = await checkIfUserHasOAuthLink({
        provider: 'google',
        providerUserId: googleUser.id,
        userId: userExists.id,
      });

      if (!userHasOAuthLink) {
        await addOAuthLink({
          provider: 'google',
          providerUserId: googleUser.id,
          userId: userExists.id,
        });
      }

      const accessToken = await generateUserAccessToken(userExists);

      setCookie(c, 'access_token', accessToken, {
        maxAge: 60 * Number(process.env.ACCESS_TOKEN_EXPIRE_IN_MINUTES),
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
      });

      return c.redirect(process.env.FRONTEND_URL!);
    }

    const addedUser = await addUser({
      name: googleUser.name,
      email: googleUser.email,
    });
    await addOAuthLink({
      provider: 'google',
      providerUserId: googleUser.id,
      userId: addedUser.id,
    });
    const accessToken = await generateUserAccessToken(addedUser);

    setCookie(c, 'access_token', accessToken, {
      maxAge: 60 * Number(process.env.ACCESS_TOKEN_EXPIRE_IN_MINUTES),
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
    });

    return c.redirect(process.env.FRONTEND_URL!);
  });

export default loginRoute;
