import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f9d0e288`;

// Public endpoints that don't require user authentication
const PUBLIC_ENDPOINTS = ['/signup', '/create-admin', '/buses'];

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('access_token');
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some(publicPath => endpoint.startsWith(publicPath));
  
  // Use anon key for public endpoints, user token for protected ones
  const authHeader = isPublicEndpoint 
    ? `Bearer ${publicAnonKey}`
    : token 
      ? `Bearer ${token}` 
      : `Bearer ${publicAnonKey}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': authHeader,
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('API Error Response:', data);
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error('API call error:', { endpoint, error: error.message });
    throw error;
  }
};