import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import toast, { Toaster } from "react-hot-toast";
import {
  HiTruck,
  HiUser,
  HiCalendar,
  HiClock,
  HiHeart,
  HiStar,
  HiCog,
  HiBell,
  HiSearch,
  HiChevronDown,
  HiLogout,
  HiChartBar,
  HiChevronRight,
} from "react-icons/hi";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiEdit3,
  FiSave,
  FiX,
  FiSettings,
  FiMapPin,
  FiActivity,
  FiCalendar as FiCalendarIcon,
  FiCreditCard,
  FiFileText,
} from "react-icons/fi";

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [userBookings, setUserBookings] = useState([]);
  const [vehicleStats, setVehicleStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Profile states
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    "profile.phone": user?.profile?.phone || "",
    "profile.address.street": user?.profile?.address?.street || "",
    "profile.address.city": user?.profile?.address?.city || "",
    "profile.address.postalCode": user?.profile?.address?.postalCode || "",
    "profile.address.country": user?.profile?.address?.country || "Deutschland",
    "profile.drivingLicense.number":
      user?.profile?.drivingLicense?.number || "",
    "profile.drivingLicense.expiryDate":
      user?.profile?.drivingLicense?.expiryDate || "",
    "profile.dateOfBirth": user?.profile?.dateOfBirth || "",
    "preferences.newsletter": user?.preferences?.newsletter ?? true,
    "preferences.smsNotifications":
      user?.preferences?.smsNotifications ?? false,
    "preferences.emailNotifications":
      user?.preferences?.emailNotifications ?? true,
  });

  useEffect(() => {
    if (user && activeSection === "dashboard") {
      fetchUserBookings();
    }
  }, [user, activeSection]);

  const fetchUserBookings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/bookings/my-bookings");
      const bookings = response.data.data?.bookings || response.data.data || [];
      setUserBookings(bookings);

      setVehicleStats({
        totalBookings: bookings.length,
        activeBookings: bookings.filter(
          (b) => b.status === "active" || b.status === "confirmed"
        ).length,
        completedBookings: bookings.filter((b) => b.status === "completed")
          .length,
        pendingBookings: bookings.filter((b) => b.status === "pending").length,
      });
    } catch (error) {
      console.error("Error fetching user bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
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
          drivingLicense: {
            number: profileData["profile.drivingLicense.number"],
            expiryDate: profileData["profile.drivingLicense.expiryDate"],
          },
          dateOfBirth: profileData["profile.dateOfBirth"],
        },
        preferences: {
          newsletter: profileData["preferences.newsletter"],
          smsNotifications: profileData["preferences.smsNotifications"],
          emailNotifications: profileData["preferences.emailNotifications"],
        },
      };

      await api.put("/api/auth/update-profile", updateData);
      toast.success("Profil erfolgreich aktualisiert!");
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Fehler beim Aktualisieren des Profils");
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileContent = () => {
    const tabs = [
      { id: "profile", label: "Profil", icon: FiUser },
      { id: "license", label: "Führerschein", icon: FiCreditCard },
      { id: "preferences", label: "Einstellungen", icon: FiSettings },
    ];

    return (
      <div className="max-w-6xl mx-auto">
        <Toaster position="top-right" />

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Mein Profil</h2>
          <p className="text-gray-600">
            Verwalten Sie Ihre persönlichen Informationen und Einstellungen
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 mb-8 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-gray-600 text-lg">{user?.email}</p>
                <div className="flex items-center mt-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-green-600 font-medium">Online</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                isEditing
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg"
              }`}
            >
              {isEditing ? (
                <FiX className="w-4 h-4" />
              ) : (
                <FiEdit3 className="w-4 h-4" />
              )}
              {isEditing ? "Abbrechen" : "Bearbeiten"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
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
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FiUser className="w-5 h-5 text-emerald-600" />
                Persönliche Informationen
              </h3>

              {/* Personal Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
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
                      placeholder="Max"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                      {profileData.firstName || "Nicht angegeben"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
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
                      placeholder="Mustermann"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                      {profileData.lastName || "Nicht angegeben"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
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
                      placeholder="max@mustermann.de"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                      {profileData.email || "Nicht angegeben"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
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
                      placeholder="+49 123 456789"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                      {profileData["profile.phone"] || "Nicht angegeben"}
                    </div>
                  )}
                </div>
              </div>

              {/* Address Section */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiMapPin className="w-5 h-5 text-emerald-600" />
                  Adresse
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="Musterstraße 123"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800 font-medium">
                        {profileData["profile.address.street"] ||
                          "Nicht angegeben"}
                      </div>
                    )}
                  </div>

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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="Musterstadt"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800 font-medium">
                        {profileData["profile.address.city"] ||
                          "Nicht angegeben"}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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

          {/* License Tab */}
          {activeTab === "license" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FiCreditCard className="w-5 h-5 text-emerald-600" />
                Führerschein Informationen
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="B123456789"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800 font-medium">
                      {profileData["profile.drivingLicense.number"] ||
                        "Nicht angegeben"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Gültig bis
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={
                        profileData["profile.drivingLicense.expiryDate"]
                          ? new Date(
                              profileData["profile.drivingLicense.expiryDate"]
                            )
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "profile.drivingLicense.expiryDate",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800 font-medium">
                      {profileData["profile.drivingLicense.expiryDate"]
                        ? new Date(
                            profileData["profile.drivingLicense.expiryDate"]
                          ).toLocaleDateString("de-DE")
                        : "Nicht angegeben"}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4" />
                  {isLoading ? "Speichern..." : "Speichern"}
                </button>
              )}
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FiSettings className="w-5 h-5 text-emerald-600" />
                Benachrichtigungseinstellungen
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <h5 className="font-medium text-gray-800">
                      E-Mail-Benachrichtigungen
                    </h5>
                    <p className="text-sm text-gray-600">
                      Erhalten Sie Updates zu Ihren Buchungen per E-Mail
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

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <h5 className="font-medium text-gray-800">Newsletter</h5>
                    <p className="text-sm text-gray-600">
                      Bleiben Sie über neue Angebote und Features informiert
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

              <button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                <FiSave className="w-4 h-4" />
                {isLoading
                  ? "Einstellungen werden gespeichert..."
                  : "Einstellungen speichern"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileContent();
      case "bookings":
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Meine Buchungen
            </h2>

            {/* Stats Cards */}
            {vehicleStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Gesamt</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {vehicleStats.totalBookings}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <HiCalendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Aktiv</p>
                      <p className="text-3xl font-bold text-green-600">
                        {vehicleStats.activeBookings}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <HiClock className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Abgeschlossen</p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {vehicleStats.completedBookings}
                      </p>
                    </div>
                    <div className="bg-emerald-100 p-3 rounded-full">
                      <HiStar className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Wartend</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {vehicleStats.pendingBookings}
                      </p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-full">
                      <HiClock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bookings List */}
            <div className="bg-white rounded-xl shadow-lg border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">
                  Alle Buchungen
                </h3>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <p className="text-center text-gray-500">Lade Buchungen...</p>
                ) : userBookings.length > 0 ? (
                  <div className="space-y-4">
                    {userBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {booking.vehicle
                                ? booking.vehicle.make +
                                  " " +
                                  booking.vehicle.model
                                : "Fahrzeug nicht verfügbar"}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(booking.startDate).toLocaleDateString(
                                "de-DE"
                              )}{" "}
                              -{" "}
                              {new Date(booking.endDate).toLocaleDateString(
                                "de-DE"
                              )}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Gesamt: €{booking.totalPrice}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "active"
                                ? "bg-blue-100 text-blue-800"
                                : booking.status === "completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : booking.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {booking.status === "confirmed"
                              ? "Bestätigt"
                              : booking.status === "active"
                              ? "Aktiv"
                              : booking.status === "completed"
                              ? "Abgeschlossen"
                              : booking.status === "cancelled"
                              ? "Storniert"
                              : "Wartend"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HiCalendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      Noch keine Buchungen vorhanden
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Einstellungen
            </h2>
            <div className="bg-white rounded-xl shadow-lg border p-8">
              <p className="text-gray-500">
                Einstellungen werden hier angezeigt...
              </p>
            </div>
          </div>
        );
      case "favorites":
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Meine Favoriten
            </h2>
            <div className="bg-white rounded-xl shadow-lg border p-8">
              <p className="text-gray-500">
                Ihre Favoriten werden hier angezeigt...
              </p>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Benachrichtigungen
            </h2>
            <div className="bg-white rounded-xl shadow-lg border p-8">
              <p className="text-gray-500">
                Benachrichtigungen werden hier angezeigt...
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Willkommen zurück, {user?.firstName}!
                  </h2>
                  <p className="text-white/80 text-lg">
                    Verwalten Sie Ihre Buchungen und entdecken Sie neue
                    Fahrzeuge
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                    <HiTruck className="w-16 h-16 text-white/80" />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">Gesamt Buchungen</p>
                      <p className="text-2xl font-bold text-white">
                        {vehicleStats?.totalBookings || 0}
                      </p>
                    </div>
                    <HiCalendar className="w-8 h-8 text-white/60" />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">Aktive Buchungen</p>
                      <p className="text-2xl font-bold text-white">
                        {vehicleStats?.activeBookings || 0}
                      </p>
                    </div>
                    <HiClock className="w-8 h-8 text-white/60" />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">Abgeschlossen</p>
                      <p className="text-2xl font-bold text-white">
                        {vehicleStats?.completedBookings || 0}
                      </p>
                    </div>
                    <HiStar className="w-8 h-8 text-white/60" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <HiSearch className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Fahrzeuge suchen
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Neue Fahrzeuge entdecken
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => (window.location.href = "/vehicles")}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Durchsuchen →
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <HiCalendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Buchungen verwalten
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Alle Buchungen anzeigen
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveSection("bookings")}
                  className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Verwalten →
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <HiHeart className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Meine Favoriten
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Gespeicherte Fahrzeuge
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveSection("favorites")}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Anzeigen →
                </button>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-8 py-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <HiCalendar className="w-7 h-7 text-emerald-600" />
                      Neueste Buchungen
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Ihre letzten Fahrzeugbuchungen im Überblick
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSection("bookings")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2"
                  >
                    Alle anzeigen
                    <HiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                    <p className="ml-4 text-gray-500 font-medium">
                      Lade Buchungen...
                    </p>
                  </div>
                ) : userBookings.slice(0, 3).length > 0 ? (
                  <div className="space-y-4">
                    {userBookings.slice(0, 3).map((booking, index) => (
                      <div
                        key={booking._id}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-emerald-300 group"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                              <HiTruck className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-gray-900 group-hover:text-emerald-700 transition-colors">
                                {booking.vehicle
                                  ? `${booking.vehicle.make} ${booking.vehicle.model}`
                                  : "Fahrzeug nicht verfügbar"}
                              </h4>
                              <div className="flex items-center text-gray-600 mt-2 space-x-4">
                                <div className="flex items-center">
                                  <FiCalendarIcon className="w-4 h-4 mr-2" />
                                  <span className="text-sm">
                                    {new Date(
                                      booking.startDate
                                    ).toLocaleDateString("de-DE")}
                                    {" - "}
                                    {new Date(
                                      booking.endDate
                                    ).toLocaleDateString("de-DE")}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center mt-2">
                                <FiCreditCard className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="font-semibold text-emerald-600">
                                  €{booking.totalPrice}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span
                              className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : booking.status === "active"
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : booking.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : booking.status === "cancelled"
                                  ? "bg-red-100 text-red-800 border border-red-200"
                                  : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              }`}
                            >
                              {booking.status === "confirmed"
                                ? "Bestätigt"
                                : booking.status === "active"
                                ? "Aktiv"
                                : booking.status === "completed"
                                ? "Abgeschlossen"
                                : booking.status === "cancelled"
                                ? "Storniert"
                                : "Wartend"}
                            </span>
                            <p className="text-xs text-gray-400">
                              Buchung #{index + 1}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <HiCalendar className="w-12 h-12 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      Noch keine Buchungen vorhanden
                    </h4>
                    <p className="text-gray-500 mb-8">
                      Starten Sie Ihr erstes Abenteuer mit unseren Fahrzeugen
                    </p>
                    <button
                      onClick={() => (window.location.href = "/vehicles")}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-3 mx-auto"
                    >
                      <HiSearch className="w-5 h-5" />
                      Fahrzeuge durchsuchen
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  const SidebarItem = ({ icon, label, active, onClick, badge }) => {
    const IconComponent = icon;
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center px-6 py-4 text-left transition-all duration-300 group relative ${
          active
            ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border-l-4 border-white/50"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        }`}
      >
        <IconComponent
          className={`w-5 h-5 mr-4 transition-all duration-300 ${
            active
              ? "text-white scale-110"
              : "text-white/70 group-hover:text-white group-hover:scale-105"
          }`}
        />
        <span
          className={`font-medium transition-all duration-300 ${
            active ? "text-white" : "text-white/80 group-hover:text-white"
          }`}
        >
          {label}
        </span>
        {badge && (
          <span className="ml-auto bg-white/20 text-white text-xs px-2 py-1 rounded-full font-semibold">
            {badge}
          </span>
        )}
        {active && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white/50 rounded-l-full"></div>
        )}
      </button>
    );
  };

  const Header = () => (
    <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeSection === "dashboard" && "Dashboard"}
              {activeSection === "profile" && "Mein Profil"}
              {activeSection === "bookings" && "Meine Buchungen"}
              {activeSection === "favorites" && "Meine Favoriten"}
              {activeSection === "settings" && "Einstellungen"}
              {activeSection === "notifications" && "Benachrichtigungen"}
            </h1>
            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full">
              Kunde
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
              title="Abmelden"
            >
              <HiLogout className="w-5 h-5" />
            </button>
          </div>
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
        {/* Logo and User Portal Badge */}
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

          {/* User Portal Badge */}
          <div className="flex justify-center">
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 shadow-lg">
              <span className="text-white font-bold text-sm tracking-wide">
                Kunden Portal
              </span>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="mb-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm truncate">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-white/70 text-xs truncate">{user?.email}</p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-white/80 text-xs font-medium">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          <div className="mb-6">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider px-6 mb-3">
              Hauptmenü
            </p>
            <SidebarItem
              icon={HiChartBar}
              label="Dashboard"
              active={activeSection === "dashboard"}
              onClick={() => setActiveSection("dashboard")}
            />
            <SidebarItem
              icon={HiUser}
              label="Mein Profil"
              active={activeSection === "profile"}
              onClick={() => setActiveSection("profile")}
            />
            <SidebarItem
              icon={HiCalendar}
              label="Meine Buchungen"
              active={activeSection === "bookings"}
              onClick={() => setActiveSection("bookings")}
              badge={vehicleStats?.totalBookings || 0}
            />
            <SidebarItem
              icon={HiHeart}
              label="Favoriten"
              active={activeSection === "favorites"}
              onClick={() => setActiveSection("favorites")}
            />
          </div>

          <div className="border-t border-white/20 pt-4">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider px-6 mb-3">
              Einstellungen
            </p>
            <SidebarItem
              icon={HiCog}
              label="Einstellungen"
              active={activeSection === "settings"}
              onClick={() => setActiveSection("settings")}
            />
            <SidebarItem
              icon={HiBell}
              label="Benachrichtigungen"
              active={activeSection === "notifications"}
              onClick={() => setActiveSection("notifications")}
            />
          </div>
        </nav>

        {/* Bottom Section - Logout */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <button
            onClick={logout}
            className="w-full flex items-center px-6 py-4 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 group"
          >
            <HiLogout className="w-5 h-5 mr-4 transition-all duration-300 group-hover:scale-110" />
            <span className="font-medium">Abmelden</span>
          </button>
        </div>

        {/* Version Info */}
        <div className="mt-4 px-6 py-2 text-center">
          <p className="text-white/40 text-xs">FAIRmietung v2.0</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <Toaster position="top-right" />
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
