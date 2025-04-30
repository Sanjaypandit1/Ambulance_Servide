import axios from 'axios';

// Base URL for the API
const API_BASE_URL = 'https://api.example.com'; // Replace with your actual API base URL

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Get token from storage if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Emergency API endpoints
export const emergencyApi = {
  // Get all emergencies
  getAllEmergencies: () => api.get('/emergencies'),
  
  // Get emergency by ID
  getEmergencyById: (id: string) => api.get(`/emergencies/${id}`),
  
  // Create new emergency request
  createEmergency: (data: any) => api.post('/emergencies', data),
  
  // Update emergency status
  updateEmergencyStatus: (id: string, status: string) => 
    api.patch(`/emergencies/${id}`, { status }),
  
  // Delete emergency
  deleteEmergency: (id: string) => api.delete(`/emergencies/${id}`),
};

// User API endpoints
export const userApi = {
  // Get user profile
  getUserProfile: (userId: string) => api.get(`/users/${userId}`),
  
  // Update user profile
  updateUserProfile: (userId: string, data: any) => api.put(`/users/${userId}`, data),
  
  // Get user's emergency contacts
  getEmergencyContacts: (userId: string) => api.get(`/users/${userId}/contacts`),
  
  // Add emergency contact
  addEmergencyContact: (userId: string, contactData: any) => 
    api.post(`/users/${userId}/contacts`, contactData),
  
  // Update emergency contact
  updateEmergencyContact: (userId: string, contactId: string, contactData: any) => 
    api.put(`/users/${userId}/contacts/${contactId}`, contactData),
  
  // Delete emergency contact
  deleteEmergencyContact: (userId: string, contactId: string) => 
    api.delete(`/users/${userId}/contacts/${contactId}`),
};

// Authentication API endpoints
export const authApi = {
  // Login
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  // Register
  register: (userData: any) => api.post('/auth/register', userData),
  
  // Logout
  logout: () => api.post('/auth/logout'),
  
  // Forgot password
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
};

export default api;