import { relations, sql, type SQL } from 'drizzle-orm';
import {
  pgTable,
  unique,
  uniqueIndex,
  uuid,
  varchar,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';

// Tables
export const users = pgTable(
  'users',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
  },
  (table) => [uniqueIndex('email_unique_index').on(lower(table.email))]
);

export const oauth = pgTable(
  'oauth',
  {
    id: uuid().primaryKey().defaultRandom(),
    provider: varchar({ length: 255 }).notNull(),
    providerUserId: varchar('provider_user_id', { length: 255 }).notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    unique('provider_provider_user_id_unique').on(
      table.provider,
      table.providerUserId
    ),
  ]
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  oauth: many(oauth),
}));

export const oauthRelations = relations(oauth, ({ one }) => ({
  users: one(users, {
    fields: [oauth.userId],
    references: [users.id],
  }),
}));

// Custom lower function
export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}
