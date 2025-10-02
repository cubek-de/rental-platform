import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { profileService } from "../../services/profile";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiEdit3,
  FiSave,
  FiX,
  FiShield,
  FiCalendar,
  FiActivity,
  FiSettings,
  FiMapPin,
  FiCamera,
  FiLock,
  FiGlobe,
  FiBell,
  FiEye,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiZap,
  FiHeart,
  FiTruck,
  FiDollarSign,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const AdminProfilePage = () => {
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
      const response = await profileService.getUserStats();
      setStats(response.data);
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
    if (
      !profileData.firstName ||
      !profileData.lastName ||
      !profileData.email
    ) {
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

      const response = await profileService.updateProfile(updateData);
      setUser(response.data.user);

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
      toast.error("Die neuen Passwörter stimmen nicht überein");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Das neue Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }

    try {
      setIsLoading(true);
      await profileService.updatePassword(passwordData);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Passwort erfolgreich geändert!");
    } catch (error) {
      console.error("Password update error:", error);
      toast.error(
        error.response?.data?.message || "Fehler beim Ändern des Passworts"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Die Datei ist zu groß. Maximale Größe: 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Bitte wählen Sie eine Bilddatei aus");
      return;
    }

    try {
      setUploadingAvatar(true);
      const avatarUrl = await profileService.uploadAvatar(file);

      const updateData = { "profile.avatar": avatarUrl };
      const response = await profileService.updateProfile(updateData);
      setUser(response.data.user);

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
    { id: "settings", label: "Einstellungen", icon: FiSettings },
    { id: "stats", label: "Statistiken", icon: FiActivity },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 py-8">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-emerald-100 rounded-full px-6 py-3 mb-6 border border-emerald-200">
            <FiShield className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-800 font-medium">Administrator Portal</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Admin Profil
          </h1>
          <p className="text-gray-600 text-lg">
            Verwalten Sie Ihre Administrator-Informationen und Einstellungen
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-200">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-12 text-white relative">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
              <div className="absolute top-16 right-16 w-24 h-24 border border-white/20 rounded-full"></div>
              <div className="absolute bottom-8 left-1/3 w-16 h-16 border border-white/20 rounded-full"></div>
            </div>

            <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Avatar Section */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/30 shadow-2xl">
                  {user?.profile?.avatar ? (
                    <img
                      src={user.profile.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </span>
                  )}
                </div>

                {/* Camera Icon for Upload */}
                <label className="absolute bottom-2 right-2 w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors shadow-lg border-2 border-white">
                  <FiCamera className="w-5 h-5 text-white" />
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
                    <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="text-center lg:text-left flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-emerald-100 text-xl font-medium mb-4">System Administrator</p>
                
                {/* Status Badges */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                  <div className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    <FiAward className="w-4 h-4 inline mr-2" />
                    Elite Admin
                  </div>
                  <div className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    <FiCalendar className="w-4 h-4 inline mr-2" />
                    Seit {new Date(user?.createdAt).toLocaleDateString("de-DE")}
                  </div>
                  <div className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    <FiActivity className="w-4 h-4 inline mr-2" />
                    Online
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
                    <div className="text-emerald-100 text-sm">Benutzer</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats?.totalVehicles || 0}</div>
                    <div className="text-emerald-100 text-sm">Fahrzeuge</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats?.totalBookings || 0}</div>
                    <div className="text-emerald-100 text-sm">Buchungen</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-6 font-medium text-sm transition-all duration-300 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              {/* Actions */}
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <FiUser className="w-6 h-6 text-emerald-600" />
                  Persönliche Informationen
                </h3>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <FiEdit3 className="w-4 h-4" />
                    Bearbeiten
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl"
                    >
                      <FiSave className="w-4 h-4" />
                      Speichern
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <FiX className="w-4 h-4" />
                      Abbrechen
                    </button>
                  </div>
                )}
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vorname *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        disabled={!isEditing}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                        placeholder="Ihr Vorname"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nachname *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        disabled={!isEditing}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                        placeholder="Ihr Nachname"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      E-Mail-Adresse *
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        disabled={!isEditing}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                        placeholder="ihre.email@beispiel.de"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Telefonnummer
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        value={profileData["profile.phone"]}
                        onChange={(e) => handleInputChange("profile.phone", e.target.value)}
                        disabled={!isEditing}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                        placeholder="+49 123 456789"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Straße & Hausnummer
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={profileData["profile.address.street"]}
                        onChange={(e) => handleInputChange("profile.address.street", e.target.value)}
                        disabled={!isEditing}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                        placeholder="Musterstraße 123"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        PLZ
                      </label>
                      <input
                        type="text"
                        value={profileData["profile.address.postalCode"]}
                        onChange={(e) => handleInputChange("profile.address.postalCode", e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                        placeholder="12345"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Stadt
                      </label>
                      <input
                        type="text"
                        value={profileData["profile.address.city"]}
                        onChange={(e) => handleInputChange("profile.address.city", e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                        placeholder="Berlin"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Land
                    </label>
                    <div className="relative">
                      <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={profileData["profile.address.country"]}
                        onChange={(e) => handleInputChange("profile.address.country", e.target.value)}
                        disabled={!isEditing}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300 appearance-none"
                      >
                        <option value="Deutschland">Deutschland</option>
                        <option value="Österreich">Österreich</option>
                        <option value="Schweiz">Schweiz</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sprache
                    </label>
                    <select
                      value={profileData["profile.language"]}
                      onChange={(e) => handleInputChange("profile.language", e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300 appearance-none"
                    >
                      <option value="de">Deutsch</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FiShield className="w-6 h-6 text-emerald-600" />
                Sicherheit & Passwort
              </h3>

              {/* Password Change Section */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiLock className="w-5 h-5 text-emerald-600" />
                  Passwort ändern
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Aktuelles Passwort *
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                        placeholder="Aktuelles Passwort"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Neues Passwort *
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                        placeholder="Neues Passwort"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Passwort bestätigen *
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                        placeholder="Passwort bestätigen"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePasswordUpdate}
                  disabled={isLoading}
                  className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  <FiSave className="w-4 h-4" />
                  Passwort aktualisieren
                </button>
              </div>

              {/* Security Features */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiShield className="w-5 h-5 text-green-600" />
                    Zwei-Faktor-Authentifizierung
                  </h5>
                  <p className="text-gray-600 mb-4">
                    Zusätzliche Sicherheitsebene für Ihr Administrator-Konto
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      Nicht aktiviert
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiActivity className="w-5 h-5 text-blue-600" />
                    Login-Aktivitäten
                  </h5>
                  <p className="text-gray-600 mb-4">
                    Überwachen Sie alle Anmeldungen in Ihr Konto
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Letzte Anmeldung</span>
                    <span className="text-sm text-gray-500">Heute, 09:42</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FiSettings className="w-6 h-6 text-emerald-600" />
                Benachrichtigungen & Einstellungen
              </h3>

              {/* Notification Preferences */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FiBell className="w-5 h-5 text-emerald-600" />
                  Benachrichtigungseinstellungen
                </h4>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <h5 className="font-semibold text-gray-900">E-Mail Benachrichtigungen</h5>
                      <p className="text-sm text-gray-600">Erhalten Sie wichtige Updates per E-Mail</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData["preferences.emailNotifications"]}
                        onChange={(e) => handleInputChange("preferences.emailNotifications", e.target.checked)}
                        disabled={!isEditing}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <h5 className="font-semibold text-gray-900">SMS Benachrichtigungen</h5>
                      <p className="text-sm text-gray-600">Erhalten Sie Benachrichtigungen per SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData["preferences.smsNotifications"]}
                        onChange={(e) => handleInputChange("preferences.smsNotifications", e.target.checked)}
                        disabled={!isEditing}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <h5 className="font-semibold text-gray-900">Newsletter</h5>
                      <p className="text-sm text-gray-600">Bleiben Sie über neue Features informiert</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData["preferences.newsletter"]}
                        onChange={(e) => handleInputChange("preferences.newsletter", e.target.checked)}
                        disabled={!isEditing}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === "stats" && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FiActivity className="w-6 h-6 text-emerald-600" />
                Administrator Statistiken
              </h3>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <FiUsers className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                      <div className="text-blue-100 text-sm">Benutzer</div>
                    </div>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <FiTrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+12% diesen Monat</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <FiTruck className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{stats?.totalVehicles || 0}</div>
                      <div className="text-emerald-100 text-sm">Fahrzeuge</div>
                    </div>
                  </div>
                  <div className="flex items-center text-emerald-100">
                    <FiTrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+8% diesen Monat</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <FiCalendar className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
                      <div className="text-purple-100 text-sm">Buchungen</div>
                    </div>
                  </div>
                  <div className="flex items-center text-purple-100">
                    <FiTrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+15% diesen Monat</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <FiDollarSign className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">€{stats?.monthlyRevenue || 0}</div>
                      <div className="text-orange-100 text-sm">Umsatz</div>
                    </div>
                  </div>
                  <div className="flex items-center text-orange-100">
                    <FiTrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+22% diesen Monat</span>
                  </div>
                </div>
              </div>

              {/* Activity Overview */}
              <div className="bg-gradient-to-r from-gray-50 to-emerald-50 rounded-2xl p-8 border border-emerald-200">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiActivity className="w-5 h-5 text-emerald-600" />
                  Aktivitäts-Übersicht
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCheck className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats?.approvedBookings || 0}</div>
                    <div className="text-gray-600">Genehmigte Buchungen</div>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiEye className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats?.reviewedVehicles || 0}</div>
                    <div className="text-gray-600">Geprüfte Fahrzeuge</div>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiAlertCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats?.pendingActions || 0}</div>
                    <div className="text-gray-600">Ausstehende Aktionen</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;