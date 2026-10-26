import { useFetch } from "../../hooks";
import AttendanceSheet from "../../components/AttendanceSheet";
export default function TakeAttendance() {
  const { data } = useFetch("/classes");
  return (<><h2>Take attendance</h2><AttendanceSheet classes={data} /></>);
}
