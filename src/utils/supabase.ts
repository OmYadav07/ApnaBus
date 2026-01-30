export const API_URL = "/api";

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("access_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("API Error Response:", data);
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error("API call error:", { endpoint, error: error.message });
    throw error;
  }
};

export const authService = {
  async login(email: string, password: string) {
    const data = await apiCall("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
    }
    return data;
  },

  async signup(email: string, password: string, name: string, phone: string) {
    const data = await apiCall("/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name, phone }),
    });
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
    }
    return data;
  },

  async logout() {
    localStorage.removeItem("access_token");
  },

  async getProfile() {
    return apiCall("/profile");
  },

  isLoggedIn() {
    return !!localStorage.getItem("access_token");
  },
};

export const supabase = {
  auth: {
    getSession: async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return { data: { session: null } };
      try {
        const profile = await apiCall("/profile");
        return {
          data: {
            session: {
              access_token: token,
              user: profile.profile,
            },
          },
        };
      } catch {
        return { data: { session: null } };
      }
    },
    onAuthStateChange: (callback: any) => {
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },
    signOut: async () => {
      localStorage.removeItem("access_token");
      return { error: null };
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const data = await authService.login(email, password);
        return { data: { session: { access_token: data.access_token, user: data.user } }, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    },
    signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
      try {
        const data = await authService.signup(
          email,
          password,
          options?.data?.name || "",
          options?.data?.phone || ""
        );
        return { data: { session: { access_token: data.access_token }, user: data.user }, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    },
  },
};
