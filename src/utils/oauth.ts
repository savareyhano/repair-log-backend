import * as crypto from 'crypto';

export const generateState = () => {
  return crypto.randomBytes(32).toString('hex');
};
