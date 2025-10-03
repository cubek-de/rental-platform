import { useState, useEffect, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  TextInput,
  Select,
  Pagination,
  Badge,
} from "flowbite-react";
import { AuthContext } from "../context/AuthContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  HiArrowRight,
  HiStar,
  HiUsers,
  HiShieldCheck,
  HiLocationMarker,
  HiCalendar,
  HiSearch,
  HiSparkles,
  HiLightningBolt,
  HiGlobe,
  HiPhone,
  HiMail,
  HiClock,
  HiPlay,
  HiHome,
  HiCurrencyEuro,
  HiGift,
  HiHeart,
  HiTicket,
  HiDocumentDownload,
  HiShoppingBag,
  HiEmojiHappy,
  HiCheckCircle,
  HiTrendingUp,
  HiOutlineSparkles,
  HiOutlineFire,
} from "react-icons/hi";
import { vehicleService } from "../services/api";
import {
  getVehicleImage,
  formatCurrency,
  getLocationLabel,
  FALLBACK_IMAGES,
} from "../utils/vehicleHelpers";

const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    destination: "Deutschland",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: "",
    persons: "1 Erwachsener, 0 Kinder",
  });

  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const vehiclesPerPage = 6;

  const loadFeaturedVehicles = useCallback(async (page = 1) => {
    setFeaturedLoading(true);
    setFeaturedError(null);

    try {
      const response = await vehicleService.getAllVehicles({
        featured: true,
        limit: vehiclesPerPage,
        page: page,
        sortBy: "popular",
      });

      const payload = response?.data?.data ?? {};
      let vehicles = Array.isArray(payload?.vehicles) ? payload.vehicles : [];
      const total = payload?.total || 0;

      if (!vehicles.length && page === 1) {
        const fallbackResponse = await vehicleService.getAllVehicles({
          limit: vehiclesPerPage,
          page: page,
          sortBy: "popular",
        });

        const fallbackPayload = fallbackResponse?.data?.data ?? {};
        vehicles = Array.isArray(fallbackPayload?.vehicles)
          ? fallbackPayload.vehicles
          : [];
        const fallbackTotal = fallbackPayload?.total || vehicles.length;
        setTotalPages(Math.ceil(fallbackTotal / vehiclesPerPage));
      } else {
        setTotalPages(Math.ceil(total / vehiclesPerPage));
      }

      setFeaturedVehicles(vehicles);
    } catch (error) {
      console.error("Error fetching featured vehicles", error);
      setFeaturedError(
        "Die ausgewählten Fahrzeuge konnten derzeit nicht geladen werden."
      );
    } finally {
      setFeaturedLoading(false);
    }
  }, []);

  const buildHighlights = (vehicle) => {
    const highlights = [];

    if (vehicle?.capacity?.seats) {
      highlights.push(`${vehicle.capacity.seats} Sitze`);
    }

    if (vehicle?.capacity?.sleepingPlaces) {
      highlights.push(`${vehicle.capacity.sleepingPlaces} Schlafplätze`);
    }

    if (vehicle?.technicalData?.transmission) {
      highlights.push(vehicle.technicalData.transmission);
    }

    if (vehicle?.equipment?.kitchen?.available) {
      highlights.push("Küche");
    }

    if (vehicle?.equipment?.bathroom?.available) {
      highlights.push("Bad");
    }

    if (vehicle?.equipment?.climate?.airConditioning) {
      highlights.push("Klimaanlage");
    }

    return highlights.slice(0, 4);
  };

  const handleFeaturedPageChange = (page) => {
    setCurrentPage(page);
    loadFeaturedVehicles(page);
    // Scroll to featured section
    document
      .getElementById("featured-vehicles")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadFeaturedVehicles(1);
  }, [loadFeaturedVehicles]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build search parameters for the vehicles page
    const searchParams = new URLSearchParams();
    
    if (searchData.startDate) {
      searchParams.set('startDate', searchData.startDate);
    }
    if (searchData.endDate) {
      searchParams.set('endDate', searchData.endDate);
    }
    if (searchData.category) {
      searchParams.set('category', searchData.category);
    }
    
    // Navigate to vehicles page with search parameters
    navigate(`/vehicles?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Modern Header */}
      <header className="bg-white shadow-lg relative z-50">
        <div className="w-full px-0">
          {/* Main Navigation */}
          <div className="flex justify-between items-center py-3 px-5">
            {/* Logo with Innovative Hover Effect - positioned 20px from left */}
            <div
              className="flex items-center group"
              style={{ marginLeft: "15px" }}
            >
              <div className="relative overflow-hidden rounded-xl p-2 transition-all duration-300 group-hover:bg-primary-50 group-hover:shadow-lg group-hover:scale-105">
                <img
                  src="https://926c016b950324a3223fa88ada4966be.cdn.bubble.io/cdn-cgi/image/w=96,h=96,f=auto,dpr=1,fit=contain/f1736249065396x110582480505159840/Logo_FAIRmietung-Haltern.png"
                  alt="FAIRmietung Logo"
                  className="h-16 w-auto transition-all duration-300 group-hover:brightness-110 group-hover:contrast-110"
                />
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 bg-primary-200 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"></div>
              </div>
            </div>

            {/* Contact info and Anmelden button - moved more to the right */}
            <div
              className="flex items-center space-x-8"
              style={{ marginRight: "15px" }}
            >
              {/* Navigation moved closer to contact info */}
              <nav className="hidden lg:flex items-center">
                <Link
                  to="/vehicles"
                  className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  Unsere Fahrzeuge
                </Link>
              </nav>

              <div className="hidden lg:flex items-center space-x-4 text-primary-500">
                <HiMail className="w-5 h-5" />
                <HiPhone className="w-5 h-5" />
                <span className="font-medium">+49 2364 - 500 89 49</span>
              </div>
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700">Hallo, {user.firstName}</span>
                  <Button
                    as={Link}
                    to="/dashboard"
                    className="bg-primary-500 hover:bg-primary-600 text-white"
                  >
                    Dashboard
                  </Button>
                </div>
              ) : (
                <Button
                  as={Link}
                  to="/login"
                  className="bg-primary-500 border-2 border-primary-500 text-white hover:bg-white hover:text-primary-500 px-6 py-2 rounded-full font-medium transition-colors"
                >
                  Anmelden
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Enhanced Visuals */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden min-h-screen">
        {/* Background Image with Better Sizing */}
        <div className="absolute inset-0">
          <img
            src="https://926c016b950324a3223fa88ada4966be.cdn.bubble.io/cdn-cgi/image/w=3072,h=,f=auto,dpr=1,fit=contain/f1737643227664x655652090428890500/3300_R50_700-MEG_EX%2BBP-UKBroschuere_7384.png"
            alt="Luxus Wohnmobil"
            className="w-full h-full object-cover object-center scale-105 transform transition-transform duration-20000 hover:scale-110"
            style={{ objectPosition: "center 30%", minHeight: "100vh" }}
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        </div>

        {/* Hero Content with Enhanced Design */}
        <div className="relative z-10 w-full px-4 min-h-screen flex items-center">
          <div className="max-w-6xl ml-0 lg:ml-16">
            <div className="transition-all duration-1000 translate-y-0 opacity-100 animate-fadeInUp">
              <div className="mb-6">
                <span className="inline-block bg-primary-500/20 backdrop-blur-sm text-primary-300 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-primary-400/30">
                  🏆 Deutschlands fairste Wohnmobilvermietung
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-300 to-blue-300 drop-shadow-lg">
                  Fair mieten.
                </span>
                <br />
                <span className="text-white drop-shadow-2xl">Fair reisen.</span>
              </h1>
              <p className="text-2xl md:text-3xl text-gray-100 mb-12 max-w-3xl leading-relaxed font-light">
                Begeben Sie sich auf eine <span className="font-semibold text-primary-300">stilvolle Reise</span> ohne hohe Kosten.
                <br className="hidden md:block" />
                Entdecken Sie unsere <span className="font-semibold text-primary-300">erschwinglichen Premium-Wohnmobile</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Button
                  size="xl"
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-12 py-5 text-xl font-bold shadow-2xl hover:shadow-primary-500/25 transform hover:scale-105 transition-all duration-300 border-0"
                  onClick={() =>
                    document
                      .getElementById("search-section")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <HiSparkles className="mr-3 w-6 h-6" />
                  Jetzt entdecken
                  <HiArrowRight className="ml-3 w-6 h-6" />
                </Button>
                <Button
                  size="xl"
                  className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 px-12 py-5 text-xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
                  as={Link}
                  to="/vehicles"
                >
                  <HiPlay className="mr-3 w-6 h-6" />
                  Fahrzeuge ansehen
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Widget with Database Integration */}
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-7xl px-4" id="search-section">
          <div className="bg-white/98 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
            {/* Search Header with Gradient */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-blue-600 px-8 py-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"%3E%3C/circle%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
              <div className="relative z-10 text-center">
                <h3 className="text-white font-bold text-2xl mb-2 flex items-center justify-center">
                  <HiSparkles className="mr-3 w-6 h-6" />
                  Finden Sie Ihr perfektes Wohnmobil
                  <HiSparkles className="ml-3 w-6 h-6" />
                </h3>
                <p className="text-white/90 text-sm">Über 100+ Premium-Fahrzeuge verfügbar • Sofortige Bestätigung</p>
              </div>
            </div>

            {/* Enhanced Search Form */}
            <div className="p-8">
              <form
                onSubmit={handleSearch}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end"
              >
                {/* Start Date with Enhanced Design */}
                <div className="group">
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                    <HiCalendar className="w-5 h-5 mr-2 text-primary-600" />
                    Startdatum
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={searchData.startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) =>
                        setSearchData({
                          ...searchData,
                          startDate: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all duration-300 bg-gray-50 hover:bg-white font-medium text-gray-800 shadow-sm hover:shadow-md"
                      required
                    />
                  </div>
                </div>

                {/* End Date with Enhanced Design */}
                <div className="group">
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                    <HiCalendar className="w-5 h-5 mr-2 text-primary-600" />
                    Enddatum
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={searchData.endDate}
                      min={searchData.startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) =>
                        setSearchData({
                          ...searchData,
                          endDate: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all duration-300 bg-gray-50 hover:bg-white font-medium text-gray-800 shadow-sm hover:shadow-md"
                      required
                    />
                  </div>
                </div>

                {/* Vehicle Type with Database Categories */}
                <div className="group">
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                    <HiHome className="w-5 h-5 mr-2 text-primary-600" />
                    Fahrzeugtyp
                  </label>
                  <div className="relative">
                    <select
                      value={searchData.category || ""}
                      onChange={(e) =>
                        setSearchData({
                          ...searchData,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all duration-300 bg-gray-50 hover:bg-white appearance-none cursor-pointer font-medium text-gray-800 shadow-sm hover:shadow-md"
                    >
                      <option value="">Alle Fahrzeugtypen</option>
                      <option value="Wohnmobil">🚐 Wohnmobile</option>
                      <option value="Wohnwagen">🏠 Wohnwagen</option>
                      <option value="Kastenwagen">🚙 Kastenwagen</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Enhanced Search Button */}
                <div className="group">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary-600 via-primary-500 to-blue-600 hover:from-primary-700 hover:via-primary-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 group-hover:bg-gradient-to-l"
                  >
                    <HiSearch className="w-6 h-6" />
                    <span className="text-lg">Verfügbarkeit prüfen</span>
                    <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <HiCheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">Sofortige Bestätigung</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <HiShieldCheck className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Vollversichert</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <HiTrendingUp className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">Beste Preise</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block bg-primary-100 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-4 tracking-wide">
              WOHNMOBIL TYPEN
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Wählen Sie Ihr Fahrzeug
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Drei verschiedene Fahrzeugtypen für jede Art von Abenteuer
            </p>
          </div>

          {/* Vehicle Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Wohnmobile Card */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img
                  src="https://926c016b950324a3223fa88ada4966be.cdn.bubble.io/cdn-cgi/image/w=1024,h=613,f=auto,dpr=1,fit=cover/f1739195435907x221029038069382440/3300_S57_600-MF_0358_2025.png"
                  alt="Wohnmobile"
                  className="w-full h-64 object-cover rounded-t-2xl"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Premium
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Wohnmobile
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Luxuriöse Vollausstattung für das ultimative Reiseerlebnis.
                  Perfekt für Familien und Langzeitreisen.
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <HiUsers className="w-4 h-4 text-primary-500 mr-2" />
                    4-6 Personen
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <HiHome className="w-4 h-4 text-primary-500 mr-2" />
                    Vollküche & separates Bad
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <HiStar className="w-4 h-4 text-primary-500 mr-2" />
                    Luxusausstattung
                  </div>
                </div>

                <button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium transition-colors duration-200">
                  Mehr erfahren
                </button>
              </div>
            </div>

            {/* Wohnwagen Card */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img
                  src="https://926c016b950324a3223fa88ada4966be.cdn.bubble.io/cdn-cgi/image/w=768,h=440,f=auto,dpr=1,fit=contain/f1741101974461x432899091890272640/ktg-taeb-2017-2018-320-offroad-freisteller-seite-30_.png"
                  alt="Wohnwagen"
                  className="w-full h-64 object-cover rounded-t-2xl"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Beliebt
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Wohnwagen
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Flexibilität und Komfort vereint. Ideal für entspannte
                  Urlaubsreisen mit der ganzen Familie.
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <HiUsers className="w-4 h-4 text-primary-500 mr-2" />
                    2-4 Personen
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <HiCurrencyEuro className="w-4 h-4 text-primary-500 mr-2" />
                    Wirtschaftlich
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <HiLightningBolt className="w-4 h-4 text-primary-500 mr-2" />
                    Flexibel einsetzbar
                  </div>
                </div>

                <button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium transition-colors duration-200">
                  Mehr erfahren
                </button>
              </div>
            </div>

            {/* Kastenwagen Card */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img
                  src="https://926c016b950324a3223fa88ada4966be.cdn.bubble.io/cdn-cgi/image/w=768,h=440,f=auto,dpr=1,fit=contain/f1741191339567x763367075379522800/3300_F47_600-MQH_EX_5485%2B0421_Markise_2025.png"
                  alt="Kastenwagen"
                  className="w-full h-64 object-cover rounded-t-2xl"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Kompakt
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Kastenwagen
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Wendigkeit trifft auf Abenteuer. Perfekt für spontane Trips
                  und städtische Erkundungen.
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <HiUsers className="w-4 h-4 text-primary-500 mr-2" />2
                    Personen
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <HiLocationMarker className="w-4 h-4 text-primary-500 mr-2" />
                    Stadtgeeignet
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <HiGlobe className="w-4 h-4 text-primary-500 mr-2" />
                    Abenteuerlustig
                  </div>
                </div>

                <button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium transition-colors duration-200">
                  Mehr erfahren
                </button>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors duration-200 inline-flex items-center">
              Alle Fahrzeuge ansehen
              <HiArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-primary-100 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-4 tracking-wide">
              WIR SIND DIE BESTEN
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Entdecken Sie die Welt mit Ihrem eigenen Fahrstil
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: HiLocationMarker,
                title: "Kostenlose Abholung & Rückgabe",
                description:
                  "Ihre Bequemlichkeit ist wichtig. Kostenloser Abhol- und Rückgabeservice für jedes Fahrzeug.",
                color: "primary",
              },
              {
                icon: HiShieldCheck,
                title: "24/7 Straßenhilfe",
                description:
                  "Egal zu welcher Zeit oder an welchem Ort, unsere 24/7-Pannenhilfe sorgt dafür, dass Sie nie gestrandet sind.",
                color: "blue",
              },
              {
                icon: HiStar,
                title: "Premium Qualität",
                description:
                  "Alle unsere Fahrzeuge werden streng geprüft und nach höchsten Standards gewartet.",
                color: "yellow",
              },
              {
                icon: HiUsers,
                title: "Expertenberatung",
                description:
                  "Unser erfahrenes Team berät Sie bei der Auswahl des perfekten Wohnmobils für Ihre Reise.",
                color: "green",
              },
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur"></div>
                <Card className="relative bg-white rounded-3xl p-8 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 text-center">
                  <div
                    className={`w-20 h-20 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon
                      className={`w-10 h-10 text-${feature.color}-600`}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section
        id="featured-vehicles"
        className="py-20 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <HiOutlineSparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
              <h2 className="text-4xl font-bold text-gray-900">
                AUSGEWÄHLTE FAHRZEUGE
              </h2>
              <HiOutlineSparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Unsere Premium Wohnmobile - Handverlesen für unvergessliche
              Reiseerlebnisse
            </p>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="h-64 bg-gray-200"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded-full w-20"></div>
                        <div className="h-8 bg-gray-200 rounded-full w-20"></div>
                      </div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredError ? (
            <div className="text-center py-12">
              <p className="text-red-600">{featuredError}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredVehicles.map((vehicle) => {
                  const highlights = buildHighlights(vehicle);
                  const imageUrl = getVehicleImage(vehicle);
                  const locationLabel = getLocationLabel(vehicle);
                  const basePrice = vehicle?.pricing?.basePrice?.perDay;
                  const rating = vehicle?.statistics?.rating?.average || 0;
                  const reviewCount = vehicle?.statistics?.rating?.count || 0;

                  return (
                    <div
                      key={vehicle._id}
                      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                    >
                      {/* Premium Badge */}
                      {vehicle.featured && (
                        <div className="absolute top-4 left-4 z-10">
                          <Badge
                            color="warning"
                            className="px-3 py-1 flex items-center gap-1"
                          >
                            <HiOutlineFire className="h-4 w-4" />
                            Premium
                          </Badge>
                        </div>
                      )}

                      {/* Image Container */}
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={vehicle.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = FALLBACK_IMAGES[0];
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Quick View Button */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button
                            size="sm"
                            className="bg-white/90 text-gray-900 hover:bg-white"
                            as={Link}
                            to={`/vehicles/${vehicle.slug || vehicle._id}`}
                          >
                            Schnellansicht
                          </Button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Title and Location */}
                        <div className="mb-3">
                          <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                            {vehicle.name}
                          </h3>
                          <div className="flex items-center text-gray-600 text-sm">
                            <HiLocationMarker className="h-4 w-4 mr-1" />
                            <span>{locationLabel}</span>
                          </div>
                        </div>

                        {/* Rating */}
                        {rating > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <HiStar
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(rating)
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {rating.toFixed(1)} ({reviewCount} Bewertungen)
                            </span>
                          </div>
                        )}

                        {/* Highlights */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {highlights.map((highlight, index) => (
                            <Badge key={index} color="gray" className="text-xs">
                              {highlight}
                            </Badge>
                          ))}
                        </div>

                        {/* Price and CTA */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div>
                            <p className="text-sm text-gray-500">ab</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {formatCurrency(basePrice)}
                              <span className="text-sm text-gray-500 font-normal">
                                /Tag
                              </span>
                            </p>
                          </div>
                          <Button
                            color="blue"
                            size="sm"
                            as={Link}
                            to={`/vehicles/${vehicle.slug || vehicle._id}`}
                            className="group/btn"
                          >
                            Details
                            <HiArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handleFeaturedPageChange}
                    showIcons
                    className="flex items-center gap-2"
                  />
                </div>
              )}
            </>
          )}

          {/* View All Button */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              color="blue"
              as={Link}
              to="/vehicles"
              className="inline-flex items-center gap-2"
            >
              Alle Fahrzeuge ansehen
              <HiArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Gutschein CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-500 to-blue-600 relative overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Decorative Gift Icons Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top Left Area */}
          <div className="absolute -top-4 -left-4 text-white/10 transform rotate-12 animate-pulse">
            <HiGift className="w-24 h-24" />
          </div>
          <div className="absolute top-20 left-12 text-white/8 transform -rotate-6 animate-pulse delay-1000">
            <HiTicket className="w-16 h-16" />
          </div>
          <div className="absolute top-32 left-32 text-white/6 transform rotate-45 animate-pulse delay-500">
            <HiHeart className="w-12 h-12" />
          </div>

          {/* Top Right Area */}
          <div className="absolute -top-8 -right-8 text-white/8 transform -rotate-12 animate-pulse delay-300">
            <HiGift className="w-32 h-32" />
          </div>
          <div className="absolute top-16 right-20 text-white/10 transform rotate-6 animate-pulse delay-700">
            <HiStar className="w-14 h-14" />
          </div>
          <div className="absolute top-28 right-40 text-white/6 transform -rotate-30 animate-pulse delay-1200">
            <HiSparkles className="w-10 h-10" />
          </div>

          {/* Bottom Left Area */}
          <div className="absolute -bottom-6 -left-6 text-white/8 transform rotate-45 animate-pulse delay-800">
            <HiHeart className="w-20 h-20" />
          </div>
          <div className="absolute bottom-20 left-16 text-white/10 transform -rotate-12 animate-pulse delay-400">
            <HiTicket className="w-18 h-18" />
          </div>

          {/* Bottom Right Area */}
          <div className="absolute -bottom-4 -right-12 text-white/6 transform rotate-30 animate-pulse delay-600">
            <HiGift className="w-28 h-28" />
          </div>
          <div className="absolute bottom-16 right-24 text-white/8 transform -rotate-45 animate-pulse delay-900">
            <HiSparkles className="w-16 h-16" />
          </div>

          {/* Center Floating Elements */}
          <div className="absolute top-1/3 left-1/4 text-white/5 transform rotate-12 animate-pulse delay-1500">
            <HiStar className="w-8 h-8" />
          </div>
          <div className="absolute top-1/2 right-1/3 text-white/5 transform -rotate-24 animate-pulse delay-2000">
            <HiHeart className="w-6 h-6" />
          </div>
          <div className="absolute bottom-1/3 left-1/3 text-white/4 transform rotate-60 animate-pulse delay-1800">
            <HiTicket className="w-10 h-10" />
          </div>

          {/* Small scattered elements */}
          <div className="absolute top-1/4 right-1/4 text-white/4 animate-pulse delay-2200">
            <HiSparkles className="w-4 h-4" />
          </div>
          <div className="absolute bottom-1/4 left-1/5 text-white/4 animate-pulse delay-2500">
            <HiStar className="w-5 h-5" />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8">
              Jetzt Gutschein sichern!
            </h2>
            <p className="text-xl text-primary-100 mb-12 max-w-2xl mx-auto">
              Verschenken Sie unvergessliche Wohnmobil-Abenteuer oder gönnen Sie
              sich selbst eine Auszeit. Unsere Gutscheine sind flexibel
              einsetzbar und das perfekte Geschenk für jeden Anlass.
            </p>

            <div className="flex justify-center">
              <Button
                as={Link}
                to="/gutschein"
                size="lg"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 rounded-full px-8 py-4 font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  <HiGift className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Gutschein bestellen
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter & Urlaubsschutzpaket Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Decorative Background Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Protection themed icons */}
          <div className="absolute top-10 left-10 text-primary-100/20 transform rotate-12 animate-pulse">
            <HiShieldCheck className="w-16 h-16" />
          </div>
          <div className="absolute top-20 right-20 text-primary-100/15 transform -rotate-6 animate-pulse delay-1000">
            <HiCheckCircle className="w-12 h-12" />
          </div>
          <div className="absolute bottom-20 left-20 text-primary-100/10 transform rotate-45 animate-pulse delay-500">
            <HiEmojiHappy className="w-14 h-14" />
          </div>
          <div className="absolute bottom-10 right-16 text-primary-100/15 transform -rotate-12 animate-pulse delay-1500">
            <HiShoppingBag className="w-10 h-10" />
          </div>
          <div className="absolute top-1/2 left-1/4 text-primary-100/8 transform rotate-30 animate-pulse delay-2000">
            <HiHeart className="w-8 h-8" />
          </div>
          <div className="absolute top-1/3 right-1/3 text-primary-100/10 transform -rotate-45 animate-pulse delay-800">
            <HiStar className="w-6 h-6" />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch">
              {/* Newsletter Section */}
              <div className="lg:col-span-2">
                <div className="h-full">
                  <div className="mb-8">
                    <span className="inline-block bg-primary-100 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-4 tracking-wide">
                      NEWSLETTER
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                      Bleiben Sie auf dem Laufenden
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                      Erhalten Sie exklusive Angebote, Reisetipps und die
                      neuesten Updates zu unseren Wohnmobilen direkt in Ihr
                      Postfach.
                    </p>
                  </div>

                  {/* Newsletter Benefits Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center p-4 bg-primary-50 rounded-xl">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center mr-4">
                        <HiStar className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-800 font-medium">
                        Exklusive Frühbucherrabatte
                      </span>
                    </div>
                    <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                        <HiGlobe className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-800 font-medium">
                        Insider-Reisetipps & Routen
                      </span>
                    </div>
                    <div className="flex items-center p-4 bg-green-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                        <HiShoppingBag className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-800 font-medium">
                        Neue Fahrzeuge zuerst erfahren
                      </span>
                    </div>
                    <div className="flex items-center p-4 bg-purple-50 rounded-xl">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                        <HiGift className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-800 font-medium">
                        Sonderaktionen & Gutscheine
                      </span>
                    </div>
                  </div>

                  {/* Newsletter Form */}
                  <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <input
                            type="email"
                            placeholder="ihre.email@beispiel.de"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-900"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Ihr Vorname (optional)"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-900"
                          />
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="newsletter-privacy"
                          className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          required
                        />
                        <label
                          htmlFor="newsletter-privacy"
                          className="text-sm text-gray-600"
                        >
                          Ich stimme der{" "}
                          <Link
                            to="/privacy"
                            className="text-primary-600 hover:text-primary-700 underline"
                          >
                            Datenschutzerklärung
                          </Link>{" "}
                          zu
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center"
                      >
                        <HiMail className="w-5 h-5 mr-2" />
                        Newsletter abonnieren
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Urlaubsschutzpaket Section */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-8 text-white h-full relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4">
                      <HiShieldCheck className="w-20 h-20 text-white" />
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <HiEmojiHappy className="w-16 h-16 text-white" />
                    </div>
                  </div>

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiShieldCheck className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        Urlaubsschutzpaket
                      </h3>
                      <p className="text-primary-100 text-sm">
                        Sorgenfrei reisen mit unserem Schutzpaket
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="text-4xl font-black mb-2">ab 9,90€</div>
                      <div className="text-primary-200 text-sm">pro Tag</div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center">
                        <HiCheckCircle className="w-5 h-5 text-white mr-3" />
                        <span className="text-sm">Stornoversicherung</span>
                      </div>
                      <div className="flex items-center">
                        <HiCheckCircle className="w-5 h-5 text-white mr-3" />
                        <span className="text-sm">
                          Selbstbeteiligung-Reduzierung
                        </span>
                      </div>
                      <div className="flex items-center">
                        <HiCheckCircle className="w-5 h-5 text-white mr-3" />
                        <span className="text-sm">24h Pannenhilfe</span>
                      </div>
                      <div className="flex items-center">
                        <HiCheckCircle className="w-5 h-5 text-white mr-3" />
                        <span className="text-sm">Rücktransport-Service</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button className="w-full bg-white text-primary-600 py-3 rounded-xl font-bold hover:bg-primary-50 transition-colors duration-200 flex items-center justify-center group">
                      <HiDocumentDownload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Flyer PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
