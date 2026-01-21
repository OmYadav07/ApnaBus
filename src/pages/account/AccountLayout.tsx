import { NavLink, Outlet } from "react-router-dom";

const AccountLayout = () => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r p-4">
        <h2 className="font-semibold mb-4">My Account</h2>

        <nav className="space-y-2">
          <NavLink to="/account/profile">Profile</NavLink>
          <NavLink to="/account/wallet">Wallet</NavLink>
          <NavLink to="/account/bookings">Booking History</NavLink>
          <NavLink to="/account/cancel">Cancel Ticket</NavLink>
          <NavLink to="/account/reschedule">Reschedule Ticket</NavLink>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AccountLayout;
