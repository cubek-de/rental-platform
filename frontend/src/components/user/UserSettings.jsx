import React, { useContext, useState } from "react";
import {
  Button,
  Card,
  Label,
  TextInput,
  Checkbox,
  Alert,
  Spinner,
} from "flowbite-react";
import { AuthContext } from "../../context/AuthContext";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import api from "../../services/api";

const UserSettings = () => {
  const { user, setUser } = useContext(AuthContext);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  const passwordInitialValues = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const notificationInitialValues = {
    emailNotifications: user?.settings?.emailNotifications ?? true,
    marketingEmails: user?.settings?.marketingEmails ?? false,
    bookingUpdates: user?.settings?.bookingUpdates ?? true,
    promotions: user?.settings?.promotions ?? false,
  };

  const passwordValidationSchema = Yup.object({
    currentPassword: Yup.string().required(
      "Aktuelles Passwort ist erforderlich"
    ),
    newPassword: Yup.string()
      .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein")
      .matches(/[a-z]/, "Muss mindestens einen Kleinbuchstaben enthalten")
      .matches(/[A-Z]/, "Muss mindestens einen Großbuchstaben enthalten")
      .matches(/[0-9]/, "Muss mindestens eine Zahl enthalten")
      .required("Neues Passwort ist erforderlich"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwörter müssen übereinstimmen")
      .required("Passwortbestätigung ist erforderlich"),
  });

  const handlePasswordChange = async (values, { setSubmitting, resetForm }) => {
    try {
      setPasswordError("");
      await api.put("/users/password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setPasswordSuccess(true);
      resetForm();

      setTimeout(() => {
        setPasswordSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Fehler beim Ändern des Passworts:", error);
      setPasswordError(
        error.response?.data?.message || "Fehler beim Ändern des Passworts."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotificationChange = async (values, { setSubmitting }) => {
    try {
      const response = await api.put("/users/settings", values);

      // Update user in context with new settings
      setUser({ ...user, settings: response.data.settings });

      setNotificationSuccess(true);
      setTimeout(() => {
        setNotificationSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Einstellungen:", error);
      alert("Die Einstellungen konnten nicht aktualisiert werden.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
      )
    ) {
      // Additional confirmation could go here
      alert(
        "Bitte kontaktieren Sie den Kundendienst, um Ihr Konto zu löschen."
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold">Passwort ändern</h2>
        <p className="text-gray-500 mb-4">
          Aus Sicherheitsgründen empfehlen wir, Ihr Passwort regelmäßig zu
          ändern.
        </p>

        {passwordSuccess && (
          <Alert color="success" className="mb-4">
            Ihr Passwort wurde erfolgreich geändert!
          </Alert>
        )}

        {passwordError && (
          <Alert color="failure" className="mb-4">
            {passwordError}
          </Alert>
        )}

        <Formik
          initialValues={passwordInitialValues}
          validationSchema={passwordValidationSchema}
          onSubmit={handlePasswordChange}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" value="Aktuelles Passwort" />
                  <Field
                    as={TextInput}
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    color={
                      errors.currentPassword && touched.currentPassword
                        ? "failure"
                        : undefined
                    }
                    helperText={
                      errors.currentPassword && touched.currentPassword
                        ? errors.currentPassword
                        : null
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword" value="Neues Passwort" />
                  <Field
                    as={TextInput}
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    color={
                      errors.newPassword && touched.newPassword
                        ? "failure"
                        : undefined
                    }
                    helperText={
                      errors.newPassword && touched.newPassword
                        ? errors.newPassword
                        : null
                    }
                  />
                </div>

                <div>
                  <Label
                    htmlFor="confirmPassword"
                    value="Passwort bestätigen"
                  />
                  <Field
                    as={TextInput}
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    color={
                      errors.confirmPassword && touched.confirmPassword
                        ? "failure"
                        : undefined
                    }
                    helperText={
                      errors.confirmPassword && touched.confirmPassword
                        ? errors.confirmPassword
                        : null
                    }
                  />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Wird bearbeitet...
                    </>
                  ) : (
                    "Passwort ändern"
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">
          Benachrichtigungseinstellungen
        </h2>
        <p className="text-gray-500 mb-4">
          Wählen Sie aus, welche Benachrichtigungen Sie erhalten möchten.
        </p>

        {notificationSuccess && (
          <Alert color="success" className="mb-4">
            Ihre Einstellungen wurden erfolgreich aktualisiert!
          </Alert>
        )}

        <Formik
          initialValues={notificationInitialValues}
          onSubmit={handleNotificationChange}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Field
                    as={Checkbox}
                    id="emailNotifications"
                    name="emailNotifications"
                  />
                  <Label htmlFor="emailNotifications">
                    E-Mail-Benachrichtigungen aktivieren
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Field
                    as={Checkbox}
                    id="bookingUpdates"
                    name="bookingUpdates"
                  />
                  <Label htmlFor="bookingUpdates">
                    Updates zu meinen Buchungen erhalten
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Field
                    as={Checkbox}
                    id="marketingEmails"
                    name="marketingEmails"
                  />
                  <Label htmlFor="marketingEmails">
                    Marketing-E-Mails erhalten
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Field as={Checkbox} id="promotions" name="promotions" />
                  <Label htmlFor="promotions">
                    Sonderangebote und Rabatte erhalten
                  </Label>
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Wird bearbeitet...
                    </>
                  ) : (
                    "Einstellungen speichern"
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-red-600">Gefahrenzone</h2>
        <p className="text-gray-500 mb-4">
          Wenn Sie Ihr Konto löschen, werden alle Ihre Daten dauerhaft entfernt.
          Diese Aktion kann nicht rückgängig gemacht werden.
        </p>

        <Button color="failure" onClick={handleDeleteAccount}>
          Konto löschen
        </Button>
      </Card>
    </div>
  );
};

export default UserSettings;
