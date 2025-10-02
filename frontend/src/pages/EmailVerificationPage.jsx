import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import {
  HiCheckCircle,
  HiXCircle,
  HiOutlineRefresh,
  HiOutlineMail,
} from "react-icons/hi";

const EmailVerificationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail } = useContext(AuthContext);
  const [status, setStatus] = useState("verifying"); // verifying, success, error, expired
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "E-Mail-Verifizierung | FAIRmietung";

    const handleVerification = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Ungültiger Verifizierungslink");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log("Verifying email with token:", token);

        const result = await verifyEmail(token);

        if (result.success) {
          setStatus("success");
          setMessage("Ihre E-Mail-Adresse wurde erfolgreich verifiziert!");
          toast.success(
            "E-Mail erfolgreich verifiziert! Sie können sich jetzt anmelden."
          );

          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login", {
              state: {
                message:
                  "E-Mail erfolgreich verifiziert! Sie können sich jetzt anmelden.",
              },
            });
          }, 3000);
        } else {
          setStatus("error");
          setMessage(result.message || "Verifizierung fehlgeschlagen");
          toast.error(result.message || "Verifizierung fehlgeschlagen");
        }
      } catch (error) {
        console.error("Email verification error:", error);

        if (error.response?.status === 400) {
          if (error.response.data?.message?.includes("expired")) {
            setStatus("expired");
            setMessage("Der Verifizierungslink ist abgelaufen");
          } else {
            setStatus("error");
            setMessage(
              error.response.data?.message || "Ungültiger Verifizierungslink"
            );
          }
        } else if (error.response?.status === 404) {
          setStatus("error");
          setMessage("Verifizierungslink nicht gefunden");
        } else {
          setStatus("error");
          setMessage(
            "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
          );
        }

        toast.error(
          error.response?.data?.message || "Verifizierung fehlgeschlagen"
        );
      } finally {
        setIsLoading(false);
      }
    };

    handleVerification();
  }, [token, verifyEmail, navigate]);

  const handleResendVerification = async () => {
    toast.info("Funktion zum erneuten Senden wird bald verfügbar sein");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
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

      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Logo */}
        <div className="mb-6">
          <img
            src="https://926c016b950324a3223fa88ada4966be.cdn.bubble.io/cdn-cgi/image/w=96,h=96,f=auto,dpr=1,fit=contain/f1736249065396x110582480505159840/Logo_FAIRmietung-Haltern.png"
            alt="FAIRmietung Logo"
            className="h-16 w-auto mx-auto mb-4"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto">
              <HiOutlineRefresh className="w-16 h-16 text-blue-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              E-Mail wird verifiziert...
            </h2>
            <p className="text-gray-600">
              Bitte warten Sie einen Moment, während wir Ihre E-Mail-Adresse
              verifizieren.
            </p>
          </div>
        )}

        {/* Success State */}
        {!isLoading && status === "success" && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto">
              <HiCheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Verifizierung erfolgreich!
            </h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500">
              Sie werden in wenigen Sekunden zur Anmeldung weitergeleitet...
            </p>
            <Link
              to="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Jetzt anmelden
            </Link>
          </div>
        )}

        {/* Error State */}
        {!isLoading && status === "error" && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto">
              <HiXCircle className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Verifizierung fehlgeschlagen
            </h2>
            <p className="text-gray-600">{message}</p>
            <div className="space-y-2">
              <Link
                to="/login"
                className="block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Zur Anmeldung
              </Link>
              <Link
                to="/register"
                className="block bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Neu registrieren
              </Link>
            </div>
          </div>
        )}

        {/* Expired State */}
        {!isLoading && status === "expired" && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto">
              <HiOutlineMail className="w-16 h-16 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Link abgelaufen
            </h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500">
              Verifizierungslinks sind 24 Stunden gültig.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleResendVerification}
                className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Neuen Link anfordern
              </button>
              <Link
                to="/register"
                className="block bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Neu registrieren
              </Link>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Haben Sie Probleme? Kontaktieren Sie unseren{" "}
            <a
              href="mailto:support@fairmietung.de"
              className="text-blue-600 hover:underline"
            >
              Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
