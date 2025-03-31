import { db } from "../../../firebase"; // Adjust the path as needed
import { collection, addDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { appointmentType, notes, patientName, createdAt } = req.body;

    try {
      await addDoc(collection(db, "appointments"), {
        appointmentType,
        notes,
        patientName, // Save patient name in Firebase
        createdAt,
        status: "pending", // Default status
      });
      res.status(201).json({ message: "Appointment created successfully" });
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ error: "Failed to create appointment" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
