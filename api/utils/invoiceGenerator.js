const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

/**
 * Generate a modern, professional invoice PDF for a booking
 * @param {Object} booking - Booking object with populated user and vehicle
 * @returns {Promise<Object>} - Invoice details with URL
 */
const generateInvoice = async (booking) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Generate invoice number if not exists
      const invoiceNumber =
        booking.payment.invoice?.number || generateInvoiceNumber(booking);

      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(__dirname, "..", "uploads", "invoices");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `invoice-${invoiceNumber}.pdf`;
      const filePath = path.join(uploadDir, fileName);

      // Create PDF document
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        info: {
          Title: `Rechnung ${invoiceNumber}`,
          Author: "WohnmobilTraum",
          Subject: `Rechnung für Buchung ${booking.bookingNumber}`,
        },
      });

      // Pipe to file
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // HEADER SECTION - Modern gradient-style header
      drawHeader(doc, invoiceNumber, booking);

      // Company and Customer Information
      drawCompanyInfo(doc);
      drawCustomerInfo(doc, booking);

      // Invoice Details
      drawInvoiceDetails(doc, booking);

      // Line Items Table
      drawLineItems(doc, booking);

      // Payment Information
      drawPaymentInfo(doc, booking);

      // Footer
      drawFooter(doc);

      // Finalize PDF
      doc.end();

      writeStream.on("finish", async () => {
        try {
          // Upload to Cloudinary
          const cloudinaryResult = await cloudinary.uploader.upload(filePath, {
            folder: "invoices",
            resource_type: "raw",
            public_id: `invoice-${invoiceNumber}`,
          });

          // Delete local file after upload
          fs.unlinkSync(filePath);

          resolve({
            invoiceNumber,
            url: cloudinaryResult.secure_url,
            cloudinaryId: cloudinaryResult.public_id,
            issuedAt: new Date(),
          });
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          // If Cloudinary fails, return local file path
          resolve({
            invoiceNumber,
            url: `/uploads/invoices/${fileName}`,
            cloudinaryId: null,
            issuedAt: new Date(),
          });
        }
      });

      writeStream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};

// Draw modern header with gradient effect (simulated with rectangles)
const drawHeader = (doc, invoiceNumber, booking) => {
  // Gradient background (emerald green theme)
  doc
    .rect(0, 0, doc.page.width, 180)
    .fill("#10b981") // Emerald-500
    .rect(0, 0, doc.page.width, 180)
    .fillOpacity(0.9)
    .fill("#059669"); // Emerald-600

  // Company Logo/Name
  doc
    .fillOpacity(1)
    .fillColor("#FFFFFF")
    .fontSize(32)
    .font("Helvetica-Bold")
    .text("WohnmobilTraum", 50, 40);

  doc
    .fontSize(12)
    .font("Helvetica")
    .text("Ihr Partner für unvergessliche Reiseerlebnisse", 50, 80);

  // Invoice Title
  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("RECHNUNG", doc.page.width - 200, 40, {
      align: "right",
      width: 150,
    });

  // Invoice Number
  doc.fontSize(11).font("Helvetica").fillColor("#E0E0E0").text(
    `Nr. ${invoiceNumber}`,
    doc.page.width - 200,
    70,
    {
      align: "right",
      width: 150,
    }
  );

  // Booking Number
  doc
    .fontSize(10)
    .text(`Buchung: ${booking.bookingNumber}`, doc.page.width - 200, 90, {
      align: "right",
      width: 150,
    });

  // Reset text color
  doc.fillColor("#000000");
};

// Draw company information
const drawCompanyInfo = (doc) => {
  const startY = 200;

  doc.fontSize(10).font("Helvetica-Bold").text("WohnmobilTraum GmbH", 50, startY);

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#666666")
    .text("Hauptstraße 123", 50, startY + 15)
    .text("80331 München, Deutschland", 50, startY + 28)
    .text("Tel: +49 89 1234567", 50, startY + 41)
    .text("Email: info@wohnmobiltraum.de", 50, startY + 54)
    .text("USt-IdNr: DE123456789", 50, startY + 67);

  doc.fillColor("#000000");
};

// Draw customer information
const drawCustomerInfo = (doc, booking) => {
  const startY = 200;
  const leftMargin = 320;

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Rechnung an:", leftMargin, startY);

  const customerName = `${booking.user.firstName} ${booking.user.lastName}`;
  const customerEmail = booking.user.email;
  const customerPhone = booking.user.profile?.phone || "N/A";

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#666666")
    .text(customerName, leftMargin, startY + 15)
    .text(customerEmail, leftMargin, startY + 28)
    .text(customerPhone, leftMargin, startY + 41);

  if (booking.user.address) {
    const address = booking.user.address;
    doc
      .text(`${address.street || ""}`, leftMargin, startY + 54)
      .text(
        `${address.postalCode || ""} ${address.city || ""}`,
        leftMargin,
        startY + 67
      );
  }

  doc.fillColor("#000000");
};

