import { useFetch } from "../../hooks";
import ClassTable from "../../components/ClassTable";
export default function MyClasses() { const { data, error } = useFetch("/classes"); return <ClassTable classes={data} error={error} />; }
