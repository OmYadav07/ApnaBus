import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from 'npm:@supabase/supabase-js@2';

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase client helper
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  );
};

// Health check endpoint
app.get("/make-server-f9d0e288/health", (c) => {
  return c.json({ status: "ok" });
});

// ========== AUTHENTICATION ROUTES ==========

// Sign up route
app.post("/make-server-f9d0e288/signup", async (c) => {
  try {
    const { email, password, name, phone, user_id } = await c.req.json();
    const supabase = getSupabaseClient();

    // If user_id is provided, it means the user already signed up via Supabase Auth
    // We just need to create their profile
    if (user_id) {
      const userProfile = {
        id: user_id,
        email,
        name,
        phone,
        role: 'user',
        wallet_balance: 0,
        created_at: new Date().toISOString()
      };
      await kv.set(`user:${user_id}`, userProfile);
      return c.json({ success: true, user: userProfile });
    }

    // Legacy flow - check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      // User exists - check if they have a profile in KV store
      const existingProfile = await kv.get(`user:${existingUser.id}`);
      
      if (existingProfile) {
        // User fully exists - return success but inform they can login
        return c.json({ 
          success: true, 
          user: existingProfile,
          message: 'User already exists. Please login.' 
        }, 200);
      } else {
        // User exists in auth but not in KV - create profile
        const userProfile = {
          id: existingUser.id,
          email,
          name,
          phone,
          role: 'user',
          wallet_balance: 0,
          created_at: new Date().toISOString()
        };
        await kv.set(`user:${existingUser.id}`, userProfile);
        return c.json({ success: true, user: userProfile });
      }
    }

    // Create new user with Supabase Auth - DO NOT auto-confirm email
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, phone },
      // Email confirmation is required - users must verify their email
      email_confirm: false
    });

    if (authError) {
      console.error('Signup error:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Create user profile in KV store
    const userProfile = {
      id: authData.user.id,
      email,
      name,
      phone,
      role: 'user',
      wallet_balance: 0,
      created_at: new Date().toISOString()
    };

    await kv.set(`user:${authData.user.id}`, userProfile);

    return c.json({ success: true, user: userProfile });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Create admin user
app.post("/make-server-f9d0e288/create-admin", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    const supabase = getSupabaseClient();

    // Check if admin already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      // User exists - check if they have a profile in KV store
      const existingProfile = await kv.get(`user:${existingUser.id}`);
      
      if (existingProfile && existingProfile.role === 'admin') {
        // Admin fully exists
        return c.json({ 
          success: true, 
          user: existingProfile,
          message: 'Admin already exists. Please login.' 
        }, 200);
      } else if (existingProfile) {
        // User exists but not admin - upgrade to admin
        existingProfile.role = 'admin';
        await kv.set(`user:${existingUser.id}`, existingProfile);
        
        // Update metadata and confirm email
        await supabase.auth.admin.updateUserById(existingUser.id, {
          email_confirm: true,
          user_metadata: { ...existingUser.user_metadata, role: 'admin' }
        });
        
        return c.json({ success: true, user: existingProfile });
      } else {
        // User exists in auth but not in KV - create admin profile
        const adminProfile = {
          id: existingUser.id,
          email,
          name,
          role: 'admin',
          created_at: new Date().toISOString()
        };
        await kv.set(`user:${existingUser.id}`, adminProfile);
        
        // Confirm email
        await supabase.auth.admin.updateUserById(existingUser.id, {
          email_confirm: true,
          user_metadata: { name, role: 'admin' }
        });
        
        return c.json({ success: true, user: adminProfile });
      }
    }

    // Create new admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: 'admin' },
      email_confirm: true
    });

    if (authError) {
      console.error('Admin creation error:', authError);
      return c.json({ error: authError.message }, 400);
    }

    const adminProfile = {
      id: authData.user.id,
      email,
      name,
      role: 'admin',
      created_at: new Date().toISOString()
    };

    await kv.set(`user:${authData.user.id}`, adminProfile);

    return c.json({ success: true, user: adminProfile });
  } catch (error) {
    console.error('Admin creation error:', error);
    return c.json({ error: 'Admin creation failed' }, 500);
  }
});

