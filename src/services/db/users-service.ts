import { db } from '../../db/index.js';
import { lower, users } from '../../db/schema.js';

export const checkIfUserExistsByEmail = async ({ email }: { email: string }) => {
  return db.query.users.findFirst({
    columns: { id: true, name: true, email: true },
    where: (users, { eq }) => eq(lower(users.email), email.toLowerCase()),
  });
};

export const addUser = async ({ name, email }: { name: string; email: string }) => {
  const insertedUser = await db
    .insert(users)
    .values({ name, email })
    .returning({ id: users.id, name: users.name, email: users.email });

  return insertedUser[0];
};
