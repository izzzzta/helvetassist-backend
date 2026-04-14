const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ CORS (možeš kasnije ograničiti na svoju domenu)
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// ✅ ROUTE
app.post("/send", async (req, res) => {
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

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.infomaniak.com",
      port: 587,
      secure: false,
      auth: {
        user: "info@helvet-assist.ch",
        pass: process.env.PASSWORD, // 🔥 mora biti na Renderu postavljen
      },
    });

    // opcionalno (možeš ostaviti)
    await transporter.verify();

    await transporter.sendMail({
      from: `"Website Contact" <info@helvet-assist.ch>`,
      to: "info@helvet-assist.ch",
      subject: `Nova poruka - ${service || "Contact form"}`,
      text: `
📩 Nova poruka sa web stranice

Ime: ${name}
Email: ${email}
Service: ${service}

Poruka:
${message}

Telefon: ${phone || "-"}
Callback: ${callback ? "DA" : "NE"}

Firma: ${isCompany ? "DA" : "NE"}
Naziv firme: ${companyName || "-"}
Telefon firme: ${companyPhone || "-"}
      `,
    });

    console.log("Email sent successfully ✅");

    res.status(200).json({
      success: true,
    });

  } catch (error) {
    console.log("❌ FULL ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 🔥 NAJVAŽNIJE (Render port)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});