// Draw invoice details
const drawInvoiceDetails = (doc, booking) => {
  const startY = 310;

  // Draw a subtle background box
  doc.rect(50, startY - 10, doc.page.width - 100, 80).fillAndStroke("#F9FAFB", "#E5E7EB");

  // Details grid
  const col1 = 70;
  const col2 = 200;
  const col3 = 350;
  const col4 = 480;

  doc.fontSize(9).font("Helvetica-Bold").fillColor("#374151");

  // Labels
  doc
    .text("Rechnungsdatum:", col1, startY)
    .text("Buchungsdatum:", col3, startY)
    .text("Mietbeginn:", col1, startY + 25)
    .text("Mietende:", col3, startY + 25)
    .text("Fahrzeug:", col1, startY + 50);

  // Values
  doc.font("Helvetica").fillColor("#000000");

  doc
    .text(formatDate(new Date()), col2, startY)
    .text(formatDate(booking.createdAt), col4, startY)
    .text(formatDate(booking.dates.start), col2, startY + 25)
    .text(formatDate(booking.dates.end), col4, startY + 25)
    .text(booking.vehicle.name, col2, startY + 50, { width: 300 });
};

// Draw line items table
const drawLineItems = (doc, booking) => {
  const startY = 420;
  const tableTop = startY;

  // Table header
  doc.rect(50, tableTop, doc.page.width - 100, 30).fill("#10b981");

  doc.fontSize(10).font("Helvetica-Bold").fillColor("#FFFFFF");

  const col1 = 60;
  const col2 = 320;
  const col3 = 420;
  const col4 = 490;

  doc
    .text("Beschreibung", col1, tableTop + 10)
    .text("Menge/Tage", col2, tableTop + 10)
    .text("Einzelpreis", col3, tableTop + 10)
    .text("Gesamt", col4, tableTop + 10);

  let yPosition = tableTop + 40;

  // Vehicle rental
  drawTableRow(
    doc,
    `${booking.vehicle.name} - Miete`,
    `${booking.dates.numberOfDays} Tage`,
    formatCurrency(booking.pricing.dailyRate),
    formatCurrency(booking.pricing.subtotal),
    yPosition
  );
  yPosition += 25;

  // Insurance
  if (booking.pricing.insurance?.type) {
    const insuranceName = getInsuranceName(booking.pricing.insurance.type);
    const insurancePerDay = booking.pricing.insurance.price / booking.dates.numberOfDays;
    drawTableRow(
      doc,
      insuranceName,
      `${booking.dates.numberOfDays} Tage`,
      formatCurrency(insurancePerDay),
      formatCurrency(booking.pricing.insurance.price),
      yPosition
    );
    yPosition += 25;
  }

  // Extras
  if (booking.pricing.extras && booking.pricing.extras.length > 0) {
    booking.pricing.extras.forEach((extra) => {
      drawTableRow(
        doc,
        extra.name,
        `${extra.quantity}x`,
        formatCurrency(extra.price),
        formatCurrency(extra.total),
        yPosition
      );
      yPosition += 25;
    });
  }

  // Fees
  if (booking.pricing.fees?.cleaningFee > 0) {
    drawTableRow(
      doc,
      "Endreinigung",
      "1x",
      formatCurrency(booking.pricing.fees.cleaningFee),
      formatCurrency(booking.pricing.fees.cleaningFee),
      yPosition
    );
    yPosition += 25;
  }

  if (booking.pricing.fees?.serviceFee > 0) {
    drawTableRow(
      doc,
      "Servicegebühr",
      "1x",
      formatCurrency(booking.pricing.fees.serviceFee),
      formatCurrency(booking.pricing.fees.serviceFee),
      yPosition
    );
    yPosition += 25;
  }

  // Discounts
  if (booking.pricing.weeklyDiscount > 0 || booking.pricing.monthlyDiscount > 0) {
    const discount = booking.pricing.weeklyDiscount || booking.pricing.monthlyDiscount;
    drawTableRow(
      doc,
      booking.pricing.weeklyDiscount > 0 ? "Wochenrabatt" : "Monatsrabatt",
      "1x",
      `-${formatCurrency(discount)}`,
      `-${formatCurrency(discount)}`,
      yPosition,
      "#DC2626"
    );
    yPosition += 25;
  }

  yPosition += 10;

  // Separator line
  doc.moveTo(50, yPosition).lineTo(doc.page.width - 50, yPosition).stroke("#E5E7EB");

  yPosition += 15;

  // Subtotal (before tax)
  const subtotalBeforeTax =
    booking.pricing.totalAmount - booking.pricing.taxes.amount;
  drawSummaryRow(doc, "Zwischensumme:", formatCurrency(subtotalBeforeTax), yPosition);
  yPosition += 20;

  // VAT
  drawSummaryRow(
    doc,
    `MwSt. (${Math.round(booking.pricing.taxes.rate * 100)}%):`,
    formatCurrency(booking.pricing.taxes.amount),
    yPosition
  );
  yPosition += 20;

  // Heavy separator line
  doc
    .moveTo(50, yPosition)
    .lineTo(doc.page.width - 50, yPosition)
    .lineWidth(2)
    .stroke("#10b981");

  yPosition += 15;

  // Total
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .fillColor("#10b981")
    .text("Gesamtbetrag:", 320, yPosition)
    .text(formatCurrency(booking.pricing.totalAmount), 490, yPosition, {
      width: 100,
      align: "left",
    });

  doc.fillColor("#000000").lineWidth(1);
};

