import React, { useContext, useState } from "react";
import { Button, Card, TextInput, Label, Spinner, Alert } from "flowbite-react";
import { AuthContext } from "../../context/AuthContext";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import api from "../../services/api";

const UserProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState("");

  if (!user) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="xl" />
      </div>
    );
  }

  const initialValues = {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: user.profile?.phone || "",
    address: user.profile?.address || "",
    city: user.profile?.city || "",
    postalCode: user.profile?.postalCode || "",
    country: user.profile?.country || "Deutschland",
  };

  const validationSchema = Yup.object({
    firstName: Yup.string().required("Vorname ist erforderlich"),
    lastName: Yup.string().required("Nachname ist erforderlich"),
    email: Yup.string()
      .email("Ungültige E-Mail-Adresse")
      .required("E-Mail ist erforderlich"),
    phone: Yup.string(),
    address: Yup.string(),
    city: Yup.string(),
    postalCode: Yup.string(),
    country: Yup.string(),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setUpdateError("");
      const response = await api.put("/users/profile", values);
      setUser({ ...user, ...response.data });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      setIsEditing(false);
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Profils:", error);
      setUpdateError(
        error.response?.data?.message ||
          "Fehler beim Aktualisieren des Profils."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Persönliche Informationen</h2>
        {!isEditing && (
          <Button color="light" onClick={() => setIsEditing(true)}>
            Bearbeiten
          </Button>
        )}
      </div>

      {updateSuccess && (
        <Alert color="success" className="mb-4">
          Profil erfolgreich aktualisiert!
        </Alert>
      )}

      {updateError && (
        <Alert color="failure" className="mb-4">
          {updateError}
        </Alert>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="firstName" value="Vorname" />
                <Field
                  as={TextInput}
                  id="firstName"
                  name="firstName"
                  readOnly={!isEditing}
                  color={
                    errors.firstName && touched.firstName
                      ? "failure"
                      : undefined
                  }
                  helperText={
                    errors.firstName && touched.firstName
                      ? errors.firstName
                      : null
                  }
                />
              </div>

              <div>
                <Label htmlFor="lastName" value="Nachname" />
                <Field
                  as={TextInput}
                  id="lastName"
                  name="lastName"
                  readOnly={!isEditing}
                  color={
                    errors.lastName && touched.lastName ? "failure" : undefined
                  }
                  helperText={
                    errors.lastName && touched.lastName ? errors.lastName : null
                  }
                />
              </div>

              <div>
                <Label htmlFor="email" value="E-Mail" />
                <Field
                  as={TextInput}
                  id="email"
                  name="email"
                  type="email"
                  readOnly={!isEditing}
                  color={errors.email && touched.email ? "failure" : undefined}
                  helperText={
                    errors.email && touched.email ? errors.email : null
                  }
                />
              </div>

              <div>
                <Label htmlFor="phone" value="Telefon" />
                <Field
                  as={TextInput}
                  id="phone"
                  name="phone"
                  readOnly={!isEditing}
                  color={errors.phone && touched.phone ? "failure" : undefined}
                  helperText={
                    errors.phone && touched.phone ? errors.phone : null
                  }
                />
              </div>

              <div>
                <Label htmlFor="address" value="Adresse" />
                <Field
                  as={TextInput}
                  id="address"
                  name="address"
                  readOnly={!isEditing}
                  color={
                    errors.address && touched.address ? "failure" : undefined
                  }
                  helperText={
                    errors.address && touched.address ? errors.address : null
                  }
                />
              </div>

              <div>
                <Label htmlFor="city" value="Stadt" />
                <Field
                  as={TextInput}
                  id="city"
                  name="city"
                  readOnly={!isEditing}
                  color={errors.city && touched.city ? "failure" : undefined}
                  helperText={errors.city && touched.city ? errors.city : null}
                />
              </div>

              <div>
                <Label htmlFor="postalCode" value="Postleitzahl" />
                <Field
                  as={TextInput}
                  id="postalCode"
                  name="postalCode"
                  readOnly={!isEditing}
                  color={
                    errors.postalCode && touched.postalCode
                      ? "failure"
                      : undefined
                  }
                  helperText={
                    errors.postalCode && touched.postalCode
                      ? errors.postalCode
                      : null
                  }
                />
              </div>

              <div>
                <Label htmlFor="country" value="Land" />
                <Field
                  as={TextInput}
                  id="country"
                  name="country"
                  readOnly={!isEditing}
                  color={
                    errors.country && touched.country ? "failure" : undefined
                  }
                  helperText={
                    errors.country && touched.country ? errors.country : null
                  }
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Speichern...
                    </>
                  ) : (
                    "Änderungen speichern"
                  )}
                </Button>
                <Button color="light" onClick={() => setIsEditing(false)}>
                  Abbrechen
                </Button>
              </div>
            )}
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default UserProfile;
