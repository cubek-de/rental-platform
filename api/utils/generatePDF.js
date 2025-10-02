// backend/utils/generatePDF.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoicePDF = (booking, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    // Pipe to file
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header
    doc
      .fontSize(20)
      .text("WohnmobilTraum", 50, 50)
      .fontSize(10)
      .text("Hauptstraße 1, 10115 Berlin", 50, 80)
      .text("Tel: +49 30 12345678", 50, 95)
      .text("E-Mail: info@wohnmobiltraum.de", 50, 110)
      .moveDown();

    // Invoice title
    doc
      .fontSize(16)
      .text("RECHNUNG", 50, 160, { align: "right" })
      .fontSize(10)
      .text(`Rechnungsnummer: ${booking.payment.invoice.number}`, 50, 180, {
        align: "right",
      })
      .text(
        `Datum: ${new Date(booking.payment.invoice.issuedAt).toLocaleDateString(
          "de-DE"
        )}`,
        50,
        195,
        { align: "right" }
      )
      .moveDown();

    // Customer info
    doc
      .fontSize(12)
      .text("Rechnungsempfänger:", 50, 250)
      .fontSize(10)
      .text(`${booking.user.firstName} ${booking.user.lastName}`, 50, 270)
      .text(booking.user.email, 50, 285)
      .text(booking.user.profile.phone || "", 50, 300)
      .moveDown();

    // Booking details
    doc
      .fontSize(12)
      .text("Buchungsdetails:", 50, 350)
      .fontSize(10)
      .text(`Buchungsnummer: ${booking.bookingNumber}`, 50, 370)
      .text(`Fahrzeug: ${booking.vehicle.name}`, 50, 385)
      .text(
        `Zeitraum: ${new Date(booking.dates.start).toLocaleDateString(
          "de-DE"
        )} - ${new Date(booking.dates.end).toLocaleDateString("de-DE")}`,
        50,
        400
      )
      .text(`Anzahl Tage: ${booking.dates.numberOfDays}`, 50, 415)
      .moveDown();

    // Line items
    const tableTop = 450;
    doc
      .fontSize(10)
      .text("Beschreibung", 50, tableTop)
      .text("Menge", 250, tableTop)
      .text("Preis", 350, tableTop)
      .text("Gesamt", 450, tableTop);

    // Draw line
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    let y = tableTop + 30;

    // Vehicle rental
    doc
      .text("Fahrzeugmiete", 50, y)
      .text(booking.dates.numberOfDays.toString(), 250, y)
      .text(`€ ${booking.pricing.dailyRate.toFixed(2)}`, 350, y)
      .text(`€ ${booking.pricing.subtotal.toFixed(2)}`, 450, y);
    y += 20;

    // Extras
    booking.pricing.extras.forEach((extra) => {
      doc
        .text(extra.name, 50, y)
        .text(extra.quantity.toString(), 250, y)
        .text(`€ ${extra.price.toFixed(2)}`, 350, y)
        .text(`€ ${extra.total.toFixed(2)}`, 450, y);
      y += 20;
    });

    // Insurance
    if (booking.pricing.insurance.price) {
      doc
        .text(`Versicherung (${booking.pricing.insurance.type})`, 50, y)
        .text(booking.dates.numberOfDays.toString(), 250, y)
        .text(
          `€ ${(
            booking.pricing.insurance.price / booking.dates.numberOfDays
          ).toFixed(2)}`,
          350,
          y
        )
        .text(`€ ${booking.pricing.insurance.price.toFixed(2)}`, 450, y);
      y += 20;
    }

    // Fees
    if (booking.pricing.fees.serviceFee) {
      doc
        .text("Servicegebühr", 50, y)
        .text("1", 250, y)
        .text(`€ ${booking.pricing.fees.serviceFee.toFixed(2)}`, 350, y)
        .text(`€ ${booking.pricing.fees.serviceFee.toFixed(2)}`, 450, y);
      y += 20;
    }

    if (booking.pricing.fees.cleaningFee) {
      doc
        .text("Reinigungsgebühr", 50, y)
        .text("1", 250, y)
        .text(`€ ${booking.pricing.fees.cleaningFee.toFixed(2)}`, 350, y)
        .text(`€ ${booking.pricing.fees.cleaningFee.toFixed(2)}`, 450, y);
      y += 20;
    }

    // Draw line before totals
    doc
      .moveTo(350, y + 10)
      .lineTo(550, y + 10)
      .stroke();
    y += 25;

    // Subtotal
    const subtotal =
      booking.pricing.totalAmount / (1 + booking.pricing.taxes.rate);
    doc.text("Zwischensumme:", 350, y).text(`€ ${subtotal.toFixed(2)}`, 450, y);
    y += 20;

    // Tax
    doc
      .text(
        `MwSt. (${(booking.pricing.taxes.rate * 100).toFixed(0)}%):`,
        350,
        y
      )
      .text(`€ ${booking.pricing.taxes.amount.toFixed(2)}`, 450, y);
    y += 20;

    // Total
    doc
      .fontSize(12)
      .text("Gesamtbetrag:", 350, y)
      .text(`€ ${booking.pricing.totalAmount.toFixed(2)}`, 450, y);

    // Payment status
    doc
      .fontSize(10)
      .text(
        `Zahlungsstatus: ${
          booking.payment.status === "completed" ? "Bezahlt" : "Ausstehend"
        }`,
        50,
        y + 40
      );

    // Footer
    doc
      .fontSize(8)
      .text("Vielen Dank für Ihre Buchung!", 50, 700, { align: "center" })
      .text(
        "Bei Fragen kontaktieren Sie uns bitte unter support@wohnmobiltraum.de",
        50,
        715,
        { align: "center" }
      );

    // Finalize PDF
    doc.end();

    stream.on("finish", () => resolve(outputPath));
    stream.on("error", reject);
  });
};

