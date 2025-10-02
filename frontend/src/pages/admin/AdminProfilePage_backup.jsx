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
  FiCpu,
  FiDatabase,
  FiWifi,
  FiMonitor,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const AdminProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [stats, setStats] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
    
    // Mouse tracking for interactive effects
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
    { id: "profile", label: "Profil", icon: FiUser, color: "from-violet-500 to-purple-600" },
    { id: "security", label: "Sicherheit", icon: FiShield, color: "from-red-500 to-pink-600" },
    { id: "settings", label: "Einstellungen", icon: FiSettings, color: "from-blue-500 to-cyan-600" },
    { id: "stats", label: "Statistiken", icon: FiActivity, color: "from-emerald-500 to-teal-600" },
  ];

  // Floating particles animation data
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 5,
  }));

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Toaster position="top-right" />
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-violet-500/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-500/25 to-teal-600/25 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Floating Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-ping"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${3 + particle.size}s`,
            }}
          />
        ))}
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Mouse Follower */}
      <div 
        className="fixed w-64 h-64 bg-gradient-to-r from-violet-500/10 to-purple-600/10 rounded-full blur-3xl pointer-events-none transition-all duration-300 ease-out z-0"
        style={{
          left: mousePosition.x - 128,
          top: mousePosition.y - 128,
        }}
      />

      <div className="relative z-10 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 mb-6 border border-white/20">
              <FiShield className="w-5 h-5 text-violet-400" />
              <span className="text-white/90 font-medium">Administrator Portal</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 mb-4 animate-pulse">
              Profil Zentrale
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Willkommen in Ihrem persönlichen Kommandozentrum. Verwalten Sie Ihr Administrator-Profil mit modernster Technologie.
            </p>
          </div>

          {/* Main Profile Card */}
          <div className="relative mb-8 group">
            {/* Card Background with Glassmorphism */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl"></div>
            
            {/* Content */}
            <div className="relative p-8">
              {/* Profile Header */}
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 mb-8">
                {/* Avatar Section */}
                <div className="relative group/avatar">
                  <div className="relative">
                    {/* Avatar Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full blur-2xl opacity-50 group-hover/avatar:opacity-75 transition-opacity duration-500"></div>
                    
                    {/* Avatar Container */}
                    <div className="relative w-40 h-40 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full p-1 shadow-2xl">
                      <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
                        {user?.profile?.avatar ? (
                          <img
                            src={user.profile.avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FiShield className="w-16 h-16 text-violet-400" />
                        )}
                      </div>
                    </div>

                    {/* Upload Button */}
                    <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white p-4 rounded-full cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110 group/upload">
                      <FiCamera className="w-6 h-6" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="mb-4">
                    <h2 className="text-4xl font-bold text-white mb-2">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-2xl text-violet-400 font-medium mb-4">System Administrator</p>
                    
                    {/* Status Badges */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                      <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        <FiAward className="w-4 h-4 inline mr-2" />
                        Elite Admin
                      </div>
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                        <FiCalendar className="w-4 h-4 inline mr-2" />
                        Seit {new Date(user?.createdAt).toLocaleDateString("de-DE")}
                      </div>
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse">
                        <FiWifi className="w-4 h-4 inline mr-2" />
                        Online
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 group/stat">
                        <div className="flex items-center justify-between mb-2">
                          <FiUsers className="w-6 h-6 text-blue-400 group-hover/stat:scale-110 transition-transform" />
                          <FiTrendingUp className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.totalUsers || 0}</div>
                        <div className="text-blue-300 text-sm">Benutzer</div>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 group/stat">
                        <div className="flex items-center justify-between mb-2">
                          <FiMonitor className="w-6 h-6 text-purple-400 group-hover/stat:scale-110 transition-transform" />
                          <FiTrendingUp className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.totalVehicles || 0}</div>
                        <div className="text-purple-300 text-sm">Fahrzeuge</div>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 group/stat">
                        <div className="flex items-center justify-between mb-2">
                          <FiActivity className="w-6 h-6 text-emerald-400 group-hover/stat:scale-110 transition-transform" />
                          <FiTrendingUp className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.totalBookings || 0}</div>
                        <div className="text-emerald-300 text-sm">Buchungen</div>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 group/stat">
                        <div className="flex items-center justify-between mb-2">
                          <FiZap className="w-6 h-6 text-yellow-400 group-hover/stat:scale-110 transition-transform" />
                          <FiTrendingUp className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">99.9%</div>
                        <div className="text-yellow-300 text-sm">Uptime</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-4">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative group flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-500 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-2xl scale-105`
                      : "bg-white/10 backdrop-blur-md text-white/70 hover:text-white hover:bg-white/20 border border-white/20"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <tab.icon className={`w-5 h-5 transition-transform duration-300 ${
                    activeTab === tab.id ? "scale-110" : "group-hover:scale-110"
                  }`} />
                  <span className="font-semibold">{tab.label}</span>
                  
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl"></div>
            
            <div className="relative p-8">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-8 animate-fade-in">
                  {/* Actions Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400 mb-2">
                        Persönliche Informationen
                      </h3>
                      <p className="text-white/70">Verwalten Sie Ihre Administrator-Details</p>
                    </div>

                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 flex items-center gap-3 shadow-xl hover:shadow-2xl hover:scale-105 group"
                      >
                        <FiEdit3 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        Bearbeiten
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={handleSave}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 shadow-xl hover:shadow-2xl hover:scale-105 group"
                        >
                          <FiSave className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          {isLoading ? "Speichern..." : "Speichern"}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 flex items-center gap-3 shadow-xl hover:shadow-2xl hover:scale-105 group"
                        >
                          <FiX className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                          Abbrechen
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-semibold text-white flex items-center gap-2">
                        <FiUser className="w-5 h-5 text-violet-400" />
                        Grunddaten
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="relative group">
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            Vorname *
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={profileData.firstName}
                              onChange={(e) => handleInputChange("firstName", e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-white placeholder-white/50 group-hover:bg-white/20"
                              placeholder="Max"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-white/5 backdrop-blur-md rounded-xl text-white font-medium border border-white/10">
                              {profileData.firstName || "Nicht angegeben"}
                            </div>
                          )}
                        </div>

                        <div className="relative group">
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            Nachname *
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={profileData.lastName}
                              onChange={(e) => handleInputChange("lastName", e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-white placeholder-white/50 group-hover:bg-white/20"
                              placeholder="Mustermann"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-white/5 backdrop-blur-md rounded-xl text-white font-medium border border-white/10">
                              {profileData.lastName || "Nicht angegeben"}
                            </div>
                          )}
                        </div>

                        <div className="relative group">
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            E-Mail-Adresse *
                          </label>
                          {isEditing ? (
                            <input
                              type="email"
                              value={profileData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-white placeholder-white/50 group-hover:bg-white/20"
                              placeholder="max@example.com"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-white/5 backdrop-blur-md rounded-xl text-white font-medium border border-white/10">
                              {profileData.email || "Nicht angegeben"}
                            </div>
                          )}
                        </div>

                        <div className="relative group">
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            Telefonnummer
                          </label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={profileData["profile.phone"]}
                              onChange={(e) => handleInputChange("profile.phone", e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-white placeholder-white/50 group-hover:bg-white/20"
                              placeholder="+49 123 456789"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-white/5 backdrop-blur-md rounded-xl text-white font-medium border border-white/10">
                              {profileData["profile.phone"] || "Nicht angegeben"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-semibold text-white flex items-center gap-2">
                        <FiMapPin className="w-5 h-5 text-emerald-400" />
                        Adresse
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="relative group">
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            Straße und Hausnummer
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={profileData["profile.address.street"]}
                              onChange={(e) => handleInputChange("profile.address.street", e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-white placeholder-white/50 group-hover:bg-white/20"
                              placeholder="Musterstraße 123"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-white/5 backdrop-blur-md rounded-xl text-white font-medium border border-white/10">
                              {profileData["profile.address.street"] || "Nicht angegeben"}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative group">
                            <label className="block text-sm font-medium text-white/90 mb-2">
                              Stadt
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={profileData["profile.address.city"]}
                                onChange={(e) => handleInputChange("profile.address.city", e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-white placeholder-white/50 group-hover:bg-white/20"
                                placeholder="Musterstadt"
                              />
                            ) : (
                              <div className="px-4 py-3 bg-white/5 backdrop-blur-md rounded-xl text-white font-medium border border-white/10">
                                {profileData["profile.address.city"] || "Nicht angegeben"}
                              </div>
                            )}
                          </div>

                          <div className="relative group">
                            <label className="block text-sm font-medium text-white/90 mb-2">
                              PLZ
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={profileData["profile.address.postalCode"]}
                                onChange={(e) => handleInputChange("profile.address.postalCode", e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-white placeholder-white/50 group-hover:bg-white/20"
                                placeholder="12345"
                              />
                            ) : (
                              <div className="px-4 py-3 bg-white/5 backdrop-blur-md rounded-xl text-white font-medium border border-white/10">
                                {profileData["profile.address.postalCode"] || "Nicht angegeben"}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="relative group">
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            Land
                          </label>
                          {isEditing ? (
                            <select
                              value={profileData["profile.address.country"]}
                              onChange={(e) => handleInputChange("profile.address.country", e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-white group-hover:bg-white/20"
                            >
                              <option value="Deutschland" className="bg-slate-800 text-white">Deutschland</option>
                              <option value="Österreich" className="bg-slate-800 text-white">Österreich</option>
                              <option value="Schweiz" className="bg-slate-800 text-white">Schweiz</option>
                            </select>
                          ) : (
                            <div className="px-4 py-3 bg-white/5 backdrop-blur-md rounded-xl text-white font-medium border border-white/10">
                              {profileData["profile.address.country"] || "Deutschland"}
                            </div>
                          )}
                        </div>

                        <div className="relative group">
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            Sprache
                          </label>
                          {isEditing ? (
                            <select
                              value={profileData["profile.language"]}
                              onChange={(e) => handleInputChange("profile.language", e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-white group-hover:bg-white/20"
                            >
                              <option value="de" className="bg-slate-800 text-white">Deutsch</option>
                              <option value="en" className="bg-slate-800 text-white">English</option>
                              <option value="fr" className="bg-slate-800 text-white">Français</option>
                            </select>
                          ) : (
                            <div className="px-4 py-3 bg-white/5 backdrop-blur-md rounded-xl text-white font-medium border border-white/10">
                              {profileData["profile.language"] === "de" ? "Deutsch" : 
                               profileData["profile.language"] === "en" ? "English" : 
                               profileData["profile.language"] === "fr" ? "Français" : "Deutsch"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400 mb-2">
                      Sicherheitseinstellungen
                    </h3>
                    <p className="text-white/70">Verwalten Sie Ihre Sicherheitsoptionen</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Password Change */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-semibold text-white flex items-center gap-2">
                        <FiLock className="w-5 h-5 text-red-400" />
                        Passwort ändern
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="relative group">
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            Aktuelles Passwort
                          </label>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white placeholder-white/50 group-hover:bg-white/20"
                            placeholder="Aktuelles Passwort eingeben"
                          />
                        </div>

                        <div className="relative group">
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            Neues Passwort
                          </label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white placeholder-white/50 group-hover:bg-white/20"
                            placeholder="Neues Passwort eingeben"
                          />
                        </div>

                        <div className="relative group">
                          <label className="block text-sm font-medium text-white/90 mb-2">
                            Passwort bestätigen
                          </label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white placeholder-white/50 group-hover:bg-white/20"
                            placeholder="Passwort wiederholen"
                          />
                        </div>

                        <button
                          onClick={handlePasswordUpdate}
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl hover:shadow-2xl hover:scale-105 group"
                        >
                          <FiLock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          {isLoading ? "Passwort wird geändert..." : "Passwort ändern"}
                        </button>
                      </div>
                    </div>

                    {/* Security Status */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-semibold text-white flex items-center gap-2">
                        <FiShield className="w-5 h-5 text-emerald-400" />
                        Sicherheitsstatus
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                <FiShield className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-white">Zwei-Faktor-Authentifizierung</h5>
                                <p className="text-white/70 text-sm">Zusätzliche Sicherheitsebene</p>
                              </div>
                            </div>
                            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Aktiviert
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                <FiEye className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-white">Login-Überwachung</h5>
                                <p className="text-white/70 text-sm">Anmeldungen werden überwacht</p>
                              </div>
                            </div>
                            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Aktiv
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                <FiDatabase className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-white">Datenverschlüsselung</h5>
                                <p className="text-white/70 text-sm">AES-256 Verschlüsselung</p>
                              </div>
                            </div>
                            <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Aktiviert
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                      Systemeinstellungen
                    </h3>
                    <p className="text-white/70">Konfigurieren Sie Ihre Benachrichtigungen und Präferenzen</p>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xl font-semibold text-white flex items-center gap-2">
                      <FiBell className="w-5 h-5 text-blue-400" />
                      Benachrichtigungseinstellungen
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <FiMail className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-white text-lg">E-Mail-Benachrichtigungen</h5>
                              <p className="text-white/70">Erhalten Sie wichtige Updates per E-Mail</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={profileData["preferences.emailNotifications"]}
                              onChange={(e) => handleInputChange("preferences.emailNotifications", e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-14 h-8 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-600"></div>
                          </label>
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <FiHeart className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-white text-lg">Newsletter</h5>
                              <p className="text-white/70">Bleiben Sie über neue Features informiert</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={profileData["preferences.newsletter"]}
                              onChange={(e) => handleInputChange("preferences.newsletter", e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-14 h-8 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-600"></div>
                          </label>
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <FiPhone className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-white text-lg">SMS-Benachrichtigungen</h5>
                              <p className="text-white/70">Kritische Alerts per SMS erhalten</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={profileData["preferences.smsNotifications"]}
                              onChange={(e) => handleInputChange("preferences.smsNotifications", e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-14 h-8 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === "stats" && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">
                      Administrator Statistiken
                    </h3>
                    <p className="text-white/70">Übersicht über Ihre Systemleistung</p>
                  </div>

                  {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 backdrop-blur-md rounded-3xl p-8 border border-blue-500/30 hover:scale-105 transition-all duration-500 group">
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <FiUsers className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-white">{stats.totalUsers || 0}</div>
                            <div className="text-blue-300">Benutzer</div>
                          </div>
                        </div>
                        <div className="h-2 bg-blue-900/50 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full w-full"></div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/30 backdrop-blur-md rounded-3xl p-8 border border-purple-500/30 hover:scale-105 transition-all duration-500 group">
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <FiMonitor className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-white">{stats.totalVehicles || 0}</div>
                            <div className="text-purple-300">Fahrzeuge</div>
                          </div>
                        </div>
                        <div className="h-2 bg-purple-900/50 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full w-full"></div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 backdrop-blur-md rounded-3xl p-8 border border-emerald-500/30 hover:scale-105 transition-all duration-500 group">
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <FiActivity className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-white">{stats.totalBookings || 0}</div>
                            <div className="text-emerald-300">Buchungen</div>
                          </div>
                        </div>
                        <div className="h-2 bg-emerald-900/50 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full w-full"></div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 backdrop-blur-md rounded-3xl p-8 border border-yellow-500/30 hover:scale-105 transition-all duration-500 group">
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <FiZap className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-white">99.9%</div>
                            <div className="text-yellow-300">Uptime</div>
                          </div>
                        </div>
                        <div className="h-2 bg-yellow-900/50 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full w-full"></div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-red-500/20 to-red-600/30 backdrop-blur-md rounded-3xl p-8 border border-red-500/30 hover:scale-105 transition-all duration-500 group">
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <FiCpu className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-white">23%</div>
                            <div className="text-red-300">CPU Usage</div>
                          </div>
                        </div>
                        <div className="h-2 bg-red-900/50 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full w-1/4"></div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/30 backdrop-blur-md rounded-3xl p-8 border border-cyan-500/30 hover:scale-105 transition-all duration-500 group">
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <FiDatabase className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-white">67%</div>
                            <div className="text-cyan-300">Storage</div>
                          </div>
                        </div>
                        <div className="h-2 bg-cyan-900/50 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminProfilePage;