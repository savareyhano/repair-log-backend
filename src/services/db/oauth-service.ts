import { db } from '../../db/index.js';
import { oauth } from '../../db/schema.js';

export const checkIfUserHasOAuthLink = async ({
  provider,
  providerUserId,
  userId,
}: {
  provider: string;
  providerUserId: string;
  userId: string;
}) => {
  const foundUserWithOAuthLink = await db.query.oauth.findFirst({
    columns: { id: true },
    where: (oauth, { eq, and }) =>
      and(
        eq(oauth.provider, provider),
        eq(oauth.providerUserId, providerUserId),
        eq(oauth.userId, userId)
      ),
  });

  if (!foundUserWithOAuthLink) {
    return false;
  }

  return true;
};

export const addOAuthLink = async ({
  provider,
  providerUserId,
  userId,
}: {
  provider: string;
  providerUserId: string;
  userId: string;
}) => {
  await db.insert(oauth).values({ provider, providerUserId, userId });
};