// Get user profile
app.get("/make-server-f9d0e288/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    return c.json({ profile });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// ========== BUS MANAGEMENT ROUTES ==========

// Get all buses
app.get("/make-server-f9d0e288/buses", async (c) => {
  try {
    const buses = await kv.getByPrefix('bus:');
    return c.json({ buses: buses || [] });
  } catch (error) {
    console.error('Fetch buses error:', error);
    return c.json({ error: 'Failed to fetch buses' }, 500);
  }
});

// Search buses
app.get("/make-server-f9d0e288/buses/search", async (c) => {
  try {
    const source = c.req.query('source');
    const destination = c.req.query('destination');
    
    const allBuses = await kv.getByPrefix('bus:') || [];
    
    const filteredBuses = allBuses.filter((bus: any) => {
      if (source && bus.source.toLowerCase() !== source.toLowerCase()) return false;
      if (destination && bus.destination.toLowerCase() !== destination.toLowerCase()) return false;
      return true;
    });

    return c.json({ buses: filteredBuses });
  } catch (error) {
    console.error('Search buses error:', error);
    return c.json({ error: 'Failed to search buses' }, 500);
  }
});

// Add bus (Admin only)
app.post("/make-server-f9d0e288/buses", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const busData = await c.req.json();
    const busId = `bus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const bus = {
      id: busId,
      ...busData,
      total_seats: busData.total_seats || 40,
      created_at: new Date().toISOString()
    };

    await kv.set(`bus:${busId}`, bus);
    return c.json({ success: true, bus });
  } catch (error) {
    console.error('Add bus error:', error);
    return c.json({ error: 'Failed to add bus' }, 500);
  }
});

// Update bus (Admin only)
app.put("/make-server-f9d0e288/buses/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const busId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingBus = await kv.get(`bus:${busId}`);
    if (!existingBus) {
      return c.json({ error: 'Bus not found' }, 404);
    }

    const updatedBus = { ...existingBus, ...updates, updated_at: new Date().toISOString() };
    await kv.set(`bus:${busId}`, updatedBus);

    return c.json({ success: true, bus: updatedBus });
  } catch (error) {
    console.error('Update bus error:', error);
    return c.json({ error: 'Failed to update bus' }, 500);
  }
});

// Delete bus (Admin only)
app.delete("/make-server-f9d0e288/buses/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const busId = c.req.param('id');
    await kv.del(`bus:${busId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete bus error:', error);
    return c.json({ error: 'Failed to delete bus' }, 500);
  }
});

// ========== BOOKING ROUTES ==========

// Get available seats for a bus
app.get("/make-server-f9d0e288/buses/:id/seats", async (c) => {
  try {
    const busId = c.req.param('id');
    const bus = await kv.get(`bus:${busId}`);
    
    if (!bus) {
      return c.json({ error: 'Bus not found' }, 404);
    }

    // Get all bookings for this bus
    const allBookings = await kv.getByPrefix('booking:') || [];
    const busBookings = allBookings.filter((b: any) => 
      b.bus_id === busId && b.status === 'booked'
    );

    const bookedSeats = busBookings.flatMap((b: any) => b.seats);
    
    return c.json({ 
      total_seats: bus.total_seats,
      booked_seats: bookedSeats,
      available_seats: bus.total_seats - bookedSeats.length
    });
  } catch (error) {
    console.error('Fetch seats error:', error);
    return c.json({ error: 'Failed to fetch seats' }, 500);
  }
});

