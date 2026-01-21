import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { HomePage } from "./components/HomePage";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { UserDashboard } from "./components/UserDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { Toaster, toast } from "sonner";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"home" | "login" | "signup" | "dashboard">(
    "home",
  );

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        localStorage.setItem(
          "access_token",
          session.access_token,
        );
        fetchProfile();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        localStorage.setItem(
          "access_token",
          session.access_token,
        );
        fetchProfile();
        // After successful login, redirect to home
        setView("home");
      } else {
        localStorage.removeItem("access_token");
        setProfile(null);
        setLoading(false);
        setView("home");
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
    setView("home");
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
    <div className="min-h-screen">
      <Toaster position="top-right" richColors />
      
      {view === "home" ? (
        <HomePage
          isLoggedIn={!!session}
          profile={profile}
          onNavigateToLogin={() => setView("login")}
          onNavigateToSignup={() => setView("signup")}
          onNavigateToDashboard={() => setView("dashboard")}
          onLogout={handleLogout}
        />
      ) : view === "login" ? (
        <Login
          onSwitch={() => setView("signup")}
          onBack={() => setView("home")}
        />
      ) : view === "signup" ? (
        <Signup
          onSwitch={() => setView("login")}
          onBack={() => setView("home")}
        />
      ) : view === "dashboard" ? (
        profile?.role === "admin" ? (
          <AdminDashboard
            profile={profile}
            onLogout={handleLogout}
          />
        ) : (
          <UserDashboard
            profile={profile}
            onLogout={handleLogout}
          />
        )
      ) : null}
    </div>
  );
}
