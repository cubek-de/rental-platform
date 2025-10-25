/* eslint-disable no-unused-vars */
import React, { useState, useContext, useEffect, useCallback } from "react";
import {
  Card,
  Button,
  Badge,
  Avatar,
  Modal,
  Table,
  TextInput,
  Textarea,
  Select,
  Label,
  Spinner,
  Dropdown,
} from "flowbite-react";
import { AuthContext } from "../../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import {
  FiHome,
  FiUsers,
  FiTruck,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiSettings,
  FiAlertCircle,
  FiUser,
  FiPlus,
  FiEdit,
  FiTrash,
  FiEye,
  FiMail,
  FiPhone,
  FiMapPin,
  FiActivity,
  FiBell,
  FiSearch,
  FiChevronDown,
  FiLogOut,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiSave,
  FiAlertTriangle,
  FiX,
  FiCamera,
  FiShield,
  FiEdit3,
  FiLock,
  FiCreditCard,
  FiFileText,
} from "react-icons/fi";

// AdminProfileContent Component - Integrated within dashboard
const AdminProfileContent = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [stats, setStats] = useState(null);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    "profile.phone": user?.profile?.phone || "",
    "profile.address.street": user?.profile?.address?.street || "",
    "profile.address.city": user?.profile?.address?.city || "",
    "profile.address.postalCode": user?.profile?.address?.postalCode || "",
    "profile.address.country": user?.profile?.address?.country || "Deutschland",
    "profile.language": user?.profile?.language || "de",
    "preferences.newsletter": user?.preferences?.newsletter ?? true,
    "preferences.smsNotifications":
      user?.preferences?.smsNotifications ?? false,
    "preferences.emailNotifications":
      user?.preferences?.emailNotifications ?? true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await api.get("/api/admin/dashboard/stats");
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    try {
      setIsLoading(true);

      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        profile: {
          phone: profileData["profile.phone"],
          address: {
            street: profileData["profile.address.street"],
            city: profileData["profile.address.city"],
            postalCode: profileData["profile.address.postalCode"],
            country: profileData["profile.address.country"],
          },
          language: profileData["profile.language"],
        },
        preferences: {
          newsletter: profileData["preferences.newsletter"],
          smsNotifications: profileData["preferences.smsNotifications"],
          emailNotifications: profileData["preferences.emailNotifications"],
        },
      };

      const response = await api.put("/api/auth/update-profile", updateData);
      setUser(response.data.data.user);
      toast.success("Profil erfolgreich aktualisiert!");
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Fehler beim Aktualisieren des Profils");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Bitte füllen Sie alle Passwort-Felder aus");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Neue Passwörter stimmen nicht überein");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Neues Passwort muss mindestens 8 Zeichen haben");
      return;
    }

    try {
      setIsLoading(true);
      await api.post("/api/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Passwort erfolgreich geändert!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password change error:", error);
      toast.error("Fehler beim Ändern des Passworts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Bitte wählen Sie eine Bilddatei aus");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Bild darf maximal 5MB groß sein");
      return;
    }

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api.post(
        "/api/admin/upload-vehicle-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const updateData = { "profile.avatar": response.data.imageUrl };
      const userResponse = await api.put(
        "/api/auth/update-profile",
        updateData
      );
      setUser(userResponse.data.data.user);

      toast.success("Profilbild erfolgreich hochgeladen!");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Fehler beim Hochladen des Profilbildes");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      "profile.phone": user?.profile?.phone || "",
      "profile.address.street": user?.profile?.address?.street || "",
      "profile.address.city": user?.profile?.address?.city || "",
      "profile.address.postalCode": user?.profile?.address?.postalCode || "",
      "profile.address.country":
        user?.profile?.address?.country || "Deutschland",
      "profile.language": user?.profile?.language || "de",
      "preferences.newsletter": user?.preferences?.newsletter ?? true,
      "preferences.smsNotifications":
        user?.preferences?.smsNotifications ?? false,
      "preferences.emailNotifications":
        user?.preferences?.emailNotifications ?? true,
    });
    setIsEditing(false);
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: FiUser },
    { id: "security", label: "Sicherheit", icon: FiShield },
    { id: "preferences", label: "Einstellungen", icon: FiSettings },
    { id: "statistics", label: "Statistiken", icon: FiActivity },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Administrator Profil
        </h2>
        <p className="text-gray-600">
          Verwalten Sie Ihre Administrator-Informationen und Einstellungen
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 px-8 py-8 text-white relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-6 left-6 w-20 h-20 border border-white/20 rounded-full"></div>
            <div className="absolute top-12 right-12 w-16 h-16 border border-white/20 rounded-full"></div>
            <div className="absolute bottom-6 left-1/3 w-12 h-12 border border-white/20 rounded-full"></div>
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.profile?.avatar ? (
                    <img
                      src={user.profile.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiShield className="w-10 h-10 text-white" />
                  )}
                </div>

                {/* Avatar Upload Button */}
                <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-full cursor-pointer transition-colors shadow-lg">
                  <FiCamera className="w-3 h-3" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>

                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-bold">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-blue-100 text-lg">System Administrator</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Admin
                  </span>
                  <span className="bg-blue-500/50 text-white px-2 py-1 rounded-full text-xs">
                    <FiCalendar className="w-3 h-3 inline mr-1" />
                    Seit {new Date(user?.createdAt).toLocaleDateString("de-DE")}
                  </span>
                  <span className="bg-green-500/50 text-white px-2 py-1 rounded-full text-xs">
                    <FiActivity className="w-3 h-3 inline mr-1" />
                    Online
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {stats && (
              <div className="hidden lg:flex space-x-4">
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {stats.totalUsers || 0}
                  </div>
                  <div className="text-blue-200 text-xs">Benutzer</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {stats.totalVehicles || 0}
                  </div>
                  <div className="text-blue-200 text-xs">Fahrzeuge</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {stats.totalBookings || 0}
                  </div>
                  <div className="text-blue-200 text-xs">Buchungen</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-6 px-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FiUser className="w-5 h-5 text-blue-600" />
                Persönliche Informationen
              </h3>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <FiEdit3 className="w-4 h-4" />
                  Bearbeiten
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl"
                  >
                    <FiSave className="w-4 h-4" />
                    {isLoading ? "Speichern..." : "Speichern"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <FiX className="w-4 h-4" />
                    Abbrechen
                  </button>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <FiUser className="w-4 h-4" />
                  Vorname *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ihr Vorname"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {profileData.firstName || "Nicht angegeben"}
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <FiUser className="w-4 h-4" />
                  Nachname *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ihr Nachname"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {profileData.lastName || "Nicht angegeben"}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <FiMail className="w-4 h-4" />
                  E-Mail-Adresse *
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="ihre.email@beispiel.de"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {profileData.email || "Nicht angegeben"}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <FiPhone className="w-4 h-4" />
                  Telefonnummer
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData["profile.phone"]}
                    onChange={(e) =>
                      handleInputChange("profile.phone", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="+49 123 456 7890"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {profileData["profile.phone"] || "Nicht angegeben"}
                  </div>
                )}
              </div>
            </div>

            {/* Address Section */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiMapPin className="w-5 h-5 text-blue-600" />
                Adresse
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Street */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Straße und Hausnummer
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData["profile.address.street"]}
                      onChange={(e) =>
                        handleInputChange(
                          "profile.address.street",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Musterstraße 123"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800 font-medium">
                      {profileData["profile.address.street"] ||
                        "Nicht angegeben"}
                    </div>
                  )}
                </div>

                {/* City and ZIP */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Stadt
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData["profile.address.city"]}
                      onChange={(e) =>
                        handleInputChange(
                          "profile.address.city",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Musterstadt"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800 font-medium">
                      {profileData["profile.address.city"] || "Nicht angegeben"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Postleitzahl
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData["profile.address.postalCode"]}
                      onChange={(e) =>
                        handleInputChange(
                          "profile.address.postalCode",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="12345"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800 font-medium">
                      {profileData["profile.address.postalCode"] ||
                        "Nicht angegeben"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FiShield className="w-5 h-5 text-blue-600" />
              Sicherheitseinstellungen
            </h3>

            {/* Password Change */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiLock className="w-5 h-5 text-blue-600" />
                Passwort ändern
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Aktuelles Passwort
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      handlePasswordChange("currentPassword", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Aktuelles Passwort"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Neues Passwort
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Neues Passwort"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Passwort bestätigen
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmPassword", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Passwort bestätigen"
                  />
                </div>
              </div>

              <button
                onClick={handlePasswordUpdate}
                disabled={isLoading}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                <FiLock className="w-4 h-4" />
                {isLoading ? "Passwort wird geändert..." : "Passwort ändern"}
              </button>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FiSettings className="w-5 h-5 text-blue-600" />
              Benachrichtigungseinstellungen
            </h3>

            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <h5 className="font-medium text-gray-800">
                    E-Mail-Benachrichtigungen
                  </h5>
                  <p className="text-sm text-gray-600">
                    Erhalten Sie wichtige Updates per E-Mail
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData["preferences.emailNotifications"]}
                    onChange={(e) =>
                      handleInputChange(
                        "preferences.emailNotifications",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <h5 className="font-medium text-gray-800">
                    SMS-Benachrichtigungen
                  </h5>
                  <p className="text-sm text-gray-600">
                    Erhalten Sie dringende Nachrichten per SMS
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData["preferences.smsNotifications"]}
                    onChange={(e) =>
                      handleInputChange(
                        "preferences.smsNotifications",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Newsletter */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <h5 className="font-medium text-gray-800">Newsletter</h5>
                  <p className="text-sm text-gray-600">
                    Bleiben Sie über neue Features informiert
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData["preferences.newsletter"]}
                    onChange={(e) =>
                      handleInputChange(
                        "preferences.newsletter",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Save Settings Button */}
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
            >
              <FiSave className="w-4 h-4" />
              {isLoading
                ? "Einstellungen werden gespeichert..."
                : "Einstellungen speichern"}
            </button>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "statistics" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FiActivity className="w-5 h-5 text-blue-600" />
              Administrator Statistiken
            </h3>

            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Users */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Gesamte Benutzer</p>
                      <p className="text-2xl font-bold">
                        {stats.totalUsers || 0}
                      </p>
                    </div>
                    <FiUsers className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                {/* Total Vehicles */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Gesamte Fahrzeuge</p>
                      <p className="text-2xl font-bold">
                        {stats.totalVehicles || 0}
                      </p>
                    </div>
                    <FiTruck className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                {/* Total Bookings */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Gesamte Buchungen</p>
                      <p className="text-2xl font-bold">
                        {stats.totalBookings || 0}
                      </p>
                    </div>
                    <FiCalendar className="w-8 h-8 text-purple-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboardPage = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateVehicleModal, setShowCreateVehicleModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [showDeleteVehicleModal, setShowDeleteVehicleModal] = useState(false);
  const [showVehicleDetailsModal, setShowVehicleDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [rateLimitError, setRateLimitError] = useState(false);

  // Real-time data states
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    activeBookings: 0,
    pendingApprovals: 0,
  });

  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // Form states
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
    phone: "",
  });

  const [newVehicle, setNewVehicle] = useState({
    name: "",
    category: "Wohnmobil",
    brand: "",
    model: "",
    year: "",
    fuelType: "Diesel",
    transmission: "Manuell",
    seats: "",
    beds: "",
    pricePerDay: "",
    description: "",
  });

  const [vehicleImage, setVehicleImage] = useState(null);
  const [updateVehicleImage, setUpdateVehicleImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [updateImagePreview, setUpdateImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch real-time data from API
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch dashboard stats and users data
      const [statsRes, usersRes, vehiclesRes] = await Promise.all([
        api.get("/api/admin/dashboard/stats"),
        api.get("/api/admin/users"),
        api.get("/api/admin/vehicles"), // Admin vehicles endpoint
      ]);

      // Extract dashboard statistics from API response
      const apiStats = statsRes.data?.data?.overview || {};
      const revenueData = statsRes.data?.data?.revenue || {};

      // Set users from API response
      const usersData = usersRes.data?.data?.users || usersRes.data?.data || [];
      setUsers(usersData);

      // Set vehicles from API response
      const vehiclesData =
        vehiclesRes.data?.data?.vehicles || vehiclesRes.data?.data || [];
      setVehicles(vehiclesData);

      // Update stats with actual data counts to ensure consistency
      setStats({
        totalUsers: usersData.length, // Use actual users array length
        totalVehicles: vehiclesData.length, // Use actual vehicles array length
        totalBookings: apiStats.totalBookings || 0,
        monthlyRevenue: revenueData.monthly || 0,
        activeBookings: apiStats.activeBookings || 0,
        pendingApprovals: apiStats.pendingReviews || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);

      // Handle specific error codes
      if (error.response?.status === 401) {
        console.error("Authentication failed - redirecting to login");
        logout();
        return;
      }

      if (error.response?.status === 429) {
        console.error("Rate limit exceeded - please wait before refreshing");
        setRateLimitError(true);
        setTimeout(() => setRateLimitError(false), 10000); // Clear error after 10 seconds
        return;
      }

      // For other errors, set empty states instead of mock data
      setStats({
        totalUsers: 0,
        totalVehicles: 0,
        totalBookings: 0,
        monthlyRevenue: 0,
        activeBookings: 0,
        pendingApprovals: 0,
      });
      setUsers([]);
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  // Handle image selection for vehicles
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVehicleImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle image selection for vehicle updates
  const handleUpdateImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUpdateVehicleImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setUpdateImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Upload image via backend
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await api.post(
        "/api/admin/upload-vehicle-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  useEffect(() => {
    document.title = "Admin Dashboard | WohnmobilTraum";
    fetchDashboardData();
    // Removed automatic refresh interval to prevent rate limiting
  }, [fetchDashboardData]);

  // Create new user via admin endpoint
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      console.log("Creating user with data:", newUser); // Debug log
      // Use admin endpoint for creating users with role
      await api.post("/api/admin/users", newUser);
      setShowCreateUserModal(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "user",
        phone: "",
      });
      // Refresh data after creation
      fetchDashboardData();
      toast.success("Benutzer erfolgreich erstellt!");
    } catch (error) {
      console.error("Error creating user:", error);
      console.error("Error response:", error.response?.data); // Debug log
      toast.error(
        error.response?.data?.message || "Fehler beim Erstellen des Benutzers"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Create new vehicle
  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      let imageUrl = null;

      // Upload image if selected
      if (vehicleImage) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImageToCloudinary(vehicleImage);
        } catch (error) {
          toast.error("Fehler beim Hochladen des Bildes");
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      // Transform vehicle data to match API expectations
      const vehicleData = {
        name: newVehicle.name,
        category: newVehicle.category,
        description: newVehicle.description || "Standard Fahrzeugbeschreibung",
        technicalData: {
          brand: newVehicle.brand,
          model: newVehicle.model,
          year: parseInt(newVehicle.year) || new Date().getFullYear(),
          fuelType: newVehicle.fuelType,
          transmission: newVehicle.transmission,
        },
        capacity: {
          seats: parseInt(newVehicle.seats) || 4,
          sleepingPlaces: parseInt(newVehicle.beds) || 2,
        },
        pricing: {
          basePrice: {
            perDay: parseFloat(newVehicle.pricePerDay) || 0,
          },
          deposit: 500, // Default deposit
        },
      };

      // Add image if uploaded
      if (imageUrl) {
        vehicleData.images = [
          {
            url: imageUrl,
            caption: "Hauptbild",
            isMain: true,
            order: 1,
          },
        ];
      }

      await api.post("/api/admin/vehicles", vehicleData);
      setShowCreateVehicleModal(false);
      setNewVehicle({
        name: "",
        category: "Wohnmobil",
        brand: "",
        model: "",
        year: "",
        fuelType: "Diesel",
        transmission: "Manuell",
        seats: "",
        beds: "",
        pricePerDay: "",
        description: "",
      });
      setVehicleImage(null);
      setImagePreview(null);

      // Refresh data after creation
      console.log("Vehicle created successfully, refreshing data...");
      await fetchDashboardData();
      toast.success("Fahrzeug erfolgreich erstellt!");
    } catch (error) {
      console.error("Error creating vehicle:", error);
      toast.error(
        error.response?.data?.message || "Fehler beim Erstellen des Fahrzeugs"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await api.put(`/api/admin/users/${selectedUser._id}`, selectedUser);
      setShowEditUserModal(false);
      setSelectedUser(null);
      fetchDashboardData();
      toast.success("Benutzer erfolgreich aktualisiert!");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(
        error.response?.data?.message ||
          "Fehler beim Aktualisieren des Benutzers"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    try {
      setIsLoading(true);
      await api.delete(`/api/admin/users/${selectedUser._id}`);
      setShowDeleteUserModal(false);
      setSelectedUser(null);
      fetchDashboardData();
      toast.success("Benutzer erfolgreich gelöscht!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(
        error.response?.data?.message || "Fehler beim Löschen des Benutzers"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit modal
  const openEditUserModal = (user) => {
    setSelectedUser({ ...user });
    setShowEditUserModal(true);
  };

  // Open delete modal
  const openDeleteUserModal = (user) => {
    setSelectedUser(user);
    setShowDeleteUserModal(true);
  };

  // Open user details modal
  const openUserDetailsModal = (user) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  // Vehicle CRUD functions
  // Update vehicle
  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      let imageUrl = null;

      // Upload new image if selected
      if (updateVehicleImage) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImageToCloudinary(updateVehicleImage);
        } catch (error) {
          toast.error("Fehler beim Hochladen des Bildes");
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      // Transform vehicle data to match API expectations
      const vehicleData = {
        name: selectedVehicle.name,
        category: selectedVehicle.category,
        description:
          selectedVehicle.description || "Standard Fahrzeugbeschreibung",
        technicalData: {
          brand: selectedVehicle.technicalData?.brand || selectedVehicle.brand,
          model: selectedVehicle.technicalData?.model || selectedVehicle.model,
          year:
            parseInt(
              selectedVehicle.technicalData?.year || selectedVehicle.year
            ) || new Date().getFullYear(),
          fuelType:
            selectedVehicle.technicalData?.fuelType || selectedVehicle.fuelType,
          transmission:
            selectedVehicle.technicalData?.transmission ||
            selectedVehicle.transmission,
          // Add default values for required fields if not present
          length: selectedVehicle.technicalData?.length || 6.0,
          width: selectedVehicle.technicalData?.width || 2.3,
          height: selectedVehicle.technicalData?.height || 2.8,
          weight: selectedVehicle.technicalData?.weight || 3500,
          maxWeight: selectedVehicle.technicalData?.maxWeight || 3500,
          requiredLicense:
            selectedVehicle.technicalData?.requiredLicense || "B",
        },
        capacity: {
          seats:
            parseInt(
              selectedVehicle.capacity?.seats || selectedVehicle.seats
            ) || 4,
          sleepingPlaces:
            parseInt(
              selectedVehicle.capacity?.sleepingPlaces || selectedVehicle.beds
            ) || 2,
        },
        pricing: {
          basePrice: {
            perDay:
              parseFloat(
                selectedVehicle.pricing?.basePrice?.perDay ||
                  selectedVehicle.pricePerDay
              ) || 0,
          },
          deposit: selectedVehicle.pricing?.deposit || 500,
        },
      };

      // Add new image if uploaded, otherwise keep existing images
      if (imageUrl) {
        vehicleData.images = [
          {
            url: imageUrl,
            caption: "Hauptbild",
            isMain: true,
            order: 1,
          },
        ];
      }

      await api.put(`/api/admin/vehicles/${selectedVehicle._id}`, vehicleData);
      setShowEditVehicleModal(false);
      setSelectedVehicle(null);
      setUpdateVehicleImage(null);
      setUpdateImagePreview(null);
      fetchDashboardData();
      toast.success("Fahrzeug erfolgreich aktualisiert!");
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast.error(
        error.response?.data?.message ||
          "Fehler beim Aktualisieren des Fahrzeugs"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Delete vehicle
  const handleDeleteVehicle = async () => {
    try {
      setIsLoading(true);
      await api.delete(`/api/admin/vehicles/${selectedVehicle._id}`);
      setShowDeleteVehicleModal(false);
      setSelectedVehicle(null);
      fetchDashboardData();
      toast.success("Fahrzeug erfolgreich gelöscht!");
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error(
        error.response?.data?.message || "Fehler beim Löschen des Fahrzeugs"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit vehicle modal
  const openEditVehicleModal = (vehicle) => {
    setSelectedVehicle({ ...vehicle });
    setUpdateVehicleImage(null);
    setUpdateImagePreview(null);
    setShowEditVehicleModal(true);
  };

  // Open delete vehicle modal
  const openDeleteVehicleModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDeleteVehicleModal(true);
  };

  // Open vehicle details modal
  const openVehicleDetailsModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">
            Dashboard wird geladen...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  const StatCard = ({ icon: Icon, title, value, change, gradient, iconBg }) => (
    <div
      className={`relative overflow-hidden rounded-2xl ${gradient} p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <div
              className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${iconBg} mb-4 shadow-lg`}
            >
              <Icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">
              {(value || 0).toLocaleString()}
            </h3>
            <p className="text-white/80 font-medium">{title}</p>
          </div>
          {change && (
            <div
              className={`text-lg font-bold ${
                change > 0 ? "text-green-300" : "text-red-300"
              }`}
            >
              {change > 0 ? "+" : ""}
              {change}%
            </div>
          )}
        </div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10"></div>
    </div>
  );

  const SidebarItem = ({ icon: Icon, label, active, onClick, badge }) => (
    <button
      onClick={onClick}
      className={`group w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
        active
          ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30"
          : "text-white/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      <div className="flex items-center">
        <Icon
          className={`w-6 h-6 ${
            active ? "text-white" : "text-white/70 group-hover:text-white"
          }`}
        />
        <span className="ml-4 font-semibold text-sm tracking-wide">
          {label}
        </span>
      </div>
      {badge && (
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full ${
            active ? "bg-white/30 text-white" : "bg-white/20 text-white"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );

  const ModernHeader = () => (
    <div className="bg-white/95 backdrop-blur-3xl border-b border-gray-200/40 px-8 py-6 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Center Section - Premium Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="relative bg-gray-50/90 hover:bg-white/95 rounded-3xl border border-gray-200/60 hover:border-blue-200/80 transition-all duration-500 shadow-sm hover:shadow-md">
              <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-blue-500 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Suche nach Benutzern, Fahrzeugen, Buchungen, Analytics..."
                className="pl-14 pr-20 py-4 bg-transparent border-0 rounded-3xl focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all duration-300 w-full text-gray-700 placeholder-gray-400 font-medium"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <kbd className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100/80 border border-gray-200/80 rounded-lg shadow-sm">
                  ⌘K
                </kbd>
                <div className="w-px h-4 bg-gray-300"></div>
                <FiFilter className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-pointer transition-colors duration-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Refresh Button & User Dropdown */}
        <div className="flex items-center space-x-4">
          {/* Refresh Button */}
          <Button
            size="sm"
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0 hover:from-emerald-600 hover:to-teal-700 text-white transition-all duration-300"
          >
            <FiRefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Aktualisieren
          </Button>

          {/* User Dropdown */}
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-50/90 to-white/90 hover:from-blue-50/90 hover:to-purple-50/90 rounded-3xl p-3 border border-gray-200/60 hover:border-blue-200/80 transition-all duration-500 cursor-pointer group shadow-sm hover:shadow-md">
                <div className="relative">
                  <Avatar
                    img={
                      user.profilePicture ||
                      `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=6366f1&color=fff&size=128`
                    }
                    size="md"
                    className="ring-2 ring-blue-100/70 group-hover:ring-blue-200 transition-all duration-500 shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                </div>
                <div className="hidden lg:block">
                  <div className="font-bold text-gray-900 text-sm">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center font-medium">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse shadow-sm"></div>
                    Administrator
                  </div>
                </div>
                <FiChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
              </div>
            }
          >
            <Dropdown.Header>
              <span className="block text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </span>
              <span className="block truncate text-sm text-gray-500">
                {user.email}
              </span>
            </Dropdown.Header>
            <Dropdown.Item
              icon={FiUser}
              onClick={() => setActiveSection("profile")}
            >
              Profil
            </Dropdown.Item>
            <Dropdown.Item
              icon={FiSettings}
              onClick={() => setActiveSection("settings")}
            >
              Einstellungen
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item
              icon={FiLogOut}
              onClick={logout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Abmelden
            </Dropdown.Item>
          </Dropdown>
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className="w-72 bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0 min-h-screen relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 left-0 w-full h-32 bg-white/5"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mb-16"></div>

      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* Logo and Admin Portal Badge */}
        <div className="mb-8 space-y-4">
          {/* Company Logo */}
          <div className="flex justify-center">
            <div className="relative overflow-hidden rounded-xl p-2 transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:scale-105 group">
              <img
                src="https://926c016b950324a3223fa88ada4966be.cdn.bubble.io/cdn-cgi/image/w=96,h=100,f=auto,dpr=1,fit=contain/f1737462329590x960045882346967900/Logo_FAIRmietung-Haltern_wei%E2%94%9C%C6%92.png"
                alt="FAIRmietung Logo"
                className="h-12 w-auto transition-all duration-300 group-hover:brightness-110 group-hover:contrast-110"
              />
              {/* Subtle glow effect on hover */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl"></div>
            </div>
          </div>

          {/* Admin Portal Badge */}
          <div className="flex justify-center">
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 shadow-lg">
              <span className="text-white font-bold text-sm tracking-wide">
                Admin Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-4 flex-1">
          <SidebarItem
            icon={FiHome}
            label="Dashboard"
            active={activeSection === "dashboard"}
            onClick={() => setActiveSection("dashboard")}
            collapsed={false}
          />
          <SidebarItem
            icon={FiUsers}
            label="Benutzer"
            active={activeSection === "users"}
            onClick={() => setActiveSection("users")}
            collapsed={false}
            badge={Array.isArray(users) ? users.length : 0}
          />
          <SidebarItem
            icon={FiTruck}
            label="Fahrzeuge"
            active={activeSection === "vehicles"}
            onClick={() => setActiveSection("vehicles")}
            collapsed={false}
            badge={Array.isArray(vehicles) ? vehicles.length : 0}
          />
          <SidebarItem
            icon={FiCalendar}
            label="Buchungen"
            active={activeSection === "bookings"}
            onClick={() => setActiveSection("bookings")}
            collapsed={false}
          />
          <SidebarItem
            icon={FiActivity}
            label="Analytics"
            active={activeSection === "analytics"}
            onClick={() => setActiveSection("analytics")}
            collapsed={false}
          />
          <SidebarItem
            icon={FiSettings}
            label="Einstellungen"
            active={activeSection === "settings"}
            onClick={() => setActiveSection("settings")}
            collapsed={false}
          />
        </nav>

        {/* System Status - Always visible */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center mr-4">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">
                  System Status
                </p>
                <p className="text-white/80 text-xs">Alle Systeme Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const DashboardContent = () => (
    <div className="space-y-8">
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          icon={FiUsers}
          title="Gesamte Benutzer"
          value={stats.totalUsers}
          change={12.5}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          iconBg="bg-blue-600"
        />
        <StatCard
          icon={FiTruck}
          title="Fahrzeuge"
          value={stats.totalVehicles}
          change={8.2}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          iconBg="bg-emerald-600"
        />
        <StatCard
          icon={FiCalendar}
          title="Buchungen"
          value={stats.totalBookings}
          change={15.3}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          iconBg="bg-purple-600"
        />
        <StatCard
          icon={FiDollarSign}
          title="Monatsumsatz"
          value={stats.monthlyRevenue}
          change={-2.1}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          iconBg="bg-orange-600"
        />
        <StatCard
          icon={FiActivity}
          title="Aktive Buchungen"
          value={stats.activeBookings}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
          iconBg="bg-indigo-600"
        />
        <StatCard
          icon={FiAlertCircle}
          title="Genehmigungen"
          value={stats.pendingApprovals}
          gradient="bg-gradient-to-br from-red-500 to-red-600"
          iconBg="bg-red-600"
        />
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Letzte Aktivitäten
              </h3>
              <div className="flex space-x-2">
                <Button size="xs" color="light" className="bg-gray-50 border-0">
                  <FiFilter className="w-4 h-4" />
                </Button>
                <Button size="xs" color="light" className="bg-gray-50 border-0">
                  <FiDownload className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {[
                {
                  action: "Neue Buchung eingegangen",
                  user: "Max Mustermann",
                  time: "vor 5 Minuten",
                  type: "booking",
                  status: "success",
                },
                {
                  action: "Fahrzeug hinzugefügt",
                  user: "Anna Schmidt",
                  time: "vor 15 Minuten",
                  type: "vehicle",
                  status: "info",
                },
                {
                  action: "Benutzer registriert",
                  user: "John Doe",
                  time: "vor 32 Minuten",
                  type: "user",
                  status: "success",
                },
                {
                  action: "Zahlung verarbeitet",
                  user: "Lisa Weber",
                  time: "vor 1 Stunde",
                  type: "payment",
                  status: "success",
                },
                {
                  action: "Bewertung abgegeben",
                  user: "Tom Mueller",
                  time: "vor 2 Stunden",
                  type: "review",
                  status: "info",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                      activity.type === "booking"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        : activity.type === "vehicle"
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                        : activity.type === "user"
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                        : activity.type === "payment"
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                        : "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white"
                    }`}
                  >
                    {activity.type === "booking" ? (
                      <FiCalendar className="w-5 h-5" />
                    ) : activity.type === "vehicle" ? (
                      <FiTruck className="w-5 h-5" />
                    ) : activity.type === "user" ? (
                      <FiUser className="w-5 h-5" />
                    ) : activity.type === "payment" ? (
                      <FiDollarSign className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      activity.status === "success"
                        ? "bg-emerald-400"
                        : "bg-blue-400"
                    }`}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                onClick={() => setShowCreateUserModal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
              >
                <FiPlus className="mr-2" />
                Neuer Benutzer
              </Button>
              <Button
                onClick={() => setShowCreateVehicleModal(true)}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0"
              >
                <FiPlus className="mr-2" />
                Neues Fahrzeug
              </Button>
              <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 border-0">
                <FiDownload className="mr-2" />
                Bericht Export
              </Button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              System Health
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Server Status</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-emerald-600">
                    Online
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-emerald-600">
                    Connected
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Response</span>
                <span className="text-sm font-medium text-gray-900">245ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const UsersContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Benutzerverwaltung
          </h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie alle Plattform-Benutzer
          </p>
        </div>
        <Button
          onClick={() => setShowCreateUserModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0 hover:from-emerald-600 hover:to-teal-700 text-white transition-all duration-300 shadow-lg"
        >
          <FiPlus className="mr-2" />
          Neuer Benutzer
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 uppercase">
              <tr>
                <th className="px-6 py-4 font-bold">Benutzer</th>
                <th className="px-6 py-4 font-bold">E-Mail</th>
                <th className="px-6 py-4 font-bold">Rolle</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Registriert</th>
                <th className="px-6 py-4 font-bold">Aktionen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(Array.isArray(users) ? users : [])
                .slice(0, 10)
                .map((user, index) => (
                  <tr
                    key={user._id || index}
                    className="bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={
                            user.profile?.avatar ||
                            `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=6366f1&color=fff`
                          }
                          alt="Avatar"
                          className="w-10 h-10 rounded-full mr-3 ring-2 ring-blue-100"
                        />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {user.phone || "Keine Telefonnummer"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "agent"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          user.security?.isEmailVerified ||
                          user.security?.emailVerified ||
                          user.emailVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.security?.isEmailVerified ||
                        user.security?.emailVerified ||
                        user.emailVerified
                          ? "Verifiziert"
                          : "Ausstehend"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(
                        user.createdAt || Date.now()
                      ).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openUserDetailsModal(user)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                          title="Details anzeigen"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditUserModal(user)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-2 rounded-lg transition-colors"
                          title="Bearbeiten"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteUserModal(user)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                          title="Löschen"
                        >
                          <FiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const VehiclesContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Fahrzeuge</h2>
          <p className="text-gray-600">
            Verwalten Sie alle Fahrzeuge auf der Plattform
          </p>
        </div>
        <Button
          onClick={() => setShowCreateVehicleModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0 hover:from-emerald-600 hover:to-teal-700 text-white transition-all duration-300"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Fahrzeug hinzufügen
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 uppercase">
              <tr>
                <th className="px-6 py-4 font-bold">Fahrzeug</th>
                <th className="px-6 py-4 font-bold">Kategorie</th>
                <th className="px-6 py-4 font-bold">Preis/Tag</th>
                <th className="px-6 py-4 font-bold">Kapazität</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Aktionen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(Array.isArray(vehicles) ? vehicles : [])
                .slice(0, 10)
                .map((vehicle, index) => (
                  <tr
                    key={vehicle._id || index}
                    className="bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                          <FiTruck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {vehicle.name || "Unbekanntes Fahrzeug"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {vehicle.technicalData?.brand}{" "}
                            {vehicle.technicalData?.model}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          vehicle.category === "Wohnmobil"
                            ? "bg-blue-100 text-blue-800"
                            : vehicle.category === "Kastenwagen"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {vehicle.category || vehicle.type || "Unbekannt"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      €
                      {(
                        vehicle.pricing?.basePrice?.perDay ||
                        vehicle.pricePerDay ||
                        0
                      ).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {vehicle.capacity?.seats || vehicle.capacity || "N/A"}{" "}
                      Personen
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          vehicle.status === "aktiv" ||
                          vehicle.availability?.isAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {vehicle.status === "aktiv" ||
                        vehicle.availability?.isAvailable
                          ? "Verfügbar"
                          : "Nicht verfügbar"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openVehicleDetailsModal(vehicle)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                          title="Details anzeigen"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditVehicleModal(vehicle)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-2 rounded-lg transition-colors"
                          title="Bearbeiten"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteVehicleModal(vehicle)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                          title="Löschen"
                        >
                          <FiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return <UsersContent />;
      case "vehicles":
        return <VehiclesContent />;
      case "bookings":
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Buchungen kommen bald...</p>
          </div>
        );
      case "analytics":
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Analytics kommen bald...</p>
          </div>
        );
      case "profile":
        return <AdminProfileContent />;
      case "settings":
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Einstellungen
              </h2>
              <p className="text-gray-600">
                Verwalten Sie Systemeinstellungen und Konfigurationen
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* System Configuration */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiSettings className="w-5 h-5 text-blue-600" />
                  System Konfiguration
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Wartungsmodus</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">
                      Registrierung erlauben
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">
                      E-Mail Benachrichtigungen
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Backup & Security */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiShield className="w-5 h-5 text-green-600" />
                  Sicherheit & Backup
                </h3>
                <div className="space-y-4">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <FiDownload className="w-4 h-4" />
                    Datenbank Backup erstellen
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <FiRefreshCw className="w-4 h-4" />
                    System Cache leeren
                  </button>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      Letztes Backup:
                    </p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date().toLocaleDateString("de-DE")}
                    </p>
                  </div>
                </div>
              </div>

              {/* API Configuration */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiActivity className="w-5 h-5 text-purple-600" />
                  API Konfiguration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate Limit (Requests/Minute)
                    </label>
                    <input
                      type="number"
                      defaultValue="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (Minuten)
                    </label>
                    <input
                      type="number"
                      defaultValue="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email Settings */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiMail className="w-5 h-5 text-blue-600" />
                  E-Mail Einstellungen
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Server
                    </label>
                    <input
                      type="text"
                      placeholder="smtp.gmail.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From E-Mail
                    </label>
                    <input
                      type="email"
                      placeholder="noreply@rental-platform.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors">
                    Test E-Mail senden
                  </button>
                </div>
              </div>
            </div>

            {/* Save Settings */}
            <div className="mt-8 flex justify-end">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl">
                <FiSave className="w-4 h-4" />
                Einstellungen speichern
              </button>
            </div>
          </div>
        );
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ModernHeader />

        <main className="flex-1 overflow-auto p-8 bg-transparent">
          {rateLimitError && (
            <div className="fixed top-4 right-4 z-50">
              <div className="bg-red-50/90 backdrop-blur-xl rounded-xl shadow-lg p-4 flex items-center border border-red-200/50">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
                  <FiAlertCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-red-700 font-medium">
                  Zu viele Anfragen. Bitte warten Sie einen Moment.
                </span>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="fixed top-4 right-4 z-50">
              <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg p-4 flex items-center border border-gray-200/50">
                <div className="relative">
                  <div className="w-6 h-6 border-2 border-blue-200 rounded-full animate-spin"></div>
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <span className="ml-3 text-sm text-gray-700 font-medium">
                  Daten werden aktualisiert...
                </span>
              </div>
            </div>
          )}

          {renderContent()}
        </main>
      </div>

      {/* Create User Modal */}
      <Modal
        show={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        size="4xl"
        className="backdrop-blur-sm"
      >
        <Modal.Header className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-0">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
              <FiUser className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">
              Neuen Benutzer erstellen
            </span>
          </div>
        </Modal.Header>
        <Modal.Body className="bg-white p-8">
          <form onSubmit={handleCreateUser} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="font-semibold text-gray-700 flex items-center"
                >
                  <FiUser className="w-4 h-4 mr-2 text-emerald-600" />
                  Vorname *
                </Label>
                <TextInput
                  id="firstName"
                  placeholder="Vorname eingeben"
                  value={newUser.firstName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, firstName: e.target.value })
                  }
                  required
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="font-semibold text-gray-700 flex items-center"
                >
                  <FiUser className="w-4 h-4 mr-2 text-emerald-600" />
                  Nachname *
                </Label>
                <TextInput
                  id="lastName"
                  placeholder="Nachname eingeben"
                  value={newUser.lastName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, lastName: e.target.value })
                  }
                  required
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="font-semibold text-gray-700 flex items-center"
              >
                <FiMail className="w-4 h-4 mr-2 text-emerald-600" />
                E-Mail Adresse *
              </Label>
              <TextInput
                id="email"
                type="email"
                placeholder="E-Mail Adresse eingeben"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                required
                className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="font-semibold text-gray-700 flex items-center"
              >
                <FiSettings className="w-4 h-4 mr-2 text-emerald-600" />
                Passwort *
              </Label>
              <TextInput
                id="password"
                type="password"
                placeholder="Sicheres Passwort eingeben"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                required
                className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-500">
                Mind. 8 Zeichen mit Groß-/Kleinbuchstaben, Zahlen und
                Sonderzeichen
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="font-semibold text-gray-700 flex items-center"
                >
                  <FiPhone className="w-4 h-4 mr-2 text-emerald-600" />
                  Telefonnummer
                </Label>
                <TextInput
                  id="phone"
                  placeholder="+49 123 456789"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="role"
                  className="font-semibold text-gray-700 flex items-center"
                >
                  <FiSettings className="w-4 h-4 mr-2 text-emerald-600" />
                  Benutzerrolle *
                </Label>
                <Select
                  id="role"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="user">👤 Kunde</option>
                  <option value="agent">🏢 Agent/Vermieter</option>
                  <option value="admin">⚡ Administrator</option>
                </Select>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer className="bg-gray-50 border-0 flex justify-end space-x-4 p-6">
          <Button
            color="gray"
            onClick={() => setShowCreateUserModal(false)}
            className="px-6 py-3 font-medium"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleCreateUser}
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 border-0 px-6 py-3 font-medium shadow-lg"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Wird erstellt...
              </>
            ) : (
              <>
                <FiPlus className="w-4 h-4 mr-2" />
                Benutzer erstellen
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Vehicle Modal */}
      <Modal
        show={showCreateVehicleModal}
        onClose={() => {
          setShowCreateVehicleModal(false);
          setVehicleImage(null);
          setImagePreview(null);
        }}
        size="6xl"
        className="backdrop-blur-sm"
      >
        <Modal.Header className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-0">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
              <FiTruck className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">
              Neues Fahrzeug hinzufügen
            </span>
          </div>
        </Modal.Header>
        <Modal.Body className="bg-white p-8 max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleCreateVehicle} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FiTruck className="w-5 h-5 mr-2 text-emerald-600" />
                Grunddaten
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="vehicleName"
                    className="font-semibold text-gray-700"
                  >
                    Fahrzeugname *
                  </Label>
                  <TextInput
                    id="vehicleName"
                    placeholder="z.B. Luxury Wohnmobil XL"
                    value={newVehicle.name}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, name: e.target.value })
                    }
                    required
                    className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="vehicleCategory"
                    className="font-semibold text-gray-700"
                  >
                    Kategorie *
                  </Label>
                  <Select
                    id="vehicleCategory"
                    value={newVehicle.category}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, category: e.target.value })
                    }
                    className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  >
                    <option value="Wohnmobil">🚐 Wohnmobil</option>
                    <option value="Wohnwagen">🚛 Wohnwagen</option>
                    <option value="Kastenwagen">🚐 Kastenwagen</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Technical Data */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FiSettings className="w-5 h-5 mr-2 text-blue-600" />
                Technische Daten
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="brand"
                    className="font-semibold text-gray-700"
                  >
                    Marke *
                  </Label>
                  <TextInput
                    id="brand"
                    placeholder="z.B. Mercedes, Ford"
                    value={newVehicle.brand}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, brand: e.target.value })
                    }
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="model"
                    className="font-semibold text-gray-700"
                  >
                    Modell *
                  </Label>
                  <TextInput
                    id="model"
                    placeholder="z.B. Sprinter, Transit"
                    value={newVehicle.model}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, model: e.target.value })
                    }
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year" className="font-semibold text-gray-700">
                    Baujahr *
                  </Label>
                  <TextInput
                    id="year"
                    type="number"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    placeholder={new Date().getFullYear().toString()}
                    value={newVehicle.year}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, year: e.target.value })
                    }
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="fuelType"
                    className="font-semibold text-gray-700"
                  >
                    Kraftstofftyp *
                  </Label>
                  <Select
                    id="fuelType"
                    value={newVehicle.fuelType}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, fuelType: e.target.value })
                    }
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="Diesel">⛽ Diesel</option>
                    <option value="Benzin">⛽ Benzin</option>
                    <option value="Elektro">🔋 Elektro</option>
                    <option value="Hybrid">🔋 Hybrid</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="transmission"
                    className="font-semibold text-gray-700"
                  >
                    Getriebe *
                  </Label>
                  <Select
                    id="transmission"
                    value={newVehicle.transmission}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        transmission: e.target.value,
                      })
                    }
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="Manuell">🔧 Manuell</option>
                    <option value="Automatik">⚙️ Automatik</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Capacity & Pricing */}
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FiUsers className="w-5 h-5 mr-2 text-green-600" />
                Kapazität & Preise
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="seats"
                    className="font-semibold text-gray-700"
                  >
                    Sitzplätze *
                  </Label>
                  <TextInput
                    id="seats"
                    type="number"
                    min="1"
                    max="12"
                    placeholder="4"
                    value={newVehicle.seats}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, seats: e.target.value })
                    }
                    required
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beds" className="font-semibold text-gray-700">
                    Schlafplätze *
                  </Label>
                  <TextInput
                    id="beds"
                    type="number"
                    min="1"
                    max="8"
                    placeholder="2"
                    value={newVehicle.beds}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, beds: e.target.value })
                    }
                    required
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="pricePerDay"
                    className="font-semibold text-gray-700"
                  >
                    Preis pro Tag (€) *
                  </Label>
                  <TextInput
                    id="pricePerDay"
                    type="number"
                    min="1"
                    placeholder="80"
                    value={newVehicle.pricePerDay}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        pricePerDay: e.target.value,
                      })
                    }
                    required
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FiEdit className="w-5 h-5 mr-2 text-purple-600" />
                Beschreibung & Details
              </h3>
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="font-semibold text-gray-700"
                >
                  Fahrzeugbeschreibung
                </Label>
                <textarea
                  id="description"
                  rows="4"
                  placeholder="Beschreiben Sie die Ausstattung und Besonderheiten des Fahrzeugs..."
                  value={newVehicle.description}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-orange-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FiCamera className="w-5 h-5 mr-2 text-orange-600" />
                Fahrzeugbild
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="vehicleImage"
                    className="font-semibold text-gray-700"
                  >
                    Hauptbild des Fahrzeugs
                  </Label>
                  <input
                    type="file"
                    id="vehicleImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 transition-all duration-200"
                  />
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Bildvorschau:
                    </p>
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Fahrzeugvorschau"
                        className="w-48 h-32 object-cover rounded-lg border-2 border-orange-200 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setVehicleImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                        title="Bild entfernen"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                {uploadingImage && (
                  <div className="flex items-center space-x-2 text-orange-600">
                    <div className="animate-spin h-4 w-4 border-2 border-orange-600 border-r-transparent rounded-full"></div>
                    <span className="text-sm font-medium">
                      Bild wird hochgeladen...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer className="bg-gray-50 border-0 flex justify-end space-x-4 p-6">
          <Button
            color="gray"
            onClick={() => {
              setShowCreateVehicleModal(false);
              setVehicleImage(null);
              setImagePreview(null);
            }}
            className="px-6 py-3 font-medium"
            disabled={isLoading || uploadingImage}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleCreateVehicle}
            disabled={isLoading || uploadingImage}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 border-0 px-6 py-3 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || uploadingImage ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {uploadingImage
                  ? "Bild wird hochgeladen..."
                  : "Wird erstellt..."}
              </>
            ) : (
              <>
                <FiPlus className="w-4 h-4 mr-2" />
                Fahrzeug erstellen
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        show={showEditUserModal}
        onClose={() => {
          setShowEditUserModal(false);
          setSelectedUser(null);
        }}
        size="4xl"
        className="backdrop-blur-sm"
      >
        <Modal.Header className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-0">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
              <FiEdit className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold">Benutzer bearbeiten</h3>
          </div>
        </Modal.Header>
        <form onSubmit={handleUpdateUser}>
          <Modal.Body className="bg-gradient-to-br from-gray-50 to-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="editFirstName"
                  value="Vorname"
                  className="text-gray-700 font-medium mb-2"
                />
                <TextInput
                  id="editFirstName"
                  value={selectedUser?.firstName || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      firstName: e.target.value,
                    })
                  }
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="editLastName"
                  value="Nachname"
                  className="text-gray-700 font-medium mb-2"
                />
                <TextInput
                  id="editLastName"
                  value={selectedUser?.lastName || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      lastName: e.target.value,
                    })
                  }
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="editEmail"
                  value="E-Mail"
                  className="text-gray-700 font-medium mb-2"
                />
                <TextInput
                  id="editEmail"
                  type="email"
                  value={selectedUser?.email || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="editPhone"
                  value="Telefon"
                  className="text-gray-700 font-medium mb-2"
                />
                <TextInput
                  id="editPhone"
                  value={selectedUser?.phone || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, phone: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="editRole"
                  value="Rolle"
                  className="text-gray-700 font-medium mb-2"
                />
                <Select
                  id="editRole"
                  value={selectedUser?.role || "user"}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value })
                  }
                  className="mt-1"
                  required
                >
                  <option value="user">Benutzer</option>
                  <option value="agent">Agent</option>
                  <option value="admin">Administrator</option>
                </Select>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
            <Button
              type="button"
              onClick={() => {
                setShowEditUserModal(false);
                setSelectedUser(null);
              }}
              className="bg-gray-500 hover:bg-gray-600 border-0 px-6 py-3 font-medium"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 border-0 px-6 py-3 font-medium shadow-lg"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Wird aktualisiert...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4 mr-2" />
                  Speichern
                </>
              )}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        show={showDeleteUserModal}
        onClose={() => {
          setShowDeleteUserModal(false);
          setSelectedUser(null);
        }}
        size="md"
        className="backdrop-blur-sm"
      >
        <Modal.Header className="bg-gradient-to-r from-red-600 to-red-700 text-white border-0">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
              <FiTrash className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold">Benutzer löschen</h3>
          </div>
        </Modal.Header>
        <Modal.Body className="bg-gradient-to-br from-gray-50 to-white">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Benutzer wirklich löschen?
            </h3>
            <p className="text-gray-600 mb-4">
              Möchten Sie den Benutzer{" "}
              <strong>
                {selectedUser?.firstName} {selectedUser?.lastName}
              </strong>{" "}
              wirklich löschen? Diese Aktion kann nicht rückgängig gemacht
              werden.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm">
              <strong>Warnung:</strong> Alle zugehörigen Daten werden permanent
              gelöscht.
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
          <Button
            type="button"
            onClick={() => {
              setShowDeleteUserModal(false);
              setSelectedUser(null);
            }}
            className="bg-gray-500 hover:bg-gray-600 border-0 px-6 py-3 font-medium"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleDeleteUser}
            disabled={isLoading}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0 px-6 py-3 font-medium shadow-lg"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Wird gelöscht...
              </>
            ) : (
              <>
                <FiTrash className="w-4 h-4 mr-2" />
                Löschen
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* User Details Modal */}
      <Modal
        show={showUserDetailsModal}
        onClose={() => {
          setShowUserDetailsModal(false);
          setSelectedUser(null);
        }}
        size="4xl"
        className="backdrop-blur-sm"
      >
        <Modal.Header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
              <FiEye className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold">Benutzer Details</h3>
          </div>
        </Modal.Header>
        <Modal.Body className="bg-gradient-to-br from-gray-50 to-white">
          {selectedUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex items-center space-x-4 mb-6">
                <img
                  src={
                    selectedUser.profile?.avatar ||
                    `https://ui-avatars.com/api/?name=${selectedUser.firstName}+${selectedUser.lastName}&background=6366f1&color=fff&size=128`
                  }
                  alt="Avatar"
                  className="w-20 h-20 rounded-full ring-4 ring-blue-100"
                />
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h4>
                  <p className="text-gray-600 text-lg">{selectedUser.email}</p>
                  <Badge
                    color={
                      selectedUser.role === "admin"
                        ? "purple"
                        : selectedUser.role === "agent"
                        ? "blue"
                        : "green"
                    }
                    className="mt-2"
                  >
                    {selectedUser.role === "admin"
                      ? "Administrator"
                      : selectedUser.role === "agent"
                      ? "Agent"
                      : "Benutzer"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-medium">Telefon</Label>
                  <p className="text-gray-900 mt-1">
                    {selectedUser.phone || "Nicht angegeben"}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge color={selectedUser.isVerified ? "green" : "yellow"}>
                      {selectedUser.isVerified
                        ? "Verifiziert"
                        : "Nicht verifiziert"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-medium">
                    Registriert am
                  </Label>
                  <p className="text-gray-900 mt-1">
                    {new Date(
                      selectedUser.createdAt || Date.now()
                    ).toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">
                    Letzte Aktualisierung
                  </Label>
                  <p className="text-gray-900 mt-1">
                    {new Date(
                      selectedUser.updatedAt || Date.now()
                    ).toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
          <Button
            onClick={() => {
              setShowUserDetailsModal(false);
              setSelectedUser(null);
            }}
            className="bg-gray-500 hover:bg-gray-600 border-0 px-6 py-3 font-medium"
          >
            Schließen
          </Button>
          <Button
            onClick={() => {
              setShowUserDetailsModal(false);
              openEditUserModal(selectedUser);
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 border-0 px-6 py-3 font-medium shadow-lg"
          >
            <FiEdit className="w-4 h-4 mr-2" />
            Bearbeiten
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Vehicle CRUD Modals */}
      {/* Edit Vehicle Modal */}
      <Modal
        show={showEditVehicleModal}
        onClose={() => {
          setShowEditVehicleModal(false);
          setSelectedVehicle(null);
          setUpdateVehicleImage(null);
          setUpdateImagePreview(null);
        }}
        size="4xl"
        className="backdrop-blur-sm"
      >
        <Modal.Header className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-0">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
              <FiEdit className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold">Fahrzeug bearbeiten</h3>
          </div>
        </Modal.Header>
        <form onSubmit={handleUpdateVehicle}>
          <Modal.Body className="bg-gradient-to-br from-gray-50 to-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="editVehicleName"
                  value="Fahrzeugname"
                  className="text-gray-700 font-medium mb-2"
                />
                <TextInput
                  id="editVehicleName"
                  value={selectedVehicle?.name || ""}
                  onChange={(e) =>
                    setSelectedVehicle({
                      ...selectedVehicle,
                      name: e.target.value,
                    })
                  }
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="editVehicleCategory"
                  value="Kategorie"
                  className="text-gray-700 font-medium mb-2"
                />
                <Select
                  id="editVehicleCategory"
                  value={selectedVehicle?.category || ""}
                  onChange={(e) =>
                    setSelectedVehicle({
                      ...selectedVehicle,
                      category: e.target.value,
                    })
                  }
                  className="mt-1"
                  required
                >
                  <option value="Wohnmobil">Wohnmobil</option>
                  <option value="Kastenwagen">Kastenwagen</option>
                  <option value="Wohnwagen">Wohnwagen</option>
                  <option value="Luxus-Wohnmobil">Luxus-Wohnmobil</option>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="editVehicleBrand"
                  value="Marke"
                  className="text-gray-700 font-medium mb-2"
                />
                <TextInput
                  id="editVehicleBrand"
                  value={selectedVehicle?.technicalData?.brand || ""}
                  onChange={(e) =>
                    setSelectedVehicle({
                      ...selectedVehicle,
                      technicalData: {
                        ...selectedVehicle.technicalData,
                        brand: e.target.value,
                      },
                    })
                  }
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="editVehicleModel"
                  value="Modell"
                  className="text-gray-700 font-medium mb-2"
                />
                <TextInput
                  id="editVehicleModel"
                  value={selectedVehicle?.technicalData?.model || ""}
                  onChange={(e) =>
                    setSelectedVehicle({
                      ...selectedVehicle,
                      technicalData: {
                        ...selectedVehicle.technicalData,
                        model: e.target.value,
                      },
                    })
                  }
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="editVehicleSeats"
                  value="Sitzplätze"
                  className="text-gray-700 font-medium mb-2"
                />
                <TextInput
                  id="editVehicleSeats"
                  type="number"
                  value={selectedVehicle?.capacity?.seats || ""}
                  onChange={(e) =>
                    setSelectedVehicle({
                      ...selectedVehicle,
                      capacity: {
                        ...selectedVehicle.capacity,
                        seats: parseInt(e.target.value),
                      },
                    })
                  }
                  className="mt-1"
                  min="1"
                  max="12"
                />
              </div>
              <div>
                <Label
                  htmlFor="editVehiclePrice"
                  value="Preis pro Tag (€)"
                  className="text-gray-700 font-medium mb-2"
                />
                <TextInput
                  id="editVehiclePrice"
                  type="number"
                  value={selectedVehicle?.pricing?.basePrice?.perDay || ""}
                  onChange={(e) =>
                    setSelectedVehicle({
                      ...selectedVehicle,
                      pricing: {
                        ...selectedVehicle.pricing,
                        basePrice: {
                          ...selectedVehicle.pricing?.basePrice,
                          perDay: parseFloat(e.target.value),
                        },
                      },
                    })
                  }
                  className="mt-1"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="mt-6">
              <Label
                htmlFor="editVehicleDescription"
                value="Beschreibung"
                className="text-gray-700 font-medium mb-2"
              />
              <Textarea
                id="editVehicleDescription"
                value={selectedVehicle?.description || ""}
                onChange={(e) =>
                  setSelectedVehicle({
                    ...selectedVehicle,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Image Upload Section */}
            <div className="mt-6">
              <Label
                htmlFor="updateVehicleImage"
                value="Fahrzeugbild aktualisieren (optional)"
                className="text-gray-700 font-medium mb-2"
              />
              <div className="mt-2">
                <input
                  type="file"
                  id="updateVehicleImage"
                  accept="image/*"
                  onChange={handleUpdateImageChange}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                  {updateImagePreview ? (
                    <div className="relative">
                      <img
                        src={updateImagePreview}
                        alt="Neues Fahrzeugbild Vorschau"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setUpdateVehicleImage(null);
                          setUpdateImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : selectedVehicle?.images?.[0]?.url ? (
                    <div className="text-center">
                      <img
                        src={selectedVehicle.images[0].url}
                        alt="Aktuelles Fahrzeugbild"
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <label
                        htmlFor="updateVehicleImage"
                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
                      >
                        <FiCamera className="w-4 h-4 mr-2" />
                        Neues Bild hochladen
                      </label>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FiCamera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <label
                        htmlFor="updateVehicleImage"
                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
                      >
                        <FiCamera className="w-4 h-4 mr-2" />
                        Bild hochladen
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
            <Button
              type="button"
              onClick={() => {
                setShowEditVehicleModal(false);
                setSelectedVehicle(null);
                setUpdateVehicleImage(null);
                setUpdateImagePreview(null);
              }}
              className="bg-gray-500 hover:bg-gray-600 border-0 px-6 py-3 font-medium"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 border-0 px-6 py-3 font-medium shadow-lg"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Wird aktualisiert...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4 mr-2" />
                  Speichern
                </>
              )}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Delete Vehicle Modal */}
      <Modal
        show={showDeleteVehicleModal}
        onClose={() => {
          setShowDeleteVehicleModal(false);
          setSelectedVehicle(null);
        }}
        size="md"
        className="backdrop-blur-sm"
      >
        <Modal.Header className="bg-gradient-to-r from-red-600 to-red-700 text-white border-0">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
              <FiTrash className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold">Fahrzeug löschen</h3>
          </div>
        </Modal.Header>
        <Modal.Body className="bg-gradient-to-br from-gray-50 to-white">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Fahrzeug wirklich löschen?
            </h3>
            <p className="text-gray-600 mb-4">
              Möchten Sie das Fahrzeug <strong>{selectedVehicle?.name}</strong>{" "}
              wirklich löschen? Diese Aktion kann nicht rückgängig gemacht
              werden.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm">
              <strong>Warnung:</strong> Alle zugehörigen Buchungen und Daten
              werden gelöscht.
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
          <Button
            type="button"
            onClick={() => {
              setShowDeleteVehicleModal(false);
              setSelectedVehicle(null);
            }}
            className="bg-gray-500 hover:bg-gray-600 border-0 px-6 py-3 font-medium"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleDeleteVehicle}
            disabled={isLoading}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0 px-6 py-3 font-medium shadow-lg"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Wird gelöscht...
              </>
            ) : (
              <>
                <FiTrash className="w-4 h-4 mr-2" />
                Löschen
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Vehicle Details Modal */}
      <Modal
        show={showVehicleDetailsModal}
        onClose={() => {
          setShowVehicleDetailsModal(false);
          setSelectedVehicle(null);
        }}
        size="4xl"
        className="backdrop-blur-sm"
      >
        <Modal.Header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
              <FiEye className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold">Fahrzeug Details</h3>
          </div>
        </Modal.Header>
        <Modal.Body className="bg-gradient-to-br from-gray-50 to-white">
          {selectedVehicle && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FiTruck className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">
                    {selectedVehicle.name}
                  </h4>
                  <p className="text-gray-600 text-lg">
                    {selectedVehicle.technicalData?.brand}{" "}
                    {selectedVehicle.technicalData?.model}
                  </p>
                  <Badge
                    color={
                      selectedVehicle.category === "Wohnmobil"
                        ? "blue"
                        : selectedVehicle.category === "Kastenwagen"
                        ? "purple"
                        : "gray"
                    }
                    className="mt-2"
                  >
                    {selectedVehicle.category}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-medium">Kapazität</Label>
                  <p className="text-gray-900 mt-1">
                    {selectedVehicle.capacity?.seats || "N/A"} Sitzplätze
                  </p>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">
                    Preis pro Tag
                  </Label>
                  <p className="text-gray-900 mt-1">
                    €
                    {selectedVehicle.pricing?.basePrice?.perDay?.toLocaleString() ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge
                      color={
                        selectedVehicle.status === "aktiv" ||
                        selectedVehicle.availability?.isAvailable
                          ? "green"
                          : "yellow"
                      }
                    >
                      {selectedVehicle.status === "aktiv" ||
                      selectedVehicle.availability?.isAvailable
                        ? "Verfügbar"
                        : "Nicht verfügbar"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-medium">
                    Technische Daten
                  </Label>
                  <div className="mt-1 space-y-1">
                    <p className="text-gray-900">
                      Baujahr: {selectedVehicle.technicalData?.year || "N/A"}
                    </p>
                    <p className="text-gray-900">
                      Kraftstoff:{" "}
                      {selectedVehicle.technicalData?.fuelType || "N/A"}
                    </p>
                    <p className="text-gray-900">
                      Getriebe:{" "}
                      {selectedVehicle.technicalData?.transmission || "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">
                    Erstellt am
                  </Label>
                  <p className="text-gray-900 mt-1">
                    {new Date(
                      selectedVehicle.createdAt || Date.now()
                    ).toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {selectedVehicle.description && (
                <div className="md:col-span-2">
                  <Label className="text-gray-700 font-medium">
                    Beschreibung
                  </Label>
                  <p className="text-gray-900 mt-1">
                    {selectedVehicle.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
          <Button
            onClick={() => {
              setShowVehicleDetailsModal(false);
              setSelectedVehicle(null);
            }}
            className="bg-gray-500 hover:bg-gray-600 border-0 px-6 py-3 font-medium"
          >
            Schließen
          </Button>
          <Button
            onClick={() => {
              setShowVehicleDetailsModal(false);
              openEditVehicleModal(selectedVehicle);
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 border-0 px-6 py-3 font-medium shadow-lg"
          >
            <FiEdit className="w-4 h-4 mr-2" />
            Bearbeiten
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#374151",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
};

export default AdminDashboardPage;