// Create booking
app.post("/make-server-f9d0e288/bookings", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { bus_id, seats, journey_date, passenger_details } = await c.req.json();
    
    const bus = await kv.get(`bus:${bus_id}`);
    if (!bus) {
      return c.json({ error: 'Bus not found' }, 404);
    }

    // Check seat availability
    const allBookings = await kv.getByPrefix('booking:') || [];
    const busBookings = allBookings.filter((b: any) => 
      b.bus_id === bus_id && b.status === 'booked'
    );
    const bookedSeats = busBookings.flatMap((b: any) => b.seats);
    
    const conflict = seats.some((seat: number) => bookedSeats.includes(seat));
    if (conflict) {
      return c.json({ error: 'Some seats are already booked' }, 400);
    }

    // Check wallet balance
    const userProfile = await kv.get(`user:${user.id}`);
    const totalAmount = bus.price * seats.length;
    
    if (userProfile.wallet_balance < totalAmount) {
      return c.json({ error: 'Insufficient wallet balance' }, 400);
    }

    // Create booking
    const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const booking = {
      id: bookingId,
      user_id: user.id,
      bus_id,
      seats,
      status: 'booked',
      total_amount: totalAmount,
      journey_date,
      passenger_details,
      booking_date: new Date().toISOString()
    };

    await kv.set(`booking:${bookingId}`, booking);

    // Deduct from wallet
    userProfile.wallet_balance -= totalAmount;
    await kv.set(`user:${user.id}`, userProfile);

    // Add wallet transaction
    const txnId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(`wallet_txn:${txnId}`, {
      id: txnId,
      user_id: user.id,
      amount: -totalAmount,
      type: 'debit',
      description: `Booking for ${bus.name} (${seats.length} seats)`,
      timestamp: new Date().toISOString()
    });

    return c.json({ success: true, booking });
  } catch (error) {
    console.error('Create booking error:', error);
    return c.json({ error: 'Failed to create booking' }, 500);
  }
});

// Get user bookings
app.get("/make-server-f9d0e288/bookings", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allBookings = await kv.getByPrefix('booking:') || [];
    const userBookings = allBookings.filter((b: any) => b.user_id === user.id);

    // Fetch bus details for each booking
    const bookingsWithDetails = await Promise.all(
      userBookings.map(async (booking: any) => {
        const bus = await kv.get(`bus:${booking.bus_id}`);
        return { ...booking, bus };
      })
    );

    return c.json({ bookings: bookingsWithDetails });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

// Get all bookings (Admin only)
app.get("/make-server-f9d0e288/admin/bookings", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const allBookings = await kv.getByPrefix('booking:') || [];
    
    // Fetch bus and user details
    const bookingsWithDetails = await Promise.all(
      allBookings.map(async (booking: any) => {
        const bus = await kv.get(`bus:${booking.bus_id}`);
        const bookingUser = await kv.get(`user:${booking.user_id}`);
        return { ...booking, bus, user: bookingUser };
      })
    );

    return c.json({ bookings: bookingsWithDetails });
  } catch (error) {
    console.error('Fetch all bookings error:', error);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

// Cancel booking
app.post("/make-server-f9d0e288/bookings/:id/cancel", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookingId = c.req.param('id');
    const booking = await kv.get(`booking:${bookingId}`);
    
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    
    // Check if user is owner or admin
    if (booking.user_id !== user.id && userProfile.role !== 'admin') {
      return c.json({ error: 'Unauthorized to cancel this booking' }, 403);
    }

    if (booking.status === 'cancelled') {
      return c.json({ error: 'Booking already cancelled' }, 400);
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelled_at = new Date().toISOString();
    await kv.set(`booking:${bookingId}`, booking);

    // Refund to wallet
    const bookingUser = await kv.get(`user:${booking.user_id}`);
    bookingUser.wallet_balance += booking.total_amount;
    await kv.set(`user:${booking.user_id}`, bookingUser);

    // Add wallet transaction
    const txnId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(`wallet_txn:${txnId}`, {
      id: txnId,
      user_id: booking.user_id,
      amount: booking.total_amount,
      type: 'credit',
      description: `Refund for cancelled booking ${bookingId}`,
      timestamp: new Date().toISOString()
    });

    return c.json({ success: true, booking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return c.json({ error: 'Failed to cancel booking' }, 500);
  }
});

// Reschedule booking
app.post("/make-server-f9d0e288/bookings/:id/reschedule", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookingId = c.req.param('id');
    const { new_bus_id, new_seats, new_journey_date } = await c.req.json();
    
    const booking = await kv.get(`booking:${bookingId}`);
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    
    if (booking.user_id !== user.id && userProfile.role !== 'admin') {
      return c.json({ error: 'Unauthorized to reschedule this booking' }, 403);
    }

    if (booking.status !== 'booked') {
      return c.json({ error: 'Can only reschedule active bookings' }, 400);
    }

    // Check new seat availability
    const allBookings = await kv.getByPrefix('booking:') || [];
    const busBookings = allBookings.filter((b: any) => 
      b.bus_id === new_bus_id && b.status === 'booked' && b.id !== bookingId
    );
    const bookedSeats = busBookings.flatMap((b: any) => b.seats);
    
    const conflict = new_seats.some((seat: number) => bookedSeats.includes(seat));
    if (conflict) {
      return c.json({ error: 'Some seats are already booked' }, 400);
    }

    // Update booking
    booking.bus_id = new_bus_id;
    booking.seats = new_seats;
    booking.journey_date = new_journey_date;
    booking.rescheduled_at = new Date().toISOString();
    
    await kv.set(`booking:${bookingId}`, booking);

    return c.json({ success: true, booking });
  } catch (error) {
    console.error('Reschedule booking error:', error);
    return c.json({ error: 'Failed to reschedule booking' }, 500);
  }
});

// ========== WALLET ROUTES ==========

// Add money to wallet
app.post("/make-server-f9d0e288/wallet/add", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { amount } = await c.req.json();
    
    if (!amount || amount <= 0) {
      return c.json({ error: 'Invalid amount' }, 400);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    userProfile.wallet_balance += amount;
    await kv.set(`user:${user.id}`, userProfile);

    // Add wallet transaction
    const txnId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(`wallet_txn:${txnId}`, {
      id: txnId,
      user_id: user.id,
      amount,
      type: 'credit',
      description: 'Added money to wallet',
      timestamp: new Date().toISOString()
    });

    return c.json({ success: true, wallet_balance: userProfile.wallet_balance });
  } catch (error) {
    console.error('Add wallet money error:', error);
    return c.json({ error: 'Failed to add money' }, 500);
  }
});

