import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { HomePage } from "./components/HomePage";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { UserDashboard } from "./components/UserDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import AccountLayout from "../pages/account/AccountLayout";
import Profile from "../pages/account/Profile";
import Wallet from "../pages/account/Wallet";
import BookingHistory from "../pages/account/BookingHistory";
import CancelTicket from "../pages/account/CancelTicket";
import RescheduleTicket from "../pages/account/RescheduleTicket";
import { Toaster, toast } from "sonner";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        localStorage.setItem("access_token", session.access_token);
        fetchProfile();
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        localStorage.setItem("access_token", session.access_token);
        fetchProfile();
      } else {
        localStorage.removeItem("access_token");
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `https://zmgisuigirhxbygitpdy.supabase.co/functions/v1/make-server-f9d0e288/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );
      const data = await response.json();
      setProfile(data.profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("access_token");
    setSession(null);
    setProfile(null);
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={
            <HomePage
              isLoggedIn={!!session}
              profile={profile}
              onNavigateToLogin={() => {}} // Controlled by Router Link now
              onNavigateToSignup={() => {}}
              onNavigateToDashboard={() => {}}
              onLogout={handleLogout}
            />
          } />
          <Route path="/login" element={<Login onSwitch={() => {}} onBack={() => {}} />} />
          <Route path="/signup" element={<Signup onSwitch={() => {}} onBack={() => {}} />} />
          
          <Route path="/account" element={
            session ? <AccountLayout /> : <Navigate to="/login" />
          }>
            <Route index element={<Navigate to="/account/profile" />} />
            <Route path="profile" element={<Profile />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="bookings" element={<BookingHistory />} />
            <Route path="cancel" element={<CancelTicket />} />
            <Route path="reschedule" element={<RescheduleTicket />} />
          </Route>

          <Route path="/dashboard" element={
            session ? (
              profile?.role === "admin" ? (
                <AdminDashboard profile={profile} onLogout={handleLogout} />
              ) : (
                <UserDashboard profile={profile} onLogout={handleLogout} />
              )
            ) : <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
