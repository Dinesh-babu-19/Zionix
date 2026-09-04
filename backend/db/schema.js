import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// Users table: stores every believer's name and email permanently for sending emails
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  avatar: text('avatar'),
  joinedAt: text('joined_at'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// Prayer requests table: permanently records every prayer request
export const prayerRequests = pgTable('prayer_requests', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  category: text('category').notNull().default('General Support'),
  prayerPoints: text('prayer_points').notNull(),
  isPrivate: boolean('is_private').default(false),
  submittedAt: text('submitted_at').notNull(),
  formattedDate: text('formatted_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// App settings table: stores configurations and custom daily verses permanently in Neon
export const appSettings = pgTable('app_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});
