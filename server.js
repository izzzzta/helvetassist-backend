const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { Resend } = require("resend");

const app = express();

// ✅ CORS
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

// ✅ INIT RESEND
const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ HEALTH CHECK
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
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

    // ✅ VALIDATION
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    console.log("📩 New request received:", req.body);

    const response = await resend.emails.send({
      from: "Helvet Assist <onboarding@resend.dev>", // kasnije mijenjamo u tvoj domain
      to: process.env.EMAIL_TO, // 👉 info@helvet-assist.ch
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

    console.log("✅ Email sent:", response);

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

// ✅ PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
