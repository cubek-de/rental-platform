import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button, Label, Spinner } from "flowbite-react";
import {
  HiMail,
  HiArrowLeft,
  HiCheckCircle,
  HiExclamation,
} from "react-icons/hi";
import toast, { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

const ForgotPasswordPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useContext(AuthContext);

  useEffect(() => {
    document.title = "Passwort vergessen | FAIRmietung";
  }, []);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Ungültige E-Mail-Adresse")
      .required("E-Mail-Adresse ist erforderlich"),
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await forgotPassword(values.email);
      setIsSubmitted(true);
      toast.success("E-Mail wurde versendet!");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Fehler beim Senden der E-Mail");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Toaster position="top-right" />
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-6">
              <HiCheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              E-Mail versendet
            </h1>
            <p className="text-gray-600 mb-6">
              Wenn ein Konto mit dieser E-Mail-Adresse existiert, haben wir
              Ihnen einen Link zum Zurücksetzen des Passworts gesendet.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Überprüfen Sie auch Ihren Spam-Ordner, falls Sie die E-Mail nicht
              in Ihrem Posteingang finden.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Zurück zur Anmeldung
              </Link>
              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Andere E-Mail-Adresse versuchen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <Toaster position="top-right" />

      {/* Left Side - Brand Showcase */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-blue-600 relative overflow-hidden flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 text-white/10 animate-pulse">
            <HiMail className="w-32 h-32 transform rotate-12" />
          </div>
          <div className="absolute top-20 right-20 text-white/8 animate-pulse delay-1000">
            <HiExclamation className="w-24 h-24 transform -rotate-6" />
          </div>
          <div className="absolute bottom-20 left-20 text-white/10 animate-pulse delay-500">
            <HiCheckCircle className="w-28 h-28 transform rotate-45" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white p-8 max-w-lg">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">FAIRmietung</h1>
            <div className="w-24 h-1 bg-white mx-auto rounded-full"></div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <HiMail className="w-8 h-8 text-white flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold">Sichere Wiederherstellung</h3>
                <p className="text-sm text-white/80">
                  Setzen Sie Ihr Passwort sicher zurück
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <HiCheckCircle className="w-8 h-8 text-white flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold">Einfach & Schnell</h3>
                <p className="text-sm text-white/80">
                  In wenigen Schritten wieder Zugang erhalten
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Passwort vergessen?
            </h2>
            <p className="text-gray-600">
              Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link
              zum Zurücksetzen Ihres Passworts.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Formik
              initialValues={{ email: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isValid, touched }) => (
                <Form className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="mb-2 block">
                      E-Mail-Adresse
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <HiMail className="w-5 h-5 text-gray-400" />
                      </div>
                      <Field
                        type="email"
                        id="email"
                        name="email"
                        placeholder="ihre.email@beispiel.de"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="bg-primary-500 border-2 border-primary-500 text-white hover:bg-white hover:text-primary-500 px-6 py-2 rounded-lg font-medium transition-colors w-full mt-2"
                    disabled={
                      loading || !isValid || Object.keys(touched).length === 0
                    }
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" light={true} className="mr-2" />
                        E-Mail wird versendet...
                      </>
                    ) : (
                      "Reset-Link senden"
                    )}
                  </Button>
                </Form>
              )}
            </Formik>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                <HiArrowLeft className="w-4 h-4 mr-1" />
                Zurück zur Anmeldung
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            Noch kein Konto?{" "}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Jetzt registrieren
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
