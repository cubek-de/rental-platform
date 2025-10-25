import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import axios from 'axios';

// Step components
import DateSelectionStep from './steps/DateSelectionStep';
import GuestInfoStep from './steps/GuestInfoStep';
import InsuranceStep from './steps/InsuranceStep';
import PaymentOptionStep from './steps/PaymentOptionStep';
import PaymentStep from './steps/PaymentStep';
import ConfirmationStep from './steps/ConfirmationStep';

// Sidebar
import PriceSummary from './PriceSummary';

// Icons
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const STEPS = [
  { id: 1, name: 'Reisedaten', component: DateSelectionStep },
  { id: 2, name: 'Gäste-Info', component: GuestInfoStep },
  { id: 3, name: 'Versicherung', component: InsuranceStep },
  { id: 4, name: 'Zahlung', component: PaymentOptionStep },
  { id: 5, name: 'Bezahlen', component: PaymentStep },
  { id: 6, name: 'Bestätigung', component: ConfirmationStep },
];

const BookingWizard = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState('');

  // Booking data
  const [bookingData, setBookingData] = useState({
    // Step 1: Dates
    startDate: null,
    endDate: null,
    numberOfDays: 0,

    // Step 2: Guest & Driver Info
    guestInfo: {
      adults: 2,
      children: 0,
      pets: 0,
    },
    driverInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      licenseNumber: '',
      licenseCountry: 'DE',
      licenseIssueDate: '',
      licenseExpiryDate: '',
      licenseCategory: 'B',
      additionalDrivers: [],
    },

    // Step 3: Insurance
    insurance: 'standard',

    // Step 4: Payment Option
    paymentOption: 'full', // 'full' or 'split'

    // Step 5: Extras
    extras: [],

    // Pricing (calculated)
    pricing: {
      basePrice: 0,
      insurancePrice: 0,
      extrasPrice: 0,
      serviceFee: 0,
      cleaningFee: 0,
      discount: 0,
      taxAmount: 0,
      totalAmount: 0,
      onlineAmount: 0,
      cashAmount: 0,
    },

    // Booking result
    bookingId: null,
    paymentIntentId: null,
  });

  // Fetch vehicle data
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/vehicles/${slug}`);
        if (response.data.success) {
          setVehicle(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error);
        toast.error('Fahrzeug konnte nicht geladen werden');
        navigate('/vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [slug, navigate]);

  // Update booking data
  const updateBookingData = (data) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  // Go to next step
  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Go to previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Render current step component
  const renderStep = () => {
    const StepComponent = STEPS[currentStep - 1].component;

    return (
      <StepComponent
        vehicle={vehicle}
        bookingData={bookingData}
        updateBookingData={updateBookingData}
        nextStep={nextStep}
        prevStep={prevStep}
        currentStep={currentStep}
        setClientSecret={setClientSecret}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/vehicles/${slug}`)}
            className="text-emerald-600 hover:text-emerald-700 font-medium mb-4 flex items-center"
          >
            ← Zurück zum Fahrzeug
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Buchung: {vehicle.name}
          </h1>
          <p className="text-gray-600">
            {vehicle.technicalData?.brand} {vehicle.technicalData?.model} • {vehicle.technicalData?.year}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      step.id < currentStep
                        ? 'bg-emerald-600 text-white'
                        : step.id === currentStep
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-200'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      step.id <= currentStep ? 'text-emerald-600' : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                      step.id < currentStep ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                    style={{ maxWidth: '100px' }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Step Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {currentStep === 5 && clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  {renderStep()}
                </Elements>
              ) : (
                renderStep()
              )}
            </div>
          </div>

          {/* Price Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <PriceSummary
                vehicle={vehicle}
                bookingData={bookingData}
                currentStep={currentStep}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingWizard;
