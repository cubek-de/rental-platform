import api from "./api";

export const profileService = {
  // Get current user profile
  getProfile: async () => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put("/api/auth/update-profile", profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.post("/api/auth/change-password", passwordData);
    return response.data;
  },

  // Upload profile avatar
  uploadAvatar: async (imageFile) => {
    const formData = new FormData();
    formData.append("avatar", imageFile);

    // Using the same cloudinary upload as vehicles
    const response = await api.post(
      "/api/admin/upload-vehicle-image",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.imageUrl;
  },

  // Get user statistics (role-specific)
  getUserStats: async () => {
    const response = await api.get("/api/admin/dashboard/stats");
    return response.data;
  },

  // Enable/Disable 2FA
  enableTwoFactor: async () => {
    const response = await api.post("/api/auth/enable-2fa");
    return response.data;
  },

  disableTwoFactor: async () => {
    const response = await api.post("/api/auth/disable-2fa");
    return response.data;
  },

  // Update preferences
  updatePreferences: async (preferences) => {
    const response = await api.put("/api/auth/update-profile", { preferences });
    return response.data;
  },
};

export default profileService;
