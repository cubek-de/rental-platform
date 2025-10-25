import React, { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button, Spinner, Alert } from "flowbite-react";
import { HiExclamationCircle } from "react-icons/hi";
import api from "../../services/api";

const StripePaymentForm = ({ bookingId, amount, paymentOption, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Confirm the payment on the client
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/confirmation/${bookingId}`,
        },
        redirect: "if_required",
      });

      if (stripeError) {
        setError(stripeError.message);
        if (onError) {
          onError(stripeError);
        }
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Confirm payment on backend
        try {
          await api.post("/api/payment/confirm-payment", {
            paymentIntentId: paymentIntent.id,
            bookingId,
          });
        } catch (confirmError) {
          console.error("Backend confirmation error:", confirmError);
        }

        // Payment successful
        if (onSuccess) {
          onSuccess({ booking: { _id: bookingId, bookingNumber: bookingId } });
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Zahlung fehlgeschlagen";
      setError(errorMessage);
      if (onError) {
        onError({ message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert color="failure" icon={HiExclamationCircle}>
          {error}
        </Alert>
      )}

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-medium mb-4">Zahlungsinformationen</h4>
        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["card"],
          }}
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-medium">Zu zahlender Betrag:</span>
          <span className="text-2xl font-bold text-blue-600">
            €{amount.toFixed(2)}
          </span>
        </div>
        {paymentOption === "split" && (
          <p className="text-sm text-gray-600 mt-2">
            Dies ist die erste Rate (50%). Die zweite Rate wird bei Abholung fällig.
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        size="lg"
      >
        {loading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Zahlung wird verarbeitet...
          </>
        ) : (
          <>Jetzt bezahlen €{amount.toFixed(2)}</>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Ihre Zahlung wird sicher über Stripe verarbeitet. Wir speichern keine
        Kreditkarteninformationen.
      </p>
    </form>
  );
};

export default StripePaymentForm;
