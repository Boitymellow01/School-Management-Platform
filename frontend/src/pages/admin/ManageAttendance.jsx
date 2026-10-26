import { useFetch } from "../../hooks";
import AttendanceSheet from "../../components/AttendanceSheet";
export default function ManageAttendance() {
  const { data } = useFetch("/classes");
  return (<><h2>Attendance</h2><AttendanceSheet classes={data} /></>);
}
