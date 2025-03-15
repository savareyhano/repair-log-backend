import 'dotenv/config';
import { sign, verify } from 'hono/jwt';
import type { JWTPayload } from 'hono/utils/jwt/types';
import type { UserData } from '../../types/user-type.js';

export const generateAccessToken = async (payload: JWTPayload) => {
  return sign(
    {
      ...payload,
      exp:
        Math.floor(Date.now() / 1000) +
        60 * Number(process.env.ACCESS_TOKEN_EXPIRE_IN_MINUTES),
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.ACCESS_TOKEN_SECRET!
  );
};

export const verifyAccessToken = async (token: string) => {
  return verify(token, process.env.ACCESS_TOKEN_SECRET!);
};

export const generateUserAccessToken = async (userData: UserData) => {
  const payload = {
    sub: userData.id,
    name: userData.name,
    email: userData.email,
  };

  return generateAccessToken(payload);
};
