import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase, apiCall } from "../utils/supabase";
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
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const data = await apiCall("/profile");
        if (data.profile) {
          setProfile(data.profile);
          setSession({ access_token: token });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("access_token");
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem("access_token");
    setSession(null);
    setProfile(null);
    toast.success("Logged out successfully");
  };

  const refreshProfile = async () => {
    try {
      const data = await apiCall("/profile");
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
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
              onNavigateToLogin={() => {}}
              onNavigateToSignup={() => {}}
              onNavigateToDashboard={() => {}}
              onLogout={handleLogout}
            />
          } />
          <Route path="/login" element={
            <Login 
              onSwitch={() => {}} 
              onBack={() => {}} 
              onLoginSuccess={(userData) => {
                setSession({ access_token: localStorage.getItem("access_token") });
                setProfile(userData);
              }}
            />
          } />
          <Route path="/signup" element={
            <Signup 
              onSwitch={() => {}} 
              onBack={() => {}}
              onSignupSuccess={(userData) => {
                setSession({ access_token: localStorage.getItem("access_token") });
                setProfile(userData);
              }}
            />
          } />
          
          <Route path="/account" element={
            session ? <AccountLayout profile={profile} /> : <Navigate to="/login" />
          }>
            <Route index element={<Navigate to="/account/profile" />} />
            <Route path="profile" element={<Profile profile={profile} />} />
            <Route path="wallet" element={<Wallet profile={profile} onWalletUpdate={refreshProfile} />} />
            <Route path="bookings" element={<BookingHistory profile={profile} />} />
            <Route path="cancel" element={<CancelTicket profile={profile} />} />
            <Route path="reschedule" element={<RescheduleTicket profile={profile} />} />
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
