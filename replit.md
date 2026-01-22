# ApnaBus - Bus Booking Platform

## Overview
ApnaBus is a React-based bus ticket booking web application built with Vite, TypeScript, and Tailwind CSS. It provides a modern, responsive interface for users to search and book bus tickets.

## Project Structure
- `src/` - Main source code directory
  - `app/` - Application components
  - `pages/` - Page components
  - `styles/` - CSS and styling files
  - `utils/` - Utility functions
- `supabase/` - Supabase configuration
- `utils/` - Additional utilities

## Tech Stack
- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS 4.1.12
- **UI Components**: Radix UI, Material UI
- **Routing**: React Router DOM
- **Backend**: Supabase (configured)

## Development
The development server runs on port 5000 with the command:
```
npm run dev
```

## Build
To build for production:
```
npm run build
```
The build output is generated in the `dist` directory.

## Recent Changes
- January 22, 2026: Initial setup for Replit environment
  - Configured Vite to allow all hosts for proxy access
  - Set server to bind to 0.0.0.0:5000
  - Installed react and react-dom as dependencies
