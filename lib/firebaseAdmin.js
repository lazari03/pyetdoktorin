import admin from "firebase-admin";
import serviceAccount from "../config/medivio-3273a-firebase-adminsdk-fbsvc-6f1e5e6643.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: "https://medivio-3273a.firebaseio.com" // Uncomment if using Realtime Database
  });
}

export default admin;