// Draw payment information
const drawPaymentInfo = (doc, booking) => {
  let yPosition = doc.y + 30;

  // Ensure we don't overflow the page
  if (yPosition > 650) {
    doc.addPage();
    yPosition = 50;
  }

  // Payment info box
  doc.rect(50, yPosition, doc.page.width - 100, 100).fillAndStroke("#FEF3C7", "#F59E0B");

  yPosition += 15;

  doc.fontSize(11).font("Helvetica-Bold").fillColor("#92400E").text("Zahlungsinformationen:", 60, yPosition);

  yPosition += 20;

  doc.fontSize(9).font("Helvetica").fillColor("#78350F");

  // Payment method
  let paymentMethodText = "Online-Zahlung (Kreditkarte)";
  if (booking.payment.method === "split_payment") {
    paymentMethodText = "Teilzahlung (50% Online + 50% Bar)";
  } else if (booking.payment.method === "cash") {
    paymentMethodText = "Barzahlung";
  }

  doc.text(`Zahlungsmethode: ${paymentMethodText}`, 60, yPosition);
  yPosition += 15;

  // Split payment details
  if (booking.payment.splitPayment?.enabled) {
    doc.text(
      `Online bezahlt: ${formatCurrency(booking.payment.splitPayment.onlineAmount)}`,
      60,
      yPosition
    );
    yPosition += 15;
    doc.text(
      `Bar zu zahlen: ${formatCurrency(booking.payment.splitPayment.cashAmount)} (bei Abholung)`,
      60,
      yPosition
    );
  } else {
    doc.text(`Status: ${getPaymentStatusText(booking.payment.status)}`, 60, yPosition);
    yPosition += 15;
    doc.text(
      `Bezahlt am: ${formatDate(booking.payment.invoice?.paidAt || booking.updatedAt)}`,
      60,
      yPosition
    );
  }

  doc.fillColor("#000000");
};

// Draw footer
const drawFooter = (doc) => {
  const footerY = doc.page.height - 80;

  doc
    .moveTo(50, footerY)
    .lineTo(doc.page.width - 50, footerY)
    .stroke("#E5E7EB");

  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#9CA3AF")
    .text(
      "WohnmobilTraum GmbH | Hauptstraße 123 | 80331 München | Tel: +49 89 1234567 | Email: info@wohnmobiltraum.de",
      50,
      footerY + 10,
      {
        align: "center",
        width: doc.page.width - 100,
      }
    )
    .text(
      "Geschäftsführer: Max Mustermann | Amtsgericht München HRB 123456 | USt-IdNr: DE123456789",
      50,
      footerY + 25,
      {
        align: "center",
        width: doc.page.width - 100,
      }
    )
    .text(
      "Bankverbindung: Deutsche Bank | IBAN: DE89 3704 0044 0532 0130 00 | BIC: COBADEFFXXX",
      50,
      footerY + 40,
      {
        align: "center",
        width: doc.page.width - 100,
      }
    );

  doc.fillColor("#000000");
};

// Helper function to draw table row
const drawTableRow = (doc, description, quantity, price, total, y, color = "#000000") => {
  doc.fontSize(9).font("Helvetica").fillColor(color);

  doc
    .text(description, 60, y, { width: 250 })
    .text(quantity, 320, y)
    .text(price, 420, y)
    .text(total, 490, y);

  doc.fillColor("#000000");
};

// Helper function to draw summary row
const drawSummaryRow = (doc, label, value, y) => {
  doc.fontSize(10).font("Helvetica").text(label, 380, y).text(value, 490, y);
};

// Helper functions
const generateInvoiceNumber = (booking) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `INV-${year}${month}-${random}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

const getInsuranceName = (type) => {
  const names = {
    basic: "Basis-Versicherung",
    standard: "Standard-Versicherung",
    premium: "Premium-Versicherung",
  };
  return names[type] || "Versicherung";
};

const getPaymentStatusText = (status) => {
  const statusTexts = {
    pending: "Ausstehend",
    processing: "In Bearbeitung",
    completed: "Bezahlt",
    failed: "Fehlgeschlagen",
    refunded: "Erstattet",
    partial_refund: "Teilweise erstattet",
    partially_paid: "Teilweise bezahlt",
  };
  return statusTexts[status] || status;
};

module.exports = {
  generateInvoice,
};
