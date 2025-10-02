import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Label, TextInput, Button, Card } from "flowbite-react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const RegisterForm = ({ onSubmit, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, "Vorname muss mindestens 2 Zeichen lang sein")
      .required("Vorname ist erforderlich"),
    lastName: Yup.string()
      .min(2, "Nachname muss mindestens 2 Zeichen lang sein")
      .required("Nachname ist erforderlich"),
    email: Yup.string()
      .email("Ungültige E-Mail-Adresse")
      .required("E-Mail ist erforderlich"),
    password: Yup.string()
      .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
      .matches(
        /[A-Z]/,
        "Passwort muss mindestens einen Großbuchstaben enthalten"
      )
      .matches(
        /[a-z]/,
        "Passwort muss mindestens einen Kleinbuchstaben enthalten"
      )
      .matches(/\d/, "Passwort muss mindestens eine Zahl enthalten")
      .matches(
        /[@$!%*?&]/,
        "Passwort muss mindestens ein Sonderzeichen enthalten"
      )
      .required("Passwort ist erforderlich"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwörter müssen übereinstimmen")
      .required("Passwort bestätigen ist erforderlich"),
    termsAccepted: Yup.boolean()
      .oneOf([true], "Sie müssen den Nutzungsbedingungen zustimmen")
      .required("Zustimmung zu den Nutzungsbedingungen ist erforderlich"),
    privacyAccepted: Yup.boolean()
      .oneOf([true], "Sie müssen der Datenschutzerklärung zustimmen")
      .required("Zustimmung zur Datenschutzerklärung ist erforderlich"),
  });

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
    privacyAccepted: false,
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue, errors, touched }) => (
          <Form className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-700"
                >
                  Vorname *
                </Label>
                <Field name="firstName">
                  {({ field }) => (
                    <TextInput
                      {...field}
                      id="firstName"
                      type="text"
                      placeholder="Ihr Vorname"
                      className="text-sm"
                      sizing="md"
                      style={{
                        borderRadius: "8px",
                        fontSize: "14px",
                        padding: "12px",
                      }}
                      color={
                        errors.firstName && touched.firstName
                          ? "failure"
                          : "gray"
                      }
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="firstName"
                  component="div"
                  className="text-red-500 text-xs font-medium"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-700"
                >
                  Nachname *
                </Label>
                <Field name="lastName">
                  {({ field }) => (
                    <TextInput
                      {...field}
                      id="lastName"
                      type="text"
                      placeholder="Ihr Nachname"
                      className="text-sm"
                      sizing="md"
                      style={{
                        borderRadius: "8px",
                        fontSize: "14px",
                        padding: "12px",
                      }}
                      color={
                        errors.lastName && touched.lastName ? "failure" : "gray"
                      }
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="lastName"
                  component="div"
                  className="text-red-500 text-xs font-medium"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  E-Mail-Adresse *
                </Label>
                <Field name="email">
                  {({ field }) => (
                    <TextInput
                      {...field}
                      id="email"
                      type="email"
                      placeholder="ihre.email@beispiel.de"
                      className="text-sm"
                      sizing="md"
                      style={{
                        borderRadius: "8px",
                        fontSize: "14px",
                        padding: "12px",
                      }}
                      color={errors.email && touched.email ? "failure" : "gray"}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-xs font-medium"
                />
              </div>
              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Passwort *
                </Label>
                <div className="relative">
                  <Field name="password">
                    {({ field }) => (
                      <TextInput
                        {...field}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mindestens 8 Zeichen"
                        sizing="md"
                        style={{
                          borderRadius: "8px",
                          fontSize: "14px",
                          padding: "12px",
                        }}
                        color={
                          errors.password && touched.password
                            ? "failure"
                            : "gray"
                        }
                      />
                    )}
                  </Field>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-xs font-medium"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  Passwort bestätigen *
                </Label>
                <div className="relative">
                  <Field name="confirmPassword">
                    {({ field }) => (
                      <TextInput
                        {...field}
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Passwort wiederholen"
                        className="text-sm"
                        sizing="md"
                        style={{
                          borderRadius: "8px",
                          fontSize: "14px",
                          padding: "12px",
                        }}
                        color={
                          errors.confirmPassword && touched.confirmPassword
                            ? "failure"
                            : "gray"
                        }
                      />
                    )}
                  </Field>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-xs font-medium"
                />
              </div>
            </div>

            {/* Password Section */}

            {/* Terms and Privacy Section */}
            <div className="space-y-4 pt-6">
              {/* Terms Checkbox */}
              <div className="flex items-start space-x-3">
                <Field name="termsAccepted">
                  {({ field }) => (
                    <input
                      {...field}
                      id="termsAccepted"
                      type="checkbox"
                      checked={values.termsAccepted}
                      onChange={() =>
                        setFieldValue("termsAccepted", !values.termsAccepted)
                      }
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 mt-0.5"
                    />
                  )}
                </Field>
                <Label
                  htmlFor="termsAccepted"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Ich stimme den{" "}
                  <a
                    href="/terms"
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Nutzungsbedingungen
                  </a>{" "}
                  zu *
                </Label>
              </div>
              <ErrorMessage
                name="termsAccepted"
                component="div"
                className="text-red-500 text-xs font-medium"
              />

              {/* Privacy Checkbox */}
              <div className="flex items-start space-x-3">
                <Field name="privacyAccepted">
                  {({ field }) => (
                    <input
                      {...field}
                      id="privacyAccepted"
                      type="checkbox"
                      checked={values.privacyAccepted}
                      onChange={() =>
                        setFieldValue(
                          "privacyAccepted",
                          !values.privacyAccepted
                        )
                      }
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 mt-0.5"
                    />
                  )}
                </Field>
                <Label
                  htmlFor="privacyAccepted"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Ich stimme der{" "}
                  <a
                    href="/privacy"
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Datenschutzerklärung
                  </a>{" "}
                  zu *
                </Label>
              </div>
              <ErrorMessage
                name="privacyAccepted"
                component="div"
                className="text-red-500 text-xs font-medium"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                className="bg-primary-500 border-2 border-primary-500 text-white hover:bg-white hover:text-primary-500 px-6 py-2 rounded-lg font-medium transition-colors w-full mt-2"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Wird registriert...
                  </div>
                ) : (
                  "Registrieren"
                )}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default RegisterForm;
Form;
