import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { data, reload } = useFetch("/settings");
  useEffect(() => {
    window.addEventListener("settings-updated", reload);
    return () => window.removeEventListener("settings-updated", reload);
  }, [reload]);

  function handleLogout() {
    logout();                      // clears the saved login
    window.location.replace("/");  // then open the landing page (a normal redirect would be bounced to /login)
  }

  return (
    <header className="navbar">
      <strong>{data?.schoolName || "School Management Platform"}</strong>
      <div className="nav-right">
        <span>{user?.name} <span className="badge">{user?.role}</span></span>
        <button className="btn secondary" onClick={handleLogout}>Log out</button>
      </div>
    </header>
  );
}