const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ CORS (za production možeš kasnije ograničiti domen)
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

// ✅ HEALTH CHECK (Render koristi ovo da vidi da server radi)
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// ✅ TRANSPORTER (kreira se jednom, ne svaki request)
const transporter = nodemailer.createTransport({
  host: "mail.infomaniak.com", // 🔥 ispravno za Infomaniak
  port: 587,
  secure: false, // 🔥 587 = false (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER || "info@helvet-assist.ch",
    pass: process.env.EMAIL_PASS || process.env.PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// 🔥 VERIFY NA STARTU (hvata greške odmah)
transporter.verify((error, success) => {
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

    // 🔥 VALIDATION (sprečava crash)
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    console.log("📩 New request received:", req.body);

    const info = await transporter.sendMail({
      from: `"Website Contact" <${process.env.EMAIL_USER || "info@helvet-assist.ch"}>`,
      to: "info@helvet-assist.ch",
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

// 🔥 PORT (Render requirement)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
