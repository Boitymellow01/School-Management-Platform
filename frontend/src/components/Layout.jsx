import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="shell">
      <Navbar />
      <div className="body">
        <Sidebar />
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
