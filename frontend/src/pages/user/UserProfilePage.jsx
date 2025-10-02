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
  FiCreditCard,
  FiBookOpen,
  FiHeart,
  FiCar,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const UserProfilePage = () => {
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
    "profile.drivingLicense.number":
      user?.profile?.drivingLicense?.number || "",
    "profile.drivingLicense.issueDate":
      user?.profile?.drivingLicense?.issueDate || "",
    "profile.drivingLicense.expiryDate":
      user?.profile?.drivingLicense?.expiryDate || "",
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
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    try {
      setIsLoading(true);

      // Transform nested object structure for API
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
          drivingLicense: {
            number: profileData["profile.drivingLicense.number"],
            issueDate: profileData["profile.drivingLicense.issueDate"],
            expiryDate: profileData["profile.drivingLicense.expiryDate"],
          },
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
      toast.error("Neue Passwörter stimmen nicht überein");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Neues Passwort muss mindestens 8 Zeichen haben");
      return;
    }

    try {
      setIsLoading(true);
      await profileService.changePassword({
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
      const avatarUrl = await profileService.uploadAvatar(file);

      // Update user profile with new avatar
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
      "profile.drivingLicense.number":
        user?.profile?.drivingLicense?.number || "",
      "profile.drivingLicense.issueDate":
        user?.profile?.drivingLicense?.issueDate || "",
      "profile.drivingLicense.expiryDate":
        user?.profile?.drivingLicense?.expiryDate || "",
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
    { id: "bookings", label: "Meine Buchungen", icon: FiBookOpen },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mein Profil</h1>
          <p className="text-gray-600">
            Verwalten Sie Ihre persönlichen Informationen und Einstellungen
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 px-8 py-12 text-white relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
              <div className="absolute top-20 right-20 w-24 h-24 border border-white/20 rounded-full"></div>
              <div className="absolute bottom-10 left-1/3 w-16 h-16 border border-white/20 rounded-full"></div>
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.profile?.avatar ? (
                      <img
                        src={user.profile.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-14 h-14 text-white" />
                    )}
                  </div>

                  {/* Avatar Upload Button */}
                  <label className="absolute bottom-0 right-0 bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg">
                    <FiCamera className="w-4 h-4" />
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

                <div>
                  <h2 className="text-3xl font-bold">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-emerald-100 text-lg">Premium Kunde</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      <FiStar className="w-4 h-4 inline mr-1" />
                      Kunde
                    </span>
                    <span className="bg-emerald-500/50 text-white px-3 py-1 rounded-full text-sm">
                      <FiCalendar className="w-4 h-4 inline mr-1" />
                      Mitglied seit{" "}
                      {new Date(user?.createdAt).toLocaleDateString("de-DE")}
                    </span>
                    <span className="bg-green-500/50 text-white px-3 py-1 rounded-full text-sm">
                      <FiActivity className="w-4 h-4 inline mr-1" />
                      Online
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              {stats && (
                <div className="hidden lg:flex space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {stats.totalBookings || 0}
                    </div>
                    <div className="text-emerald-200 text-sm">Buchungen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      €{stats.totalSpent || 0}
                    </div>
                    <div className="text-emerald-200 text-sm">Ausgegeben</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {stats.favoriteVehicles || 0}
                    </div>
                    <div className="text-emerald-200 text-sm">Favoriten</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-emerald-500 text-emerald-600"
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
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              {/* Actions */}
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <FiUser className="w-6 h-6 text-emerald-600" />
                  Persönliche Informationen
                </h3>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <FiEdit3 className="w-4 h-4" />
                    Bearbeiten
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl"
                    >
                      <FiSave className="w-4 h-4" />
                      {isLoading ? "Speichern..." : "Speichern"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <FiX className="w-4 h-4" />
                      Abbrechen
                    </button>
                  </div>
                )}
              </div>

              {/* Basic Information */}
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Ihr Vorname"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Ihr Nachname"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
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
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="ihre.email@beispiel.de"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="+49 123 456 7890"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                      {profileData["profile.phone"] || "Nicht angegeben"}
                    </div>
                  )}
                </div>
              </div>

              {/* Address Section */}
              <div className="border-t pt-8">
                <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <FiMapPin className="w-5 h-5 text-emerald-600" />
                  Adresse
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="Musterstraße 123"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                        {profileData["profile.address.street"] ||
                          "Nicht angegeben"}
                      </div>
                    )}
                  </div>

                  {/* Postal Code */}
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="12345"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                        {profileData["profile.address.postalCode"] ||
                          "Nicht angegeben"}
                      </div>
                    )}
                  </div>

                  {/* City */}
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="Musterstadt"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                        {profileData["profile.address.city"] ||
                          "Nicht angegeben"}
                      </div>
                    )}
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <FiGlobe className="w-4 h-4" />
                      Land
                    </label>
                    {isEditing ? (
                      <select
                        value={profileData["profile.address.country"]}
                        onChange={(e) =>
                          handleInputChange(
                            "profile.address.country",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      >
                        <option value="Deutschland">Deutschland</option>
                        <option value="Österreich">Österreich</option>
                        <option value="Schweiz">Schweiz</option>
                        <option value="Niederlande">Niederlande</option>
                        <option value="Frankreich">Frankreich</option>
                      </select>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                        {profileData["profile.address.country"] ||
                          "Deutschland"}
                      </div>
                    )}
                  </div>

                  {/* Language */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <FiGlobe className="w-4 h-4" />
                      Sprache
                    </label>
                    {isEditing ? (
                      <select
                        value={profileData["profile.language"]}
                        onChange={(e) =>
                          handleInputChange("profile.language", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      >
                        <option value="de">Deutsch</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="es">Español</option>
                      </select>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                        {profileData["profile.language"] === "de"
                          ? "Deutsch"
                          : profileData["profile.language"] === "en"
                          ? "English"
                          : profileData["profile.language"] === "fr"
                          ? "Français"
                          : profileData["profile.language"] === "es"
                          ? "Español"
                          : "Deutsch"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Driving License Section */}
              <div className="border-t pt-8">
                <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <FiCreditCard className="w-5 h-5 text-emerald-600" />
                  Führerschein-Informationen
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* License Number */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Führerscheinnummer
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData["profile.drivingLicense.number"]}
                        onChange={(e) =>
                          handleInputChange(
                            "profile.drivingLicense.number",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="B123456789"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                        {profileData["profile.drivingLicense.number"] ||
                          "Nicht angegeben"}
                      </div>
                    )}
                  </div>

                  {/* Issue Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Ausstellungsdatum
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={profileData["profile.drivingLicense.issueDate"]}
                        onChange={(e) =>
                          handleInputChange(
                            "profile.drivingLicense.issueDate",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                        {profileData["profile.drivingLicense.issueDate"]
                          ? new Date(
                              profileData["profile.drivingLicense.issueDate"]
                            ).toLocaleDateString("de-DE")
                          : "Nicht angegeben"}
                      </div>
                    )}
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Ablaufdatum
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={profileData["profile.drivingLicense.expiryDate"]}
                        onChange={(e) =>
                          handleInputChange(
                            "profile.drivingLicense.expiryDate",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                        {profileData["profile.drivingLicense.expiryDate"]
                          ? new Date(
                              profileData["profile.drivingLicense.expiryDate"]
                            ).toLocaleDateString("de-DE")
                          : "Nicht angegeben"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-8">
              <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <FiShield className="w-6 h-6 text-emerald-600" />
                Sicherheitseinstellungen
              </h3>

              {/* Password Change */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiLock className="w-5 h-5 text-emerald-600" />
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Passwort bestätigen"
                    />
                  </div>
                </div>

                <button
                  onClick={handlePasswordUpdate}
                  disabled={isLoading}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                >
                  <FiLock className="w-4 h-4" />
                  {isLoading ? "Passwort wird geändert..." : "Passwort ändern"}
                </button>
              </div>

              {/* Security Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <FiShield className="w-5 h-5" />
                    Konto-Status
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-green-700">E-Mail verifiziert</span>
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">
                        {user?.security?.emailVerified ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-700">Konto aktiv</span>
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">
                        {user?.status === "active" ? "✓" : "✗"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                    <FiActivity className="w-5 h-5" />
                    Letzte Aktivität
                  </h4>
                  <div className="space-y-2">
                    <div className="text-emerald-700">
                      <strong>Letzte Anmeldung:</strong>
                      <br />
                      {user?.security?.lastLogin
                        ? new Date(user.security.lastLogin).toLocaleString(
                            "de-DE"
                          )
                        : "Nie"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-8">
              <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <FiSettings className="w-6 h-6 text-emerald-600" />
                Einstellungen & Präferenzen
              </h3>

              {/* Notification Settings */}
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-6 border border-teal-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiBell className="w-5 h-5 text-teal-600" />
                  Benachrichtigungseinstellungen
                </h4>

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
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
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
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
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
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                {/* Save Settings Button */}
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="mt-6 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4" />
                  {isLoading
                    ? "Einstellungen werden gespeichert..."
                    : "Einstellungen speichern"}
                </button>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="space-y-8">
              <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <FiBookOpen className="w-6 h-6 text-emerald-600" />
                Meine Buchungen
              </h3>

              {/* Booking Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Bookings */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100">Gesamte Buchungen</p>
                      <p className="text-3xl font-bold">
                        {stats?.totalBookings || 0}
                      </p>
                    </div>
                    <FiBookOpen className="w-8 h-8 text-emerald-200" />
                  </div>
                </div>

                {/* Total Spent */}
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-teal-100">Gesamt ausgegeben</p>
                      <p className="text-3xl font-bold">
                        €{stats?.totalSpent || 0}
                      </p>
                    </div>
                    <FiCreditCard className="w-8 h-8 text-teal-200" />
                  </div>
                </div>

                {/* Favorite Vehicles */}
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100">Lieblings-Fahrzeuge</p>
                      <p className="text-3xl font-bold">
                        {stats?.favoriteVehicles || 0}
                      </p>
                    </div>
                    <FiHeart className="w-8 h-8 text-yellow-200" />
                  </div>
                </div>
              </div>

              {/* Recent Bookings Placeholder */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiCar className="w-5 h-5 text-gray-600" />
                  Aktuelle Buchungen
                </h4>

                <div className="text-center py-8">
                  <FiBookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Keine aktuellen Buchungen
                  </p>
                  <p className="text-sm text-gray-500">
                    Ihre Buchungen werden hier angezeigt
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
