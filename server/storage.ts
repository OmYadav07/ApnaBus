import { db } from "./db";
import { eq, and, like } from "drizzle-orm";
import * as schema from "../shared/schema";

export interface IStorage {
  getUser(id: number): Promise<schema.User | undefined>;
  getUserByEmail(email: string): Promise<schema.User | undefined>;
  createUser(user: schema.InsertUser): Promise<schema.User>;
  updateUserWallet(userId: number, amount: number): Promise<schema.User | undefined>;
  updateUser(userId: number, updates: { name?: string; phone?: string }): Promise<schema.User | undefined>;

  getBuses(): Promise<schema.Bus[]>;
  getBus(id: number): Promise<schema.Bus | undefined>;
  searchBuses(source?: string, destination?: string): Promise<schema.Bus[]>;
  createBus(bus: schema.InsertBus): Promise<schema.Bus>;
  updateBus(id: number, updates: Partial<schema.InsertBus>): Promise<schema.Bus | undefined>;
  deleteBus(id: number): Promise<void>;

  getBookingsByUser(userId: number): Promise<(schema.Booking & { bus: schema.Bus | null })[]>;
  getBookingsByBus(busId: number): Promise<schema.Booking[]>;
  getAllBookings(): Promise<(schema.Booking & { bus: schema.Bus | null; user: schema.User | null })[]>;
  getBooking(id: number): Promise<schema.Booking | undefined>;
  createBooking(booking: schema.InsertBooking): Promise<schema.Booking>;
  updateBooking(id: number, updates: Partial<schema.Booking>): Promise<schema.Booking | undefined>;

  getWalletTransactions(userId: number): Promise<schema.WalletTransaction[]>;
  createWalletTransaction(transaction: schema.InsertWalletTransaction): Promise<schema.WalletTransaction>;

  getSupportTickets(userId?: number): Promise<schema.SupportTicket[]>;
  createSupportTicket(ticket: schema.InsertSupportTicket): Promise<schema.SupportTicket>;
  updateSupportTicket(id: number, updates: Partial<schema.SupportTicket>): Promise<schema.SupportTicket | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user;
  }

  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const [newUser] = await db.insert(schema.users).values(user).returning();
    return newUser;
  }

  async updateUserWallet(userId: number, amount: number): Promise<schema.User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const [updated] = await db
      .update(schema.users)
      .set({ walletBalance: user.walletBalance + amount })
      .where(eq(schema.users.id, userId))
      .returning();
    return updated;
  }

  async updateUser(userId: number, updates: { name?: string; phone?: string }): Promise<schema.User | undefined> {
    const updateData: Partial<schema.InsertUser> = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.phone) updateData.phone = updates.phone;

    const [updated] = await db
      .update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, userId))
      .returning();
    return updated;
  }

  async getBuses(): Promise<schema.Bus[]> {
    return db.select().from(schema.buses);
  }

  async getBus(id: number): Promise<schema.Bus | undefined> {
    const [bus] = await db.select().from(schema.buses).where(eq(schema.buses.id, id));
    return bus;
  }

  async searchBuses(source?: string, destination?: string): Promise<schema.Bus[]> {
    let query = db.select().from(schema.buses);
    
    if (source && destination) {
      return db.select().from(schema.buses)
        .where(and(
          like(schema.buses.source, `%${source}%`),
          like(schema.buses.destination, `%${destination}%`)
        ));
    } else if (source) {
      return db.select().from(schema.buses).where(like(schema.buses.source, `%${source}%`));
    } else if (destination) {
      return db.select().from(schema.buses).where(like(schema.buses.destination, `%${destination}%`));
    }
    
    return this.getBuses();
  }

  async createBus(bus: schema.InsertBus): Promise<schema.Bus> {
    const [newBus] = await db.insert(schema.buses).values(bus).returning();
    return newBus;
  }

  async updateBus(id: number, updates: Partial<schema.InsertBus>): Promise<schema.Bus | undefined> {
    const [updated] = await db
      .update(schema.buses)
      .set(updates)
      .where(eq(schema.buses.id, id))
      .returning();
    return updated;
  }

  async deleteBus(id: number): Promise<void> {
    await db.delete(schema.buses).where(eq(schema.buses.id, id));
  }

  async getBookingsByUser(userId: number): Promise<(schema.Booking & { bus: schema.Bus | null })[]> {
    const bookings = await db.select().from(schema.bookings).where(eq(schema.bookings.userId, userId));
    
    const result = await Promise.all(bookings.map(async (booking) => {
      const bus = await this.getBus(booking.busId);
      return { ...booking, bus: bus || null };
    }));
    
    return result;
  }

  async getBookingsByBus(busId: number): Promise<schema.Booking[]> {
    return db.select().from(schema.bookings)
      .where(and(eq(schema.bookings.busId, busId), eq(schema.bookings.status, "booked")));
  }

  async getAllBookings(): Promise<(schema.Booking & { bus: schema.Bus | null; user: schema.User | null })[]> {
    const bookings = await db.select().from(schema.bookings);
    
    const result = await Promise.all(bookings.map(async (booking) => {
      const bus = await this.getBus(booking.busId);
      const user = await this.getUser(booking.userId);
      return { ...booking, bus: bus || null, user: user || null };
    }));
    
    return result;
  }

  async getBooking(id: number): Promise<schema.Booking | undefined> {
    const [booking] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, id));
    return booking;
  }

  async createBooking(booking: schema.InsertBooking): Promise<schema.Booking> {
    const [newBooking] = await db.insert(schema.bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: number, updates: Partial<schema.Booking>): Promise<schema.Booking | undefined> {
    const [updated] = await db
      .update(schema.bookings)
      .set(updates)
      .where(eq(schema.bookings.id, id))
      .returning();
    return updated;
  }

  async getWalletTransactions(userId: number): Promise<schema.WalletTransaction[]> {
    return db.select().from(schema.walletTransactions)
      .where(eq(schema.walletTransactions.userId, userId));
  }

  async createWalletTransaction(transaction: schema.InsertWalletTransaction): Promise<schema.WalletTransaction> {
    const [newTransaction] = await db.insert(schema.walletTransactions).values(transaction).returning();
    return newTransaction;
  }

  async getSupportTickets(userId?: number): Promise<schema.SupportTicket[]> {
    if (userId) {
      return db.select().from(schema.supportTickets).where(eq(schema.supportTickets.userId, userId));
    }
    return db.select().from(schema.supportTickets);
  }

  async createSupportTicket(ticket: schema.InsertSupportTicket): Promise<schema.SupportTicket> {
    const [newTicket] = await db.insert(schema.supportTickets).values(ticket).returning();
    return newTicket;
  }

  async updateSupportTicket(id: number, updates: Partial<schema.SupportTicket>): Promise<schema.SupportTicket | undefined> {
    const [updated] = await db
      .update(schema.supportTickets)
      .set(updates)
      .where(eq(schema.supportTickets.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
