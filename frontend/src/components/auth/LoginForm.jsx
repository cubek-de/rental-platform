import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card, Button, TextInput, Label, Alert, Spinner } from "flowbite-react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { HiMail, HiLockClosed, HiExclamationCircle } from "react-icons/hi";
import { AuthContext } from "../../context/AuthContext";

const LoginForm = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Ungültige E-Mail-Adresse")
      .required("E-Mail ist erforderlich"),
    password: Yup.string().required("Passwort ist erforderlich"),
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    setError("");

    try {
      const result = await login(values.email, values.password);
      // Navigate to role-specific dashboard or the original requested page
      navigate(result.redirectPath || from, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Login fehlgeschlagen. Bitte versuchen Sie es erneut."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card className="w-full max-w-md">
      {error && (
        <Alert color="failure" icon={HiExclamationCircle} className="mb-4">
          {error}
        </Alert>
      )}

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form className="flex flex-col gap-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="E-Mail" />
              </div>
              <TextInput
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                icon={HiMail}
                color={touched.email && errors.email ? "failure" : undefined}
                helperText={touched.email && errors.email ? errors.email : null}
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="password" value="Passwort" />
              </div>
              <TextInput
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                icon={HiLockClosed}
                color={
                  touched.password && errors.password ? "failure" : undefined
                }
                helperText={
                  touched.password && errors.password ? errors.password : null
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <Label htmlFor="remember">Angemeldet bleiben</Label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:underline"
              >
                Passwort vergessen?
              </Link>
            </div>

            <Button
              type="submit"
              className="bg-primary-500 border-2 border-primary-500 text-white hover:bg-white hover:text-primary-500 px-6 py-2 rounded-lg font-medium transition-colors w-full mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" light={true} className="mr-2" />
                  Wird angemeldet...
                </>
              ) : (
                "Anmelden"
              )}
            </Button>

            <p className="text-sm text-gray-600 text-center mt-4">
              Noch kein Konto?{" "}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:underline"
              >
                Registrieren
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default LoginForm;
