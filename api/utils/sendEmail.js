// backend/utils/sendEmail.js
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs").promises;
const path = require("path");

// Create transporter
const createTransporter = () => {
  // Validate required environment variables
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    console.error("Missing email configuration environment variables");
    throw new Error("Email configuration is incomplete");
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates
    },
  });
};

// Send email function
const sendEmail = async ({ to, subject, template, html, data, attachments = [] }) => {
  try {
    console.log(
      `Attempting to send email to: ${to} with template: ${template || 'direct HTML'}`
    );

    const transporter = createTransporter();

    // Verify transporter configuration
    await transporter.verify();
    console.log("SMTP connection verified successfully");

    let emailHtml;

    // If template is provided, load and compile it
    if (template) {
      const templatePath = path.join(
        __dirname,
        "../templates/emails",
        `${template}.hbs`
      );

      console.log(`Loading template from: ${templatePath}`);
      const templateContent = await fs.readFile(templatePath, "utf8");
      const compiledTemplate = handlebars.compile(templateContent);

      // Generate HTML from template
      emailHtml = compiledTemplate(data);
    } else if (html) {
      // Use direct HTML
      emailHtml = html;
    } else {
      throw new Error("Either template or html must be provided");
    }

    // Email options
    const mailOptions = {
      from: `WohnmobilTraum <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: emailHtml,
      attachments,
    };

    console.log("Sending email with options:", {
      to,
      subject,
      from: mailOptions.from,
    });

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Send email error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
