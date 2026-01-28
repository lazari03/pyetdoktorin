import React from "react";

const RedirectingModal: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.6)",
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#222",
        color: "#fff",
        padding: "2rem 3rem",
        borderRadius: "1rem",
        fontSize: "1.5rem",
        boxShadow: "0 2px 16px rgba(0,0,0,0.3)"
      }}>
        Redirecting you there...
      </div>
    </div>
  );
};

export default RedirectingModal;
