import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/auth/RegisterForm";
import api from "../services/api";
import toast, { Toaster } from "react-hot-toast";
import {
  HiGift,
  HiUserGroup,
  HiTrendingUp,
  HiTicket,
  HiCurrencyEuro,
  HiLocationMarker,
} from "react-icons/hi";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Registrieren | FAIRmietung";
  }, []);

  const handleRegister = async (formData) => {
    setLoading(true);

    // Show loading toast
    const loadingToast = toast.loading("Registrierung wird verarbeitet...", {
      style: {
        background: "#3B82F6",
        color: "#fff",
      },
    });

    try {
      console.log("Registration data:", formData);

      // Prepare data for API call
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        // Only include phone if it exists in formData
        ...(formData.phone && { phone: formData.phone.trim() }),
      };

      console.log("Sending to API:", registrationData);

      // Call the registration API
      const response = await api.post("/api/auth/register", registrationData);

      console.log("Registration successful:", response.data);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show success toast
      toast.success(
        "Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail-Adresse.",
        {
          duration: 4000,
          icon: "🎉",
        }
      );

      // Wait a moment for the toast to be visible before navigation
      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail-Adresse und melden Sie sich an.",
          },
        });
      }, 2000); // 2 second delay
    } catch (error) {
      console.error("Registration error:", error);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Handle network errors
      if (!error.response) {
        toast.error(
          "Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung."
        );
        return;
      }

      // Handle specific error messages
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        if (Array.isArray(validationErrors)) {
          validationErrors.forEach((err) =>
            toast.error(err.msg || err.message)
          );
        } else {
          toast.error("Validierungsfehler aufgetreten");
        }
      } else if (error.response?.status === 409) {
        toast.error("Ein Benutzer mit dieser E-Mail-Adresse existiert bereits");
      } else if (error.response?.status >= 500) {
        toast.error("Serverfehler. Bitte versuchen Sie es später erneut.");
      } else {
        toast.error(
          "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: "#363636",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
            borderRadius: "12px",
            padding: "16px",
          },
          success: {
            duration: 4000,
            style: {
              background: "#10B981",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#10B981",
            },
          },
          error: {
            duration: 6000,
            style: {
              background: "#EF4444",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#EF4444",
            },
          },
        }}
      />

      {/* Left Side - Brand Showcase */}
      <div className="bg-gradient-to-bl from-primary-600 via-blue-500 to-indigo-600 relative overflow-hidden flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-16 left-12 text-white/10 animate-pulse">
            <HiGift className="w-28 h-28 transform rotate-12" />
          </div>
          <div className="absolute top-24 right-16 text-white/8 animate-pulse delay-1200">
            <HiUserGroup className="w-32 h-32 transform -rotate-12" />
          </div>
          <div className="absolute bottom-24 left-16 text-white/6 animate-pulse delay-700">
            <HiTrendingUp className="w-24 h-24 transform rotate-45" />
          </div>
          <div className="absolute bottom-12 right-20 text-white/10 animate-pulse delay-1800">
            <HiTicket className="w-26 h-26 transform -rotate-6" />
          </div>
          <div className="absolute top-1/2 left-1/3 text-white/5 animate-pulse delay-2200">
            <HiCurrencyEuro className="w-20 h-20 transform rotate-30" />
          </div>
          <div className="absolute top-2/5 right-1/4 text-white/8 animate-pulse delay-900">
            <HiLocationMarker className="w-16 h-16 transform -rotate-45" />
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
              Starten Sie Ihr Abenteuer!
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed">
              Werden Sie Teil der FAIRmietung-Familie und entdecken Sie die Welt
              der fairen Wohnmobilmiete mit exklusiven Mitgliedervorteilen.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <HiGift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Willkommensbonus</h3>
                <p className="text-primary-100">
                  10% Rabatt auf Ihre erste Buchung
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <HiUserGroup className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Community Vorteile
                </h3>
                <p className="text-primary-100">
                  Exklusive Angebote nur für Mitglieder
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <HiTrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Treuepunkte sammeln
                </h3>
                <p className="text-primary-100">
                  Bei jeder Buchung Punkte für Rabatte sammeln
                </p>
              </div>
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-primary-100 mb-4 text-center">
              Bereits ein Konto?
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105"
            >
              Jetzt anmelden
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-2xl flex flex-col justify-center">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-6 text-center">
            <img
              src="https://926c016b950324a3223fa88ada4966be.cdn.bubble.io/cdn-cgi/image/w=96,h=96,f=auto,dpr=1,fit=contain/f1736249065396x110582480505159840/Logo_FAIRmietung-Haltern.png"
              alt="FAIRmietung Logo"
              className="h-16 w-auto mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900">
              Konto erstellen
            </h2>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-6 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Konto erstellen
            </h2>
            <p className="text-lg text-gray-600">
              Erstellen Sie Ihr kostenloses FAIRmietung Konto
            </p>
          </div>

          <div className="flex justify-center">
            <RegisterForm onSubmit={handleRegister} isLoading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
