import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = {
  admin: [["", "Dashboard"], ["students", "Students"], ["teachers", "Teachers"], ["classes", "Classes"], ["exams", "Exams"], ["attendance", "Attendance"], ["assignments", "Assignments"], ["events", "Events"], ["library", "Library"], ["performance", "Performance"], ["announcements", "Announcements"], ["profile", "Profile"], ["settings", "School Settings"]],
  teacher: [["", "Dashboard"], ["classes", "My Classes"], ["students", "Students"], ["teachers", "Teachers"], ["attendance", "Take Attendance"], ["marks", "Exams & Marks"], ["assignments", "Assignments"], ["events", "Events"], ["performance", "Performance"], ["announcements", "Announcements"], ["profile", "Profile"]],
  student: [["", "Dashboard"], ["classes", "My Class"], ["attendance", "My Attendance"], ["exams", "My Exams"], ["library", "Library"], ["assignments", "Assignments"], ["events", "Events"], ["performance", "My Performance"], ["announcements", "Announcements"], ["profile", "Profile"]],
};

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <nav className="sidebar">
      {LINKS[user.role].map(([path, label]) => (
        <NavLink key={path} to={`/${user.role}/${path}`} end={path === ""}>{label}</NavLink>
      ))}
    </nav>
  );
}
