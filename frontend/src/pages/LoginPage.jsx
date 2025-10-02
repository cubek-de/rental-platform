import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import {
  HiShieldCheck,
  HiStar,
  HiLightningBolt,
  HiHeart,
  HiSparkles,
  HiGlobe,
} from "react-icons/hi";

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Anmelden | FAIRmietung";
  }, []);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Brand Showcase */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-blue-600 relative overflow-hidden flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 text-white/10 animate-pulse">
            <HiShieldCheck className="w-32 h-32 transform rotate-12" />
          </div>
          <div className="absolute top-20 right-20 text-white/8 animate-pulse delay-1000">
            <HiStar className="w-24 h-24 transform -rotate-6" />
          </div>
          <div className="absolute bottom-20 left-20 text-white/6 animate-pulse delay-500">
            <HiHeart className="w-28 h-28 transform rotate-45" />
          </div>
          <div className="absolute bottom-10 right-16 text-white/10 animate-pulse delay-1500">
            <HiLightningBolt className="w-20 h-20 transform -rotate-12" />
          </div>
          <div className="absolute top-1/2 left-1/4 text-white/5 animate-pulse delay-2000">
            <HiSparkles className="w-16 h-16 transform rotate-30" />
          </div>
          <div className="absolute top-1/3 right-1/3 text-white/8 animate-pulse delay-800">
            <HiGlobe className="w-18 h-18 transform -rotate-45" />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-white p-8 max-w-lg">
          {/* Logo */}
          <div className="mb-8">
            <img
              src="https://926c016b950324a3223fa88ada4966be.cdn.bubble.io/cdn-cgi/image/w=96,h=100,f=auto,dpr=1,fit=contain/f1737462329590x960045882346967900/Logo_FAIRmietung-Haltern_wei%E2%94%9C%C6%92.png"
              alt="FAIRmietung Logo"
              className="h-20 w-auto mb-4"
            />
          </div>

          {/* Welcome Message */}
          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Willkommen zurück!
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed">
              Melden Sie sich an und entdecken Sie unvergessliche
              Wohnmobil-Abenteuer mit FAIRmietung – Ihrem Partner für faire
              Preise und erstklassigen Service.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <HiShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Faire Preise garantiert
                </h3>
                <p className="text-primary-100">
                  Transparente Preisgestaltung ohne versteckte Kosten
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <HiStar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Premium Fahrzeugflotte
                </h3>
                <p className="text-primary-100">
                  Hochwertige Wohnmobile für jeden Anspruch
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <HiLightningBolt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Schnelle Buchung</h3>
                <p className="text-primary-100">
                  In wenigen Schritten zu Ihrem Traumurlaub
                </p>
              </div>
            </div>
          </div>

          {/* Registration Link */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-primary-100 mb-4 text-center">
              Noch kein Konto?
            </p>
            <button
              onClick={() => navigate("/register")}
              className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105"
            >
              Kostenloses Konto erstellen
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-2xl flex flex-col justify-center">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-6 text-center">
            <img
              src="https://926c016b950324a3223fa88ada4966be.cdn.bubble.io/cdn-cgi/image/w=96,h=96,f=auto,dpr=1,fit=contain/f1736249065396x110582480505159840/Logo_FAIRmietung-Haltern.png"
              alt="FAIRmietung Logo"
              className="h-16 w-auto mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900">Anmelden</h2>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-6 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Anmelden</h2>
            <p className="text-lg text-gray-600">
              Melden Sie sich in Ihrem Konto an
            </p>
          </div>

          <div className="flex justify-center">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