// Get wallet transactions
app.get("/make-server-f9d0e288/wallet/transactions", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allTxns = await kv.getByPrefix('wallet_txn:') || [];
    const userTxns = allTxns.filter((t: any) => t.user_id === user.id);
    
    // Sort by timestamp descending
    userTxns.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return c.json({ transactions: userTxns });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    return c.json({ error: 'Failed to fetch transactions' }, 500);
  }
});

// ========== SUPPORT TICKET ROUTES ==========

// Create support ticket
app.post("/make-server-f9d0e288/support", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { subject, message } = await c.req.json();
    
    const ticketId = `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const ticket = {
      id: ticketId,
      user_id: user.id,
      subject,
      message,
      status: 'open',
      created_at: new Date().toISOString()
    };

    await kv.set(`support:${ticketId}`, ticket);

    return c.json({ success: true, ticket });
  } catch (error) {
    console.error('Create support ticket error:', error);
    return c.json({ error: 'Failed to create ticket' }, 500);
  }
});

// Get user support tickets
app.get("/make-server-f9d0e288/support", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allTickets = await kv.getByPrefix('support:') || [];
    const userTickets = allTickets.filter((t: any) => t.user_id === user.id);

    return c.json({ tickets: userTickets });
  } catch (error) {
    console.error('Fetch support tickets error:', error);
    return c.json({ error: 'Failed to fetch tickets' }, 500);
  }
});

// Get all support tickets (Admin only)
app.get("/make-server-f9d0e288/admin/support", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const allTickets = await kv.getByPrefix('support:') || [];

    return c.json({ tickets: allTickets });
  } catch (error) {
    console.error('Fetch all support tickets error:', error);
    return c.json({ error: 'Failed to fetch tickets' }, 500);
  }
});

// Close support ticket (Admin only)
app.post("/make-server-f9d0e288/support/:id/close", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const ticketId = c.req.param('id');
    const ticket = await kv.get(`support:${ticketId}`);
    
    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    ticket.status = 'closed';
    ticket.closed_at = new Date().toISOString();
    await kv.set(`support:${ticketId}`, ticket);

    return c.json({ success: true, ticket });
  } catch (error) {
    console.error('Close support ticket error:', error);
    return c.json({ error: 'Failed to close ticket' }, 500);
  }
});

Deno.serve(app.fetch);