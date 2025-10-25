import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import { calculateDays } from '../../../constants/insurance';

const DateSelectionStep = ({ vehicle, bookingData, updateBookingData, nextStep }) => {
  const [startDate, setStartDate] = useState(bookingData.startDate || null);
  const [endDate, setEndDate] = useState(bookingData.endDate || null);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Fetch blocked dates from existing bookings
  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/vehicles/${vehicle._id}/availability`
        );

        if (response.data.success) {
          // Convert blocked date ranges to individual dates
          const blocked = [];
          response.data.data.bookedDates?.forEach(range => {
            const start = new Date(range.start);
            const end = new Date(range.end);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
              blocked.push(new Date(d));
            }
          });
          setBlockedDates(blocked);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };

    if (vehicle?._id) {
      fetchBlockedDates();
    }
  }, [vehicle]);

  // Check if a date is blocked
  const isDateBlocked = (date) => {
    return blockedDates.some(
      (blocked) =>
        blocked.getDate() === date.getDate() &&
        blocked.getMonth() === date.getMonth() &&
        blocked.getFullYear() === date.getFullYear()
    );
  };

  // Handle date selection
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  // Check availability and proceed
  const handleContinue = async () => {
    if (!startDate || !endDate) {
      toast.error('Bitte wählen Sie Start- und Enddatum');
      return;
    }

    // Check minimum rental duration
    const minDuration = vehicle.availability?.minRentalDuration || 1;
    const days = calculateDays(startDate, endDate);

    if (days < minDuration) {
      toast.error(`Mindestmietdauer beträgt ${minDuration} ${minDuration === 1 ? 'Tag' : 'Tage'}`);
      return;
    }

    setCheckingAvailability(true);

    try {
      // Check availability with backend
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/vehicles/${vehicle._id}/availability`,
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        }
      );

      if (response.data.success && response.data.data.available) {
        // Update booking data
        updateBookingData({
          startDate,
          endDate,
          numberOfDays: days,
        });
        nextStep();
      } else {
        toast.error('Fahrzeug ist in diesem Zeitraum nicht verfügbar');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Fehler bei der Verfügbarkeitsprüfung');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const numberOfDays = startDate && endDate ? calculateDays(startDate, endDate) : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Wählen Sie Ihre Reisedaten</h2>
      <p className="text-gray-600 mb-8">
        Wählen Sie das Start- und Enddatum für Ihre Wohnmobilmiete
      </p>

      <div className="space-y-6">
        {/* Date Picker */}
        <div className="bg-gray-50 rounded-xl p-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            <CalendarIcon className="w-5 h-5 inline mr-2" />
            Mietdauer wählen
          </label>

          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
            minDate={new Date()}
            monthsShown={2}
            filterDate={(date) => !isDateBlocked(date)}
            className="w-full"
            calendarClassName="custom-datepicker"
          />

          {/* Selected dates info */}
          {startDate && endDate && (
            <div className="mt-6 bg-emerald-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">Abholung</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {startDate.toLocaleDateString('de-DE', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-emerald-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">Rückgabe</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {endDate.toLocaleDateString('de-DE', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-emerald-200">
                <p className="text-center text-emerald-700 font-semibold">
                  {numberOfDays} {numberOfDays === 1 ? 'Tag' : 'Tage'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Rental Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Wichtige Informationen</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Mindestmietdauer: {vehicle.availability?.minRentalDuration || 1} {(vehicle.availability?.minRentalDuration || 1) === 1 ? 'Tag' : 'Tage'}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Abholung: ab 14:00 Uhr</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Rückgabe: bis 11:00 Uhr</span>
            </li>
            {numberOfDays >= 7 && (
              <li className="flex items-start text-emerald-600 font-medium">
                <span className="mr-2">✓</span>
                <span>Sie erhalten {numberOfDays >= 30 ? '20%' : '10%'} Rabatt!</span>
              </li>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            onClick={handleContinue}
            disabled={!startDate || !endDate || checkingAvailability}
            className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {checkingAvailability ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Prüfen...
              </span>
            ) : (
              'Weiter zur Gäste-Info'
            )}
          </button>
        </div>
      </div>

      {/* Custom CSS for DatePicker */}
      <style>{`
        .react-datepicker {
          border: none !important;
          background: transparent !important;
        }
        .react-datepicker__month-container {
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--in-selecting-range,
        .react-datepicker__day--in-range {
          background-color: #10b981 !important;
          color: white !important;
        }
        .react-datepicker__day--keyboard-selected {
          background-color: #059669 !important;
        }
        .react-datepicker__day:hover {
          background-color: #d1fae5 !important;
        }
        .react-datepicker__day--disabled {
          color: #d1d5db !important;
          cursor: not-allowed !important;
          background-color: #f9fafb !important;
        }
      `}</style>
    </div>
  );
};

export default DateSelectionStep;
