import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      const token = localStorage.getItem("token");
      if (token) {
        localStorage.removeItem("token");
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (userData) => api.post("/api/auth/register", userData),
  login: (email, password) => api.post("/api/auth/login", { email, password }),
  logout: () => api.post("/api/auth/logout"),
  getCurrentUser: () => api.get("/api/auth/me"),
  verifyEmail: (token) => api.get(`/api/auth/verify-email/${token}`),
  forgotPassword: (email) => api.post("/api/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.post(`/api/auth/reset-password/${token}`, { password }),
  changePassword: (currentPassword, newPassword) =>
    api.post("/api/auth/change-password", { currentPassword, newPassword }),
  updateProfile: (userData) => api.put("/api/auth/update-profile", userData),
};

// Vehicle services
export const vehicleService = {
  getAllVehicles: (params) => api.get("/api/vehicles", { params }),
  getVehicle: (slug) => api.get(`/api/vehicles/${slug}`),
  getVehicleBySlug: (slug) => api.get(`/api/vehicles/${slug}`),
  checkAvailability: (id, startDate, endDate) =>
    api.get(`/api/vehicles/${id}/availability`, {
      params: { startDate, endDate },
    }),
  createVehicle: (vehicleData) => api.post("/api/vehicles", vehicleData),
  updateVehicle: (id, vehicleData) =>
    api.put(`/api/vehicles/${id}`, vehicleData),
  deleteVehicle: (id) => api.delete(`/api/vehicles/${id}`),
  uploadVehicleImages: (id, formData) =>
    api.post(`/api/vehicles/${id}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

// Booking services
export const bookingService = {
  createBooking: (bookingData) => api.post("/api/bookings", bookingData),
  getUserBookings: () => api.get("/api/bookings/my-bookings"),
  getBooking: (id) => api.get(`/api/bookings/${id}`),
  updateBookingStatus: (id, status) =>
    api.patch(`/api/bookings/${id}/status`, { status }),
  processCheckIn: (id, checkInData) =>
    api.post(`/api/bookings/${id}/check-in`, checkInData),
  processCheckOut: (id, checkOutData) =>
    api.post(`/api/bookings/${id}/check-out`, checkOutData),
};

// Payment services
export const paymentService = {
  createPaymentIntent: (bookingId) =>
    api.post("/api/payments/create-intent", { bookingId }),
  confirmPayment: (paymentIntentId, bookingId) =>
    api.post("/api/payments/confirm", { paymentIntentId, bookingId }),
  getPaymentDetails: (bookingId) => api.get(`/api/payments/${bookingId}`),
  processRefund: (bookingId, amount, reason) =>
    api.post("/api/payments/refund", { bookingId, amount, reason }),
};

// Favorites services
export const favoritesService = {
  addFavorite: (vehicleId) => api.post("/api/favorites/add", { vehicleId }),
  removeFavorite: (vehicleId) => api.delete(`/api/favorites/remove/${vehicleId}`),
  getFavorites: () => api.get("/api/favorites"),
  checkFavorite: (vehicleId) => api.get(`/api/favorites/check/${vehicleId}`),
};

export default api;
