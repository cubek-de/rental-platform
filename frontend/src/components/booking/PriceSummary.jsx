import React, { useMemo } from 'react';
import { formatCurrency, calculateInsurancePrice, getInsurancePackage } from '../../constants/insurance';

const PriceSummary = ({ vehicle, bookingData, currentStep }) => {
  // Calculate pricing
  const pricing = useMemo(() => {
    if (!bookingData.numberOfDays || bookingData.numberOfDays === 0) {
      return {
        basePrice: 0,
        insurancePrice: 0,
        extrasPrice: 0,
        serviceFee: 0,
        cleaningFee: 0,
        discount: 0,
        subtotal: 0,
        taxAmount: 0,
        totalAmount: 0,
        onlineAmount: 0,
        cashAmount: 0,
      };
    }

    const numberOfDays = bookingData.numberOfDays;
    const dailyRate = vehicle.pricing?.basePrice?.perDay || 0;
    const basePrice = dailyRate * numberOfDays;

    // Calculate discounts
    let discount = 0;
    if (numberOfDays >= 30) {
      discount = basePrice * 0.2; // 20% for monthly
    } else if (numberOfDays >= 7) {
      discount = basePrice * 0.1; // 10% for weekly
    }

    // Calculate insurance
    const insurancePrice = calculateInsurancePrice(bookingData.insurance, numberOfDays);

    // Calculate extras (placeholder - can be extended)
    const extrasPrice = 0;

    // Calculate fees
    const cleaningFee = vehicle.pricing?.cleaningFee || 50;
    const subtotalBeforeFees = basePrice - discount + insurancePrice + extrasPrice;
    const serviceFee = subtotalBeforeFees * 0.05; // 5% service fee

    // Calculate total before tax
    const subtotal = subtotalBeforeFees + serviceFee + cleaningFee;

    // Calculate tax (19% German VAT)
    const taxRate = 0.19;
    const taxAmount = subtotal * taxRate;

    // Total amount
    const totalAmount = subtotal + taxAmount;

    // Split payment amounts
    const onlineAmount = bookingData.paymentOption === 'split' ? totalAmount * 0.5 : totalAmount;
    const cashAmount = bookingData.paymentOption === 'split' ? totalAmount * 0.5 : 0;

    return {
      basePrice,
      dailyRate,
      insurancePrice,
      extrasPrice,
      serviceFee,
      cleaningFee,
      discount,
      subtotal,
      taxAmount,
      taxRate,
      totalAmount,
      onlineAmount,
      cashAmount,
      numberOfDays,
    };
  }, [vehicle, bookingData.numberOfDays, bookingData.insurance, bookingData.paymentOption]);

  const insurancePackage = getInsurancePackage(bookingData.insurance);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-emerald-100">
      {/* Vehicle Image */}
      {vehicle.images && vehicle.images.length > 0 && (
        <div className="mb-6 rounded-xl overflow-hidden">
          <img
            src={vehicle.images[0].url}
            alt={vehicle.name}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-6">Buchungsübersicht</h3>

      {/* Dates */}
      {bookingData.startDate && bookingData.endDate && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Von:</span>
            <span className="font-medium">
              {new Date(bookingData.startDate).toLocaleDateString('de-DE')}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Bis:</span>
            <span className="font-medium">
              {new Date(bookingData.endDate).toLocaleDateString('de-DE')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tage:</span>
            <span className="font-semibold text-emerald-600">{pricing.numberOfDays}</span>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      {pricing.numberOfDays > 0 && (
        <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
          {/* Base Price */}
          <div className="flex justify-between">
            <span className="text-gray-600">
              {formatCurrency(pricing.dailyRate)} × {pricing.numberOfDays} Tage
            </span>
            <span className="font-medium">{formatCurrency(pricing.basePrice)}</span>
          </div>

          {/* Discount */}
          {pricing.discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>
                {pricing.numberOfDays >= 30 ? 'Monatsrabatt (20%)' : 'Wochenrabatt (10%)'}
              </span>
              <span>-{formatCurrency(pricing.discount)}</span>
            </div>
          )}

          {/* Insurance */}
          {currentStep >= 3 && (
            <div className="flex justify-between">
              <div className="flex flex-col">
                <span className="text-gray-600">{insurancePackage.name}</span>
                <span className="text-xs text-gray-500">
                  {formatCurrency(insurancePackage.price)}/Tag
                </span>
              </div>
              <span className="font-medium">{formatCurrency(pricing.insurancePrice)}</span>
            </div>
          )}

          {/* Service Fee */}
          <div className="flex justify-between">
            <span className="text-gray-600">Servicegebühr (5%)</span>
            <span className="font-medium">{formatCurrency(pricing.serviceFee)}</span>
          </div>

          {/* Cleaning Fee */}
          <div className="flex justify-between">
            <span className="text-gray-600">Endreinigung</span>
            <span className="font-medium">{formatCurrency(pricing.cleaningFee)}</span>
          </div>

          {/* Tax */}
          <div className="flex justify-between text-gray-600">
            <span>MwSt. (19%)</span>
            <span>{formatCurrency(pricing.taxAmount)}</span>
          </div>
        </div>
      )}

      {/* Total */}
      {pricing.numberOfDays > 0 && (
        <>
          <div className="flex justify-between items-center mb-6 pb-6 border-b-2 border-emerald-600">
            <span className="text-lg font-bold text-gray-900">Gesamtbetrag</span>
            <span className="text-2xl font-bold text-emerald-600">
              {formatCurrency(pricing.totalAmount)}
            </span>
          </div>

          {/* Split Payment Info */}
          {currentStep >= 4 && bookingData.paymentOption === 'split' && (
            <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">50% Online-Zahlung:</span>
                <span className="text-sm font-semibold text-emerald-700">
                  {formatCurrency(pricing.onlineAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">50% Bar bei Abholung:</span>
                <span className="text-sm font-semibold text-emerald-700">
                  {formatCurrency(pricing.cashAmount)}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Features */}
      {pricing.numberOfDays === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p>Wählen Sie Reisedaten aus, um die Preise zu sehen</p>
        </div>
      )}

      {/* Security Info */}
      {currentStep >= 4 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-start space-x-2 text-sm text-gray-600">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">Sichere Zahlung</p>
              <p className="text-xs mt-1">
                Ihre Zahlungsinformationen werden sicher über Stripe verschlüsselt und verarbeitet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceSummary;
