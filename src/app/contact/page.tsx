import NavBar from "../components/navBar";
import "./contact.css";

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <NavBar />
      <div className="dashboard-content">
        <h1>Welcome to the Dashboard</h1>
        <p>This is the main dashboard page.</p>
      </div>
    </div>
  );
}
