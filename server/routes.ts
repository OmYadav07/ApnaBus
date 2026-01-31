import type { Express } from "express";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "bus-booking-secret-key-2024";

interface AuthRequest extends Express.Request {
  user?: { id: number; email: string; role: string };
}

const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = async (req: any, res: any, next: any) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

export function registerRoutes(app: Express) {
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/signup", async (req, res) => {
    try {
      const { email, password, name, phone } = req.body;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        phone,
        role: "user",
        walletBalance: 0,
      });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

      res.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role, wallet_balance: user.walletBalance },
        access_token: token,
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Signup failed" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

      res.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role, wallet_balance: user.walletBalance },
        access_token: token,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/create-admin", async (req, res) => {
    try {
      const { email, password, name, admin_secret } = req.body;

      const expectedSecret = process.env.ADMIN_SETUP_SECRET || "initial-setup-only";
      if (admin_secret !== expectedSecret) {
        return res.status(403).json({ error: "Invalid admin secret" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.json({ success: true, user: existingUser, message: "Admin already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        role: "admin",
        walletBalance: 0,
      });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

      res.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        access_token: token,
      });
    } catch (error: any) {
      console.error("Admin creation error:", error);
      res.status(500).json({ error: "Admin creation failed" });
    }
  });

  app.get("/api/profile", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        profile: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          wallet_balance: user.walletBalance,
        },
      });
    } catch (error: any) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.put("/api/profile", authenticateToken, async (req: any, res) => {
    try {
      const { name, phone } = req.body;
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const updatedUser = await storage.updateUser(req.user.id, { name, phone });
      res.json({
        success: true,
        profile: {
          id: updatedUser?.id,
          email: updatedUser?.email,
          name: updatedUser?.name,
          phone: updatedUser?.phone,
          role: updatedUser?.role,
          wallet_balance: updatedUser?.walletBalance,
        },
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.get("/api/buses", async (req, res) => {
    try {
      const buses = await storage.getBuses();
      res.json({ buses });
    } catch (error: any) {
      console.error("Fetch buses error:", error);
      res.status(500).json({ error: "Failed to fetch buses" });
    }
  });

  app.get("/api/buses/search", async (req, res) => {
    try {
      const { source, destination } = req.query;
      const buses = await storage.searchBuses(source as string, destination as string);
      res.json({ buses });
    } catch (error: any) {
      console.error("Search buses error:", error);
      res.status(500).json({ error: "Failed to search buses" });
    }
  });

  app.get("/api/buses/:id/seats", async (req, res) => {
    try {
      const busId = parseInt(req.params.id);
      const bus = await storage.getBus(busId);

      if (!bus) {
        return res.status(404).json({ error: "Bus not found" });
      }

      const bookings = await storage.getBookingsByBus(busId);
      const bookedSeats = bookings.flatMap((b: any) => b.seats || []);

      res.json({
        total_seats: bus.totalSeats,
        booked_seats: bookedSeats,
        available_seats: bus.totalSeats - bookedSeats.length,
      });
    } catch (error: any) {
      console.error("Fetch seats error:", error);
      res.status(500).json({ error: "Failed to fetch seats" });
    }
  });

  app.post("/api/buses", authenticateToken, isAdmin, async (req: any, res) => {
    try {
      const busData = req.body;
      const bus = await storage.createBus({
        name: busData.name,
        busNumber: busData.bus_number || busData.busNumber || `BUS-${Math.floor(1000 + Math.random() * 9000)}`,
        source: busData.source,
        destination: busData.destination,
        departureTime: busData.departure_time || busData.departureTime,
        arrivalTime: busData.arrival_time || busData.arrivalTime,
        price: busData.price,
        totalSeats: busData.total_seats || busData.totalSeats || 40,
        amenities: busData.amenities,
      });
      res.json({ success: true, bus });
    } catch (error: any) {
      console.error("Add bus error:", error);
      res.status(500).json({ error: "Failed to add bus" });
    }
  });

  app.put("/api/buses/:id", authenticateToken, isAdmin, async (req: any, res) => {
    try {
      const busId = parseInt(req.params.id);
      const updates = req.body;
      const bus = await storage.updateBus(busId, updates);

      if (!bus) {
        return res.status(404).json({ error: "Bus not found" });
      }

      res.json({ success: true, bus });
    } catch (error: any) {
      console.error("Update bus error:", error);
      res.status(500).json({ error: "Failed to update bus" });
    }
  });

  app.delete("/api/buses/:id", authenticateToken, isAdmin, async (req: any, res) => {
    try {
      const busId = parseInt(req.params.id);
      await storage.deleteBus(busId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete bus error:", error);
      res.status(500).json({ error: "Failed to delete bus" });
    }
  });

  app.get("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      const bookings = await storage.getBookingsByUser(req.user.id);
      res.json({ bookings });
    } catch (error: any) {
      console.error("Fetch bookings error:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/admin/bookings", authenticateToken, isAdmin, async (req: any, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json({ bookings });
    } catch (error: any) {
      console.error("Fetch all bookings error:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      const { bus_id, seats, journey_date, passenger_details } = req.body;

      const bus = await storage.getBus(bus_id);
      if (!bus) {
        return res.status(404).json({ error: "Bus not found" });
      }

      const existingBookings = await storage.getBookingsByBus(bus_id);
      const bookedSeats = existingBookings.flatMap((b: any) => b.seats || []);
      const conflict = seats.some((seat: number) => bookedSeats.includes(seat));

      if (conflict) {
        return res.status(400).json({ error: "Some seats are already booked" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const totalAmount = bus.price * seats.length;

      if (user.walletBalance < totalAmount) {
        return res.status(400).json({ error: "Insufficient wallet balance" });
      }

      const booking = await storage.createBooking({
        userId: req.user.id,
        busId: bus_id,
        seats,
        status: "booked",
        totalAmount,
        journeyDate: journey_date,
        passengerDetails: passenger_details,
      });

      await storage.updateUserWallet(req.user.id, -totalAmount);
      await storage.createWalletTransaction({
        userId: req.user.id,
        amount: -totalAmount,
        type: "debit",
        description: `Booking for ${bus.name} (${seats.length} seats)`,
      });

      res.json({ success: true, booking });
    } catch (error: any) {
      console.error("Create booking error:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  app.post("/api/bookings/:id/cancel", authenticateToken, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      const user = await storage.getUser(req.user.id);
      if (booking.userId !== req.user.id && user?.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized to cancel this booking" });
      }

      if (booking.status === "cancelled") {
        return res.status(400).json({ error: "Booking already cancelled" });
      }

      const updatedBooking = await storage.updateBooking(bookingId, {
        status: "cancelled",
        cancelledAt: new Date(),
      });

      await storage.updateUserWallet(booking.userId, booking.totalAmount);
      await storage.createWalletTransaction({
        userId: booking.userId,
        amount: booking.totalAmount,
        type: "credit",
        description: `Refund for cancelled booking #${bookingId}`,
      });

      res.json({ success: true, booking: updatedBooking });
    } catch (error: any) {
      console.error("Cancel booking error:", error);
      res.status(500).json({ error: "Failed to cancel booking" });
    }
  });

  app.post("/api/bookings/:id/reschedule", authenticateToken, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { new_bus_id, new_seats, new_journey_date } = req.body;

      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      const user = await storage.getUser(req.user.id);
      if (booking.userId !== req.user.id && user?.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized to reschedule this booking" });
      }

      if (booking.status !== "booked") {
        return res.status(400).json({ error: "Can only reschedule active bookings" });
      }

      const existingBookings = await storage.getBookingsByBus(new_bus_id);
      const bookedSeats = existingBookings
        .filter((b: any) => b.id !== bookingId)
        .flatMap((b: any) => b.seats || []);

      const conflict = new_seats.some((seat: number) => bookedSeats.includes(seat));
      if (conflict) {
        return res.status(400).json({ error: "Some seats are already booked" });
      }

      const updatedBooking = await storage.updateBooking(bookingId, {
        busId: new_bus_id,
        seats: new_seats,
        journeyDate: new_journey_date,
        rescheduledAt: new Date(),
      });

      res.json({ success: true, booking: updatedBooking });
    } catch (error: any) {
      console.error("Reschedule booking error:", error);
      res.status(500).json({ error: "Failed to reschedule booking" });
    }
  });

  app.post("/api/wallet/add", authenticateToken, async (req: any, res) => {
    try {
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const updatedUser = await storage.updateUserWallet(req.user.id, amount);
      await storage.createWalletTransaction({
        userId: req.user.id,
        amount,
        type: "credit",
        description: "Added money to wallet",
      });

      res.json({ success: true, wallet_balance: updatedUser?.walletBalance });
    } catch (error: any) {
      console.error("Add wallet money error:", error);
      res.status(500).json({ error: "Failed to add money" });
    }
  });

  app.get("/api/wallet/transactions", authenticateToken, async (req: any, res) => {
    try {
      const transactions = await storage.getWalletTransactions(req.user.id);
      res.json({ transactions });
    } catch (error: any) {
      console.error("Fetch transactions error:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/support/tickets", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      const tickets = user?.role === "admin"
        ? await storage.getSupportTickets()
        : await storage.getSupportTickets(req.user.id);
      res.json({ tickets });
    } catch (error: any) {
      console.error("Fetch tickets error:", error);
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.post("/api/support/tickets", authenticateToken, async (req: any, res) => {
    try {
      const { subject, message } = req.body;
      const ticket = await storage.createSupportTicket({
        userId: req.user.id,
        subject,
        message,
        status: "open",
      });
      res.json({ success: true, ticket });
    } catch (error: any) {
      console.error("Create ticket error:", error);
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  app.put("/api/support/tickets/:id", authenticateToken, isAdmin, async (req: any, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const updates = req.body;
      const ticket = await storage.updateSupportTicket(ticketId, updates);
      res.json({ success: true, ticket });
    } catch (error: any) {
      console.error("Update ticket error:", error);
      res.status(500).json({ error: "Failed to update ticket" });
    }
  });
}
