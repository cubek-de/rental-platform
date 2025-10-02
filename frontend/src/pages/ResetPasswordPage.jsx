import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button, Label, Spinner } from "flowbite-react";
import {
  HiLockClosed,
  HiEye,
  HiEyeOff,
  HiCheckCircle,
  HiExclamation,
  HiShieldCheck,
} from "react-icons/hi";
import toast, { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    document.title = "Passwort zurücksetzen | FAIRmietung";
  }, []);

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten"
      )
      .required("Passwort ist erforderlich"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwörter müssen übereinstimmen")
      .required("Passwort bestätigen ist erforderlich"),
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await resetPassword(token, values.password);
      setIsSuccess(true);
      toast.success("Passwort erfolgreich zurückgesetzt!");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Fehler beim Zurücksetzen des Passworts");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Toaster position="top-right" />
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-6">
              <HiCheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Passwort erfolgreich zurückgesetzt
            </h1>
            <p className="text-gray-600 mb-6">
              Ihr Passwort wurde erfolgreich geändert. Sie werden automatisch
              zur Anmeldung weitergeleitet.
            </p>
            <Link
              to="/login"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Jetzt anmelden
            </Link>
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
            <HiShieldCheck className="w-32 h-32 transform rotate-12" />
          </div>
          <div className="absolute top-20 right-20 text-white/8 animate-pulse delay-1000">
            <HiLockClosed className="w-24 h-24 transform -rotate-6" />
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
              <HiShieldCheck className="w-8 h-8 text-white flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold">Sichere Verschlüsselung</h3>
                <p className="text-sm text-white/80">
                  Ihr neues Passwort wird sicher verschlüsselt
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <HiLockClosed className="w-8 h-8 text-white flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold">Starke Sicherheit</h3>
                <p className="text-sm text-white/80">
                  Wählen Sie ein starkes, einzigartiges Passwort
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Neues Passwort erstellen
            </h2>
            <p className="text-gray-600">
              Geben Sie Ihr neues Passwort ein. Stellen Sie sicher, dass es
              sicher und einzigartig ist.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Formik
              initialValues={{ password: "", confirmPassword: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isValid, touched, values }) => (
                <Form className="space-y-6">
                  <div>
                    <Label htmlFor="password" className="mb-2 block">
                      Neues Passwort
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <HiLockClosed className="w-5 h-5 text-gray-400" />
                      </div>
                      <Field
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        placeholder="Ihr neues Passwort"
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <HiEyeOff className="w-5 h-5 text-gray-400" />
                        ) : (
                          <HiEye className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="mt-1 text-sm text-red-600"
                    />

                    {/* Password strength indicator */}
                    {values.password && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-600 mb-1">
                          Passwort-Stärke:
                        </div>
                        <div className="flex space-x-1">
                          {[
                            { test: /.{8,}/, label: "Min. 8 Zeichen" },
                            { test: /[a-z]/, label: "Kleinbuchstabe" },
                            { test: /[A-Z]/, label: "Großbuchstabe" },
                            { test: /\d/, label: "Zahl" },
                            { test: /[@$!%*?&]/, label: "Sonderzeichen" },
                          ].map((rule, index) => (
                            <div
                              key={index}
                              className={`h-1 flex-1 rounded ${
                                rule.test.test(values.password)
                                  ? "bg-green-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="mb-2 block">
                      Passwort bestätigen
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <HiLockClosed className="w-5 h-5 text-gray-400" />
                      </div>
                      <Field
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Passwort wiederholen"
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <HiEyeOff className="w-5 h-5 text-gray-400" />
                        ) : (
                          <HiEye className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="confirmPassword"
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
                        Passwort wird gesetzt...
                      </>
                    ) : (
                      "Passwort zurücksetzen"
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
                Zurück zur Anmeldung
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
