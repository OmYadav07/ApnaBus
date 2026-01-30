# ApnaBus - Bus Booking Application

## Overview
ApnaBus is a full-stack bus booking application that allows users to search for buses, book tickets, manage their wallet, and track their bookings. It includes an admin dashboard for bus management, booking oversight, and support ticket handling.

## Tech Stack
- **Frontend**: React 18 with TypeScript, Vite, TailwindCSS 4, React Router v7
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication with bcryptjs for password hashing
- **UI Components**: Radix UI, Lucide icons, Material UI, Motion (animations)

## Project Structure
```
/
├── src/                    # Frontend React application
│   ├── app/               # Main application components
│   │   ├── components/    # UI components (Login, Signup, Dashboard, etc.)
│   │   └── App.tsx        # Main app with routing
│   ├── pages/             # Page components
│   │   └── account/       # Account-related pages (Profile, Wallet, Bookings)
│   ├── styles/            # CSS styles
│   └── utils/             # Utilities (API client)
├── server/                # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── db.ts              # Database connection
├── shared/                # Shared code between frontend and backend
│   └── schema.ts          # Drizzle ORM schema
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
└── drizzle.config.ts      # Drizzle ORM configuration
```

## Key Features
- User registration and login
- Bus search by source and destination
- Seat selection and booking
- Wallet system for payments
- Booking history and management
- Booking cancellation with refunds
- Booking rescheduling
- Admin dashboard with:
  - Bus management (CRUD)
  - Booking oversight
  - Support ticket handling
  - Statistics

## Database Schema
- **users**: User accounts with wallet balance
- **buses**: Bus information with routes and pricing
- **bookings**: Booking records with seat information
- **wallet_transactions**: Transaction history
- **support_tickets**: Customer support tickets

## API Endpoints
- `POST /api/signup` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile
- `GET /api/buses` - List all buses
- `GET /api/buses/search` - Search buses
- `GET /api/buses/:id/seats` - Get seat availability
- `POST /api/buses` - Add bus (admin)
- `PUT /api/buses/:id` - Update bus (admin)
- `DELETE /api/buses/:id` - Delete bus (admin)
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `POST /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/:id/reschedule` - Reschedule booking
- `POST /api/wallet/add` - Add money to wallet
- `GET /api/wallet/transactions` - Get transactions
- `GET /api/support/tickets` - Get support tickets
- `POST /api/support/tickets` - Create support ticket

## Development
- Frontend runs on port 5000
- Backend API runs on port 3001
- Vite proxies `/api` requests to the backend

## Scripts
- `npm run dev` - Start both frontend and backend
- `npm run server` - Start only the backend
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
