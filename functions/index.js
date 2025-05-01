const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Set your SendGrid API key in Firebase environment variables

exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {
  const msg = {
    to: user.email, // User's email
    from: "welcome@yourdomain.com", // Verified sender email
    subject: "Welcome to Portokalle!",
    text: `Hi ${user.displayName || "User"}, welcome to Portokalle!`,
    html: `<strong>Hi ${user.displayName || "User"}, welcome to Portokalle!</strong>`,
  };

  return sgMail
    .send(msg)
    .then(() => console.log("Welcome email sent to:", user.email))
    .catch((error) => console.error("Error sending welcome email:", error));
});
