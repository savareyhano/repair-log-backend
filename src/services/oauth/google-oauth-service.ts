import 'dotenv/config';
import { HTTPException } from 'hono/http-exception';
import type {
  FetchGoogleOAuthTokensResponse,
  FetchGoogleUserResponse,
} from '../../types/oauth-type.js';

export const generateGoogleOAuthURL = ({
  scope,
  state,
}: {
  scope: string[];
  state?: string;
}) => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

  const options = new URLSearchParams({
    redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL!,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: scope.join(' '),
  });

  if (state) {
    options.append('state', state);
  }

  return `${rootUrl}?${options}`;
};

export const fetchGoogleOAuthTokens = async ({
  code,
}: {
  code: string;
}): Promise<FetchGoogleOAuthTokensResponse> => {
  const url = 'https://oauth2.googleapis.com/token';

  const values = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL!,
    grant_type: 'authorization_code',
  });

  const response = await fetch(url, {
    method: 'POST',
    body: values,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status}, ${response.statusText}`);
  }

  return response.json();
};

export const fetchGoogleUser = async ({
  accessToken,
}: {
  accessToken: string;
}): Promise<FetchGoogleUserResponse> => {
  const response = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`${response.status}, ${response.statusText}`);
  }

  return response.json();
};

export const getGoogleUser = async ({ code }: { code: string }) => {
  try {
    const googleOAuthTokens = await fetchGoogleOAuthTokens({ code });
    return fetchGoogleUser({ accessToken: googleOAuthTokens.access_token });
  } catch (error) {
    throw new HTTPException(400, { message: 'Please restart the process.' });
  }
};
