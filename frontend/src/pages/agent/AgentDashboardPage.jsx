/* eslint-disable no-unused-vars */
import React, { useState, useContext, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Button,
  Badge,
  Avatar,
  Modal,
  Table,
  TextInput,
  Select,
  Label,
  Spinner,
  Dropdown,
} from "flowbite-react";
import { AuthContext } from "../../context/AuthContext";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
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
  FiClock,
  FiCheckCircle,
  FiBriefcase,
  FiEdit3,
  FiX,
  FiLock,
  FiCreditCard,
  FiFileText,
  FiCamera,
  FiShield,
} from "react-icons/fi";
import AgentVehiclesSection from "../../components/agent/AgentVehiclesSection";
import NotificationsPanel from "../../components/admin/NotificationsPanel";

// AgentProfileContent Component - Integrated within dashboard
const AgentProfileContent = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [stats, setStats] = useState(null);
  const hasLoadedStats = useRef(false);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    "profile.phone": user?.profile?.phone || "",
    "profile.address.street": user?.profile?.address?.street || "",
    "profile.address.city": user?.profile?.address?.city || "",
    "profile.address.postalCode": user?.profile?.address?.postalCode || "",
    "profile.address.country": user?.profile?.address?.country || "Deutschland",
    "agentProfile.businessName": user?.agentProfile?.businessName || "",
    "agentProfile.licenseNumber": user?.agentProfile?.licenseNumber || "",
    "agentProfile.specializations": user?.agentProfile?.specializations || [],
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!hasLoadedStats.current) {
      hasLoadedStats.current = true;
      fetchAgentStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAgentStats = async () => {
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
        },
        agentProfile: {
          businessName: profileData["agentProfile.businessName"],
          licenseNumber: profileData["agentProfile.licenseNumber"],
          specializations: profileData["agentProfile.specializations"],
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
      "agentProfile.businessName": user?.agentProfile?.businessName || "",
      "agentProfile.licenseNumber": user?.agentProfile?.licenseNumber || "",
      "agentProfile.specializations": user?.agentProfile?.specializations || [],
    });
    setIsEditing(false);
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: FiUser },
    { id: "business", label: "Business", icon: FiBriefcase },
    { id: "performance", label: "Leistung", icon: FiTrendingUp },
    { id: "preferences", label: "Einstellungen", icon: FiSettings },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Agent Profil</h2>
        <p className="text-gray-600">
          Verwalten Sie Ihre Agent-Informationen und Business-Einstellungen
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-200">
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-8 py-8 text-white relative">
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
                    <FiUser className="w-10 h-10 text-white" />
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-orange-100 text-lg">Rental Agent</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Agent
                  </span>
                  <span className="bg-orange-500/50 text-white px-2 py-1 rounded-full text-xs">
                    <FiCalendar className="w-3 h-3 inline mr-1" />
                    Seit {new Date(user?.createdAt).toLocaleDateString("de-DE")}
                  </span>
                  <span className="bg-green-500/50 text-white px-2 py-1 rounded-full text-xs">
                    <FiActivity className="w-3 h-3 inline mr-1" />
                    Aktiv
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {stats && (
              <div className="hidden lg:flex space-x-4">
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {stats.managedVehicles || 0}
                  </div>
                  <div className="text-orange-200 text-xs">Fahrzeuge</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {stats.totalBookings || 0}
                  </div>
                  <div className="text-orange-200 text-xs">Buchungen</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">
                    €{stats.totalCommissions || 0}
                  </div>
                  <div className="text-orange-200 text-xs">Provisionen</div>
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
                    ? "border-orange-500 text-orange-600"
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
                <FiUser className="w-5 h-5 text-orange-600" />
                Persönliche Informationen
              </h3>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="+49 123 456 7890"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {profileData["profile.phone"] || "Nicht angegeben"}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Business Tab */}
        {activeTab === "business" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FiBriefcase className="w-5 h-5 text-orange-600" />
              Business Informationen
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Firmenname
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData["agentProfile.businessName"]}
                    onChange={(e) =>
                      handleInputChange(
                        "agentProfile.businessName",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Ihr Firmenname"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {profileData["agentProfile.businessName"] ||
                      "Nicht angegeben"}
                  </div>
                )}
              </div>

              {/* License Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Lizenznummer
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData["agentProfile.licenseNumber"]}
                    onChange={(e) =>
                      handleInputChange(
                        "agentProfile.licenseNumber",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Ihre Lizenznummer"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {profileData["agentProfile.licenseNumber"] ||
                      "Nicht angegeben"}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === "performance" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-orange-600" />
              Leistungsübersicht
            </h3>

            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Managed Vehicles */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Verwaltete Fahrzeuge</p>
                      <p className="text-2xl font-bold">
                        {stats.managedVehicles || 0}
                      </p>
                    </div>
                    <FiTruck className="w-8 h-8 text-orange-200" />
                  </div>
                </div>

                {/* Total Bookings */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Gesamte Buchungen</p>
                      <p className="text-2xl font-bold">
                        {stats.totalBookings || 0}
                      </p>
                    </div>
                    <FiCalendar className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                {/* Total Commissions */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Gesamtprovisionen</p>
                      <p className="text-2xl font-bold">
                        €{stats.totalCommissions || 0}
                      </p>
                    </div>
                    <FiDollarSign className="w-8 h-8 text-green-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FiSettings className="w-5 h-5 text-orange-600" />
              Agent Einstellungen
            </h3>

            <div className="space-y-4">
              {/* Auto Approve Bookings */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <h5 className="font-medium text-gray-800">
                    Automatische Buchungsbestätigung
                  </h5>
                  <p className="text-sm text-gray-600">
                    Buchungen automatisch bestätigen ohne manuelle Prüfung
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <h5 className="font-medium text-gray-800">
                    E-Mail-Benachrichtigungen
                  </h5>
                  <p className="text-sm text-gray-600">
                    Erhalten Sie Updates zu neuen Buchungen per E-Mail
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
            </div>

            {/* Save Settings Button */}
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
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

const AgentDashboardPage = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showCreateVehicleModal, setShowCreateVehicleModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState(2);
  const [rateLimitError, setRateLimitError] = useState(false);
  const hasFetchedData = useRef(false);

  // Real-time data states
  const [stats, setStats] = useState({
    totalVehicles: 0,
    approvedVehicles: 0,
    pendingVehicles: 0,
    activeBookableVehicles: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    activeBookings: 0,
    rating: 0,
  });

  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Form states - Match admin exactly
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
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch real-time data from API
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch agent-specific data with proper error handling
      const vehiclesPromise = api.get("/api/agent/vehicles").catch((err) => {
        console.error("Vehicles API error:", err);
        return { data: { data: [] } }; // Fallback empty array
      });

      const bookingsPromise = api
        .get("/api/bookings/my-bookings")
        .catch((err) => {
          console.error("Bookings API error:", err);
          return { data: { data: [] } }; // Fallback empty array
        });

      const [vehiclesRes, bookingsRes] = await Promise.all([
        vehiclesPromise,
        bookingsPromise,
      ]);

      // Set vehicles from API response
      const vehiclesData =
        vehiclesRes.data?.data?.vehicles || vehiclesRes.data?.data || [];
      setVehicles(vehiclesData);

      // Set bookings from API response
      const bookingsData =
        bookingsRes.data?.data?.bookings || bookingsRes.data?.data || [];
      setBookings(bookingsData);

      // Calculate stats from actual data
      const activeBookingsCount = bookingsData.filter(
        (b) => b.status === "active" || b.status === "confirmed"
      ).length;
      const monthlyRevenue = bookingsData
        .filter(
          (b) =>
            b.payment?.status === "completed" &&
            new Date(b.createdAt).getMonth() === new Date().getMonth()
        )
        .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);

      setStats({
        totalVehicles: vehiclesData.length,
        approvedVehicles: vehiclesData.filter(
          (v) => v.verificationStatus === "genehmigt"
        ).length,
        pendingVehicles: vehiclesData.filter(
          (v) => v.verificationStatus === "ausstehend"
        ).length,
        activeBookableVehicles: vehiclesData.filter(
          (v) => v.verificationStatus === "genehmigt" && v.isAvailable
        ).length,
        totalBookings: bookingsData.length,
        monthlyRevenue: monthlyRevenue,
        activeBookings: activeBookingsCount,
        rating: 4.8, // Mock rating for now
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
        setTimeout(() => setRateLimitError(false), 10000);
        return;
      }

      // For other errors, set empty states
      setStats({
        totalVehicles: 0,
        totalBookings: 0,
        monthlyRevenue: 0,
        activeBookings: 0,
        pendingApprovals: 0,
        rating: 0,
      });
      setVehicles([]);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    document.title = "Vermieter Dashboard | WohnmobilTraum";

    // Only fetch once to prevent rate limiting
    if (!hasFetchedData.current) {
      hasFetchedData.current = true;
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle navigation from notification
  useEffect(() => {
    if (location.state?.activeSection) {
      setActiveSection(location.state.activeSection);
      // Clear the location state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Handle image selection for vehicles
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVehicleImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Cloudinary via agent endpoint
  const uploadImageToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("/api/agent/upload-vehicle-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Fehler beim Hochladen des Bildes");
      throw error;
    }
  };

  // Create new vehicle (same as admin)
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

      // Transform vehicle data to match API expectations with all required fields
      const vehicleData = {
        name: newVehicle.name,
        category: newVehicle.category,
        description: {
          short: newVehicle.description?.substring(0, 200) || "Komfortables Fahrzeug für Ihre Reise",
          long: newVehicle.description || "Dieses Fahrzeug bietet Komfort und Zuverlässigkeit für Ihre unvergessliche Reise. Perfekt ausgestattet für einen erholsamen Urlaub.",
        },
        technicalData: {
          brand: newVehicle.brand,
          model: newVehicle.model,
          year: parseInt(newVehicle.year) || new Date().getFullYear(),
          fuelType: newVehicle.fuelType,
          transmission: newVehicle.transmission,
          // Required fields with default values
          length: 6.5, // Default length in meters
          width: 2.3, // Default width in meters
          height: 2.8, // Default height in meters
          weight: 2500, // Default weight in kg
          maxWeight: 3500, // Default max weight in kg
          requiredLicense: "B", // Default license
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
          },
        ];
      }

      await api.post("/api/vehicles", vehicleData);
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
      fetchDashboardData();
      toast.success("Fahrzeug erfolgreich erstellt und wartet auf Genehmigung!");
    } catch (error) {
      console.error("Error creating vehicle:", error);
      toast.error(
        error.response?.data?.message || "Fehler beim Erstellen des Fahrzeugs"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
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

  if (!user || (user.role !== "agent" && user.role !== "admin")) {
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
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="relative bg-gray-50/90 hover:bg-white/95 rounded-3xl border border-gray-200/60 hover:border-emerald-200/80 transition-all duration-500 shadow-sm hover:shadow-md">
              <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-emerald-500 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Suche nach Fahrzeugen, Buchungen, Analytics..."
                className="pl-14 pr-20 py-4 bg-transparent border-0 rounded-3xl focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition-all duration-300 w-full text-gray-700 placeholder-gray-400 font-medium"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <kbd className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100/80 border border-gray-200/80 rounded-lg shadow-sm">
                  ⌘K
                </kbd>
                <div className="w-px h-4 bg-gray-300"></div>
                <FiFilter className="w-4 h-4 text-gray-400 hover:text-emerald-500 cursor-pointer transition-colors duration-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Notifications, Refresh Button & User Dropdown */}
        <div className="flex items-center space-x-4">
          {/* Notifications Panel */}
          <NotificationsPanel />

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
              <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-50/90 to-white/90 hover:from-emerald-50/90 hover:to-teal-50/90 rounded-3xl p-3 border border-gray-200/60 hover:border-emerald-200/80 transition-all duration-500 cursor-pointer group shadow-sm hover:shadow-md">
                <div className="relative">
                  <Avatar
                    img={
                      user.profilePicture ||
                      `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=10b981&color=fff&size=128`
                    }
                    size="md"
                    className="ring-2 ring-emerald-100/70 group-hover:ring-emerald-200 transition-all duration-500 shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                </div>
                <div className="hidden lg:block">
                  <div className="font-bold text-gray-900 text-sm">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center font-medium">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse shadow-sm"></div>
                    Vermieter
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
        {/* Logo and Vermieter Portal Badge */}
        <div className="mb-8 space-y-4">
          {/* Company Logo */}
          <div className="flex justify-center">
            <div className="relative overflow-hidden rounded-xl p-2 transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:scale-105 group">
              <img
                src="https://926c016b950324a3223fa88ada4966be.cdn.bubble.io/cdn-cgi/image/w=96,h=100,f=auto,dpr=1,fit=contain/f1737462329590x960045882346967900/Logo_FAIRmietung-Haltern_wei%E2%94%9C%C6%92.png"
                alt="FAIRmietung Logo"
                className="h-12 w-auto transition-all duration-300 group-hover:brightness-110 group-hover:contrast-110"
              />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl"></div>
            </div>
          </div>

          {/* Vermieter Portal Badge */}
          <div className="flex justify-center">
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 shadow-lg">
              <span className="text-white font-bold text-sm tracking-wide">
                Vermieter Portal
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
          />
          <SidebarItem
            icon={FiTruck}
            label="Meine Fahrzeuge"
            active={activeSection === "vehicles"}
            onClick={() => setActiveSection("vehicles")}
            badge={Array.isArray(vehicles) ? vehicles.length : 0}
          />
          <SidebarItem
            icon={FiCalendar}
            label="Buchungen"
            active={activeSection === "bookings"}
            onClick={() => setActiveSection("bookings")}
            badge={Array.isArray(bookings) ? bookings.length : 0}
          />
          <SidebarItem
            icon={FiActivity}
            label="Analytics"
            active={activeSection === "analytics"}
            onClick={() => setActiveSection("analytics")}
          />
          <SidebarItem
            icon={FiSettings}
            label="Einstellungen"
            active={activeSection === "settings"}
            onClick={() => setActiveSection("settings")}
          />
        </nav>

        {/* System Status */}
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
      {/* Vehicle Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiTruck}
          title="Gesamt"
          value={stats.totalVehicles}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          iconBg="bg-blue-600"
        />
        <StatCard
          icon={FiCheckCircle}
          title="Genehmigt"
          value={stats.approvedVehicles}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          iconBg="bg-green-600"
        />
        <StatCard
          icon={FiClock}
          title="Ausstehend"
          value={stats.pendingVehicles}
          gradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
          iconBg="bg-yellow-600"
        />
        <StatCard
          icon={FiCheckCircle}
          title="Aktiv buchbar"
          value={stats.activeBookableVehicles}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          iconBg="bg-emerald-600"
        />
      </div>

      {/* Booking & Revenue Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={FiCalendar}
          title="Aktive Buchungen"
          value={stats.activeBookings}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          iconBg="bg-blue-600"
        />
        <StatCard
          icon={FiDollarSign}
          title="Monatsumsatz"
          value={`€${stats.monthlyRevenue}`}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          iconBg="bg-orange-600"
        />
        <StatCard
          icon={FiTrendingUp}
          title="Gesamt Buchungen"
          value={stats.totalBookings}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          iconBg="bg-emerald-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">
            Schnellaktionen
          </h3>
          <div className="space-y-3">
            <Button
              onClick={() => setShowCreateVehicleModal(true)}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0"
            >
              <FiPlus className="mr-2" />
              Neues Fahrzeug hinzufügen
            </Button>
            <Button
              onClick={() => setActiveSection("bookings")}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0"
            >
              <FiCalendar className="mr-2" />
              Buchungen verwalten
            </Button>
            <Button
              onClick={() => setActiveSection("vehicles")}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0"
            >
              <FiEye className="mr-2" />
              Meine Fahrzeuge anzeigen
            </Button>
            <Button
              onClick={() => setActiveSection("analytics")}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 border-0"
            >
              <FiActivity className="mr-2" />
              Statistiken einsehen
            </Button>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">
            Aktuelle Buchungen
          </h3>
          <div className="space-y-4">
            {bookings.slice(0, 3).map((booking, index) => (
              <div
                key={booking._id || index}
                className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold">
                    {booking.vehicle?.name || "Fahrzeug"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {booking.dates
                      ? `${new Date(
                          booking.dates.start
                        ).toLocaleDateString()} - ${new Date(
                          booking.dates.end
                        ).toLocaleDateString()}`
                      : "Datum nicht verfügbar"}
                  </p>
                </div>
                <Badge
                  color={
                    booking.status === "active"
                      ? "success"
                      : booking.status === "confirmed"
                      ? "info"
                      : "warning"
                  }
                >
                  {booking.status === "active"
                    ? "Aktiv"
                    : booking.status === "confirmed"
                    ? "Bestätigt"
                    : "Wartend"}
                </Badge>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FiCalendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Keine Buchungen vorhanden</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Overview */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900">
          Meine Fahrzeuge
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.slice(0, 3).map((vehicle, index) => (
            <div
              key={vehicle._id || index}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 bg-white"
            >
              <div className="w-full h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg mb-3 flex items-center justify-center">
                <FiTruck className="w-12 h-12 text-white" />
              </div>
              <h4 className="font-bold mb-1">{vehicle.name || "Fahrzeug"}</h4>
              <p className="text-sm text-gray-600 mb-2">
                {vehicle.capacity?.seats || vehicle.capacity || 4} Personen •{" "}
                {vehicle.category || "Standard"}
              </p>
              <div className="flex justify-between items-center">
                <Badge
                  color={
                    vehicle.status === "aktiv" ||
                    vehicle.availability?.isAvailable
                      ? "success"
                      : "warning"
                  }
                >
                  {vehicle.status === "aktiv" ||
                  vehicle.availability?.isAvailable
                    ? "Aktiv"
                    : "Wartend"}
                </Badge>
                <span className="text-sm font-semibold">
                  €
                  {(
                    vehicle.pricing?.basePrice?.perDay ||
                    vehicle.pricePerDay ||
                    0
                  ).toLocaleString()}
                  /Tag
                </span>
              </div>
            </div>
          ))}

          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer"
            onClick={() => setShowCreateVehicleModal(true)}
          >
            <FiPlus className="text-3xl mb-2" />
            <p className="text-sm font-medium">Neues Fahrzeug</p>
            <p className="text-xs">hinzufügen</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "vehicles":
        return <AgentVehiclesSection />;
      case "bookings":
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Buchungen Verwaltung kommt bald...</p>
          </div>
        );
      case "analytics":
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Analytics kommen bald...</p>
          </div>
        );
      case "profile":
        return <AgentProfileContent />;
      case "settings":
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Agent Einstellungen
              </h2>
              <p className="text-gray-600">
                Verwalten Sie Ihre Agent-Einstellungen und Präferenzen
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Agent Configuration */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiSettings className="w-5 h-5 text-emerald-600" />
                  Agent Konfiguration
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">
                      Automatische Buchungsbestätigung
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
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
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">
                      SMS Benachrichtigungen
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Commission & Pricing */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiDollarSign className="w-5 h-5 text-green-600" />
                  Provision & Preise
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Standard Kommission (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="15"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mindestbuchungsdauer (Tage)
                    </label>
                    <input
                      type="number"
                      defaultValue="1"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximale Buchungsdauer (Tage)
                    </label>
                    <input
                      type="number"
                      defaultValue="30"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiClock className="w-5 h-5 text-blue-600" />
                  Geschäftszeiten
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Öffnungszeit
                      </label>
                      <input
                        type="time"
                        defaultValue="09:00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Schließzeit
                      </label>
                      <input
                        type="time"
                        defaultValue="18:00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verfügbare Wochentage
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
                        <label key={day} className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={!["Sa", "So"].includes(day)}
                            className="mr-1 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Support */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiPhone className="w-5 h-5 text-emerald-600" />
                  Kontakt & Support
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Telefonnummer
                    </label>
                    <input
                      type="tel"
                      placeholder="+49 123 456 7890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support E-Mail
                    </label>
                    <input
                      type="email"
                      placeholder="support@agent.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg transition-colors">
                    Support kontaktieren
                  </button>
                </div>
              </div>
            </div>

            {/* Save Settings */}
            <div className="mt-8 flex justify-end">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl">
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
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 overflow-hidden">
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
                  <div className="w-6 h-6 border-2 border-emerald-200 rounded-full animate-spin"></div>
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
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
            <div className="bg-orange-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FiEdit className="w-5 h-5 mr-2 text-orange-600" />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
    </div>
  );
};

export default AgentDashboardPage;
