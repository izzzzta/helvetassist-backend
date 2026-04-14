const dns = require("dns");
dns.setDefaultResultOrder("ipv4first"); // 🔥 FIX IPv6 Render problem

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ CORS
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

// ✅ HEALTH CHECK
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// ✅ SMTP TRANSPORTER (FORCE IPv4)
const transporter = nodemailer.createTransport({
  host: "mail.infomaniak.com",
  port: 587,
  secure: false,

  family: 4, // 🔥 KLJUČNO: forsira IPv4

  auth: {
    user: process.env.EMAIL_USER || "info@helvet-assist.ch",
    pass: process.env.EMAIL_PASS || process.env.PASSWORD,
  },

  tls: {
    rejectUnauthorized: false,
  },

  connectionTimeout: 15000,
  socketTimeout: 15000,
});

// 🔥 VERIFY NA STARTU
transporter.verify((error) => {
  if (error) {
    console.log("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ SMTP ready to send emails");
  }
});

// ✅ ROUTE
app.post("/send", async (req, res) => {
  try {
    const {
      name,
      email,
      service,
      message,
      phone,
      companyName,
      companyPhone,
      callback,
      isCompany,
    } = req.body;

    // 🔥 VALIDATION
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    console.log("📩 New request received:", req.body);

    const info = await transporter.sendMail({
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,

      subject: `Nova poruka - ${service || "Contact form"}`,

      text: `
📩 Nova poruka sa web stranice

Ime: ${name}
Email: ${email}
Service: ${service || "-"}

Poruka:
${message}

Telefon: ${phone || "-"}

Callback: ${callback ? "DA" : "NE"}

Firma: ${isCompany ? "DA" : "NE"}
Naziv firme: ${companyName || "-"}
Telefon firme: ${companyPhone || "-"}
      `,
    });

    console.log("✅ Email sent:", info.messageId);

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("❌ SEND ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ✅ PORT (Render)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
