import React, { useEffect, useState } from "react";
import { Spinner, Badge } from "flowbite-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import api from "../../services/api";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCalendar,
  FiTruck,
  FiActivity,
  FiUsers,
  FiCheckCircle,
} from "react-icons/fi";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

const DashboardAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    revenueGrowth: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalVehicles: 0,
    activeBookings: 0,
    completedBookings: 0,
  });
  const [topVehicles, setTopVehicles] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, usersRes, vehiclesRes] = await Promise.all([
        api.get("/api/admin/bookings"),
        api.get("/api/admin/users").catch(() => ({ data: { data: { users: [] } } })),
        api.get("/api/admin/vehicles").catch(() => ({ data: { data: { vehicles: [] } } })),
      ]);

      let bookings = [];
      if (bookingsRes.data.data?.bookings) {
        bookings = bookingsRes.data.data.bookings;
      } else if (Array.isArray(bookingsRes.data.data)) {
        bookings = bookingsRes.data.data;
      }

      // Get real user count (filter out admins, count only customers)
      const users = usersRes.data.data?.users || [];
      const customerCount = users.filter(u => u.role === "user").length;

      // Get real vehicle count
      const vehicles = vehiclesRes.data.data?.vehicles || [];
      const vehicleCount = vehicles.length;

      console.log("📊 Bookings:", bookings.length);
      console.log("👥 Customers:", customerCount);
      console.log("🚗 Vehicles:", vehicleCount);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // Monthly revenue
      const monthlyRev = bookings
        .filter((b) => {
          const d = new Date(b.createdAt);
          return (
            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear &&
            b.payment?.status === "completed"
          );
        })
        .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);

      const lastMonthRev = bookings
        .filter((b) => {
          const d = new Date(b.createdAt);
          return (
            d.getMonth() === lastMonth &&
            d.getFullYear() === lastMonthYear &&
            b.payment?.status === "completed"
          );
        })
        .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);

      const yearlyRev = bookings
        .filter((b) => {
          const d = new Date(b.createdAt);
          return d.getFullYear() === currentYear && b.payment?.status === "completed";
        })
        .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);

      const growth = lastMonthRev > 0 ? ((monthlyRev - lastMonthRev) / lastMonthRev) * 100 : 0;

      setStats({
        monthlyRevenue: monthlyRev,
        yearlyRevenue: yearlyRev,
        revenueGrowth: growth,
        totalBookings: bookings.length,
        totalUsers: customerCount,
        totalVehicles: vehicleCount,
        activeBookings: bookings.filter((b) => b.status === "active").length,
        completedBookings: bookings.filter((b) => b.status === "completed").length,
      });

      // Top 5 vehicles
      const vehicleMap = {};
      bookings.forEach((b) => {
        const vehicleId = b.vehicle?._id || "unknown";
        const vehicleName = b.vehicle?.name || "Unbekannt";

        if (!vehicleMap[vehicleId]) {
          vehicleMap[vehicleId] = { name: vehicleName, count: 0, revenue: 0 };
        }

        vehicleMap[vehicleId].count++;
        if (b.payment?.status === "completed") {
          vehicleMap[vehicleId].revenue += b.pricing?.totalAmount || 0;
        }
      });

      const top5 = Object.values(vehicleMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((v, index) => ({
          name: v.name.length > 15 ? v.name.substring(0, 15) + "..." : v.name,
          buchungen: v.count,
          umsatz: Math.round(v.revenue),
          fill: COLORS[index],
        }));

      setTopVehicles(top5);

      // Status distribution
      const statusCounts = {
        pending: bookings.filter((b) => b.status === "pending").length,
        confirmed: bookings.filter((b) => b.status === "confirmed").length,
        active: bookings.filter((b) => b.status === "active").length,
        completed: bookings.filter((b) => b.status === "completed").length,
        cancelled: bookings.filter((b) => b.status === "cancelled").length,
      };

      const statusChartData = [
        { name: "Ausstehend", value: statusCounts.pending, fill: "#F59E0B" },
        { name: "Bestätigt", value: statusCounts.confirmed, fill: "#10B981" },
        { name: "Aktiv", value: statusCounts.active, fill: "#3B82F6" },
        { name: "Abgeschlossen", value: statusCounts.completed, fill: "#6B7280" },
        { name: "Storniert", value: statusCounts.cancelled, fill: "#EF4444" },
      ].filter((s) => s.value > 0);

      setStatusData(statusChartData);

      // Last 6 months data
      const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
      const last6 = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const m = date.getMonth();
        const y = date.getFullYear();

        const count = bookings.filter((b) => {
          const d = new Date(b.createdAt);
          return d.getMonth() === m && d.getFullYear() === y;
        }).length;

        const revenue = bookings
          .filter((b) => {
            const d = new Date(b.createdAt);
            return d.getMonth() === m && d.getFullYear() === y && b.payment?.status === "completed";
          })
          .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);

        last6.push({
          monat: monthNames[m],
          buchungen: count,
          umsatz: Math.round(revenue / 1000),
        });
      }

      setMonthlyData(last6);

      // Performance radar data
      const performance = [
        { metric: "Buchungen", wert: Math.min(bookings.length, 100), fullMark: 100 },
        { metric: "Umsatz", wert: Math.min((yearlyRev / 100000) * 100, 100), fullMark: 100 },
        { metric: "Fahrzeuge", wert: Math.min(vehicleCount * 10, 100), fullMark: 100 },
        { metric: "Kunden", wert: Math.min(customerCount * 2, 100), fullMark: 100 },
        { metric: "Abschlussrate", wert: Math.min((statusCounts.completed / Math.max(bookings.length, 1)) * 100, 100), fullMark: 100 },
      ];

      setPerformanceData(performance);

      console.log("✅ Analytics loaded");
    } catch (error) {
      console.error("❌ Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Summary Cards - 3 Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <FiDollarSign className="w-6 h-6" />
            </div>
            {stats.revenueGrowth !== 0 && (
              <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                {stats.revenueGrowth >= 0 ? (
                  <FiTrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <FiTrendingDown className="w-4 h-4 mr-1" />
                )}
                <span className="text-sm font-bold">{Math.abs(stats.revenueGrowth).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-3xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
              <div className="text-sm text-blue-100">Monatsumsatz</div>
            </div>
            <div className="pt-4 border-t border-white/20">
              <div className="text-xl font-semibold">{formatCurrency(stats.yearlyRevenue)}</div>
              <div className="text-xs text-blue-100">Jahresumsatz {new Date().getFullYear()}</div>
            </div>
          </div>
        </div>

        {/* Bookings Card */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <FiCalendar className="w-6 h-6" />
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full">
              <FiActivity className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-3xl font-bold">{stats.totalBookings}</div>
              <div className="text-sm text-purple-100">Gesamt Buchungen</div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20">
              <div>
                <div className="text-lg font-semibold">{stats.activeBookings}</div>
                <div className="text-xs text-purple-100">Aktiv</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{stats.completedBookings}</div>
                <div className="text-xs text-purple-100">Abgeschlossen</div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Stats Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <FiUsers className="w-6 h-6" />
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full">
              <FiTruck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <div className="text-sm text-emerald-100">Registrierte Kunden</div>
            </div>
            <div className="pt-4 border-t border-white/20">
              <div className="text-xl font-semibold">{stats.totalVehicles}</div>
              <div className="text-xs text-emerald-100">Verfügbare Fahrzeuge</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Bookings Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Umsatz & Buchungen</h3>
            <Badge color="info" size="sm">6 Monate</Badge>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorUmsatz" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBuchungen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="monat" stroke="#9CA3AF" style={{ fontSize: "12px" }} />
              <YAxis yAxisId="left" stroke="#3B82F6" style={{ fontSize: "12px" }} tickFormatter={(v) => `€${v}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="#10B981" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{ fontSize: "12px", borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                formatter={(value, name) => {
                  if (name === "umsatz") return [`€${value}k`, "Umsatz"];
                  return [value, "Buchungen"];
                }}
              />
              <Area yAxisId="left" type="monotone" dataKey="umsatz" stroke="#3B82F6" strokeWidth={2} fill="url(#colorUmsatz)" />
              <Area yAxisId="right" type="monotone" dataKey="buchungen" stroke="#10B981" strokeWidth={2} fill="url(#colorBuchungen)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Radar */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Performance Übersicht</h3>
            <Badge color="success" size="sm">Live</Badge>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={performanceData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="metric" style={{ fontSize: "11px" }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} style={{ fontSize: "11px" }} />
              <Radar name="Performance" dataKey="wert" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
              <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "12px" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Buchungsstatus</h3>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.fill }}></div>
                    <span className="text-gray-700">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-gray-400">Keine Daten</div>
          )}
        </div>

        {/* Top Vehicles - Compact List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">🏆 Top Fahrzeuge</h3>
            <Badge color="warning" size="sm">Bestseller</Badge>
          </div>
          {topVehicles.length > 0 ? (
            <div className="space-y-4">
              {topVehicles.map((vehicle, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                    style={{ background: `linear-gradient(135deg, ${vehicle.fill}, ${vehicle.fill}dd)` }}
                  >
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900 truncate">{vehicle.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-600">{vehicle.buchungen} Buchungen</span>
                        <span className="text-xs font-bold text-emerald-600">{formatCurrency(vehicle.umsatz)}</span>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          background: `linear-gradient(90deg, ${vehicle.fill}, ${vehicle.fill}cc)`,
                          width: `${(vehicle.buchungen / topVehicles[0].buchungen) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FiTruck className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Keine Buchungsdaten verfügbar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
