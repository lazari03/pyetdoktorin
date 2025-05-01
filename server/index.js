const express = require("express");
const bodyParser = require("body-parser");
const sgMail = require("@sendgrid/mail");
const { db } = require("./firebaseConfig"); // Import Firebase config
const { doc, updateDoc } = require("firebase/firestore"); // Import Firestore methods

const app = express();
const PORT = 5000;

// Set your SendGrid API key
sgMail.setApiKey("YOUR_SENDGRID_API_KEY");

app.use(bodyParser.json());

// Endpoint to handle user registration
app.post("/register", async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: "Email and name are required" });
  }

  const msg = {
    to: email,
    from: "info@portokalle.al", // Verified sender email
    subject: "Welcome to Portokalle!",
    text: `Hi ${name}, welcome to Portokalle!`,
    html: `<strong>Hi ${name}, welcome to Portokalle!</strong>`,
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ message: "Welcome email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send welcome email" });
  }
});

// Endpoint to update appointment status
app.post("/api/appointments/update-status", async (req, res) => {
  const { appointmentId, status } = req.body;

  if (!appointmentId || !status) {
    return res.status(400).json({ error: "Appointment ID and status are required" });
  }

  try {
    const appointmentRef = doc(db, "appointments", appointmentId);
    await updateDoc(appointmentRef, { status });
    res.status(200).json({ message: "Appointment status updated successfully" });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ error: "Failed to update appointment status" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