const generateContractPDF = (booking, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header
    doc
      .fontSize(16)
      .text("MIETVERTRAG", 50, 50, { align: "center" })
      .moveDown()
      .fontSize(10);

    // Parties
    doc
      .fontSize(12)
      .text("Zwischen", 50, 120)
      .fontSize(10)
      .text("WohnmobilTraum GmbH (Vermieter)", 50, 140)
      .text("Hauptstraße 1, 10115 Berlin", 50, 155)
      .moveDown()
      .fontSize(12)
      .text("und", 50, 190)
      .fontSize(10)
      .text(
        `${booking.user.firstName} ${booking.user.lastName} (Mieter)`,
        50,
        210
      )
      .text(booking.user.profile.address?.street || "", 50, 225)
      .text(
        `${booking.user.profile.address?.postalCode || ""} ${
          booking.user.profile.address?.city || ""
        }`,
        50,
        240
      )
      .moveDown();

    // Contract details
    doc
      .fontSize(12)
      .text("1. Mietgegenstand", 50, 280)
      .fontSize(10)
      .text(`Fahrzeug: ${booking.vehicle.name}`, 70, 300)
      .text(`Kategorie: ${booking.vehicle.category}`, 70, 315)
      .text(
        `Kennzeichen: ${booking.vehicle.technicalData.licensePlate || "N/A"}`,
        70,
        330
      )
      .moveDown();

    doc
      .fontSize(12)
      .text("2. Mietdauer", 50, 360)
      .fontSize(10)
      .text(
        `Beginn: ${new Date(booking.dates.start).toLocaleDateString(
          "de-DE"
        )} um 10:00 Uhr`,
        70,
        380
      )
      .text(
        `Ende: ${new Date(booking.dates.end).toLocaleDateString(
          "de-DE"
        )} um 10:00 Uhr`,
        70,
        395
      )
      .text(`Gesamtdauer: ${booking.dates.numberOfDays} Tage`, 70, 410)
      .moveDown();

    doc
      .fontSize(12)
      .text("3. Mietpreis", 50, 440)
      .fontSize(10)
      .text(
        `Gesamtpreis: € ${booking.pricing.totalAmount.toFixed(2)} inkl. MwSt.`,
        70,
        460
      )
      .text(`Kaution: € ${booking.pricing.deposit.amount.toFixed(2)}`, 70, 475)
      .moveDown();

    // Terms and conditions
    doc
      .fontSize(12)
      .text("4. Allgemeine Geschäftsbedingungen", 50, 505)
      .fontSize(9)
      .text("Der Mieter bestätigt mit seiner Unterschrift:", 70, 525)
      .text("• Die AGB gelesen und akzeptiert zu haben", 70, 540)
      .text("• Im Besitz eines gültigen Führerscheins zu sein", 70, 555)
      .text("• Das Fahrzeug sorgsam zu behandeln", 70, 570)
      .text("• Für alle Schäden während der Mietdauer aufzukommen", 70, 585);

    // Signatures
    doc
      .fontSize(10)
      .text("_________________________", 50, 650)
      .text("Vermieter", 50, 665)
      .text("_________________________", 350, 650)
      .text("Mieter", 350, 665)
      .text(`Datum: ${new Date().toLocaleDateString("de-DE")}`, 200, 700, {
        align: "center",
      });

    doc.end();

    stream.on("finish", () => resolve(outputPath));
    stream.on("error", reject);
  });
};

module.exports = {
  generateInvoicePDF,
  generateContractPDF,
};
