import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("user"),
  walletBalance: integer("wallet_balance").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const buses = pgTable("buses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  busNumber: text("bus_number").notNull(),
  source: text("source").notNull(),
  destination: text("destination").notNull(),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  price: integer("price").notNull(),
  totalSeats: integer("total_seats").notNull().default(40),
  amenities: jsonb("amenities"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  busId: integer("bus_id").notNull().references(() => buses.id),
  seats: jsonb("seats").notNull(),
  status: text("status").notNull().default("booked"),
  totalAmount: integer("total_amount").notNull(),
  journeyDate: text("journey_date").notNull(),
  passengerDetails: jsonb("passenger_details"),
  bookingDate: timestamp("booking_date").defaultNow().notNull(),
  cancelledAt: timestamp("cancelled_at"),
  rescheduledAt: timestamp("rescheduled_at"),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  walletTransactions: many(walletTransactions),
  supportTickets: many(supportTickets),
}));

export const busesRelations = relations(buses, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  bus: one(buses, {
    fields: [bookings.busId],
    references: [buses.id],
  }),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  user: one(users, {
    fields: [walletTransactions.userId],
    references: [users.id],
  }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Bus = typeof buses.$inferSelect;
export type InsertBus = typeof buses.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = typeof walletTransactions.$inferInsert;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;
