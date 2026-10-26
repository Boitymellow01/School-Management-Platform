import { useFetch } from "../../hooks";
import Crud from "../../components/Crud";

export default function ManageClasses() {
  const { data, reload, error } = useFetch("/classes");
  const { data: teachers } = useFetch("/teachers");
  return (
    <>
      {error && <p className="error">{error}</p>}
      <Crud title="Classes" endpoint="/classes" rows={data} reload={reload}
        fields={[
          { key: "name", label: "Class name", required: true }, { key: "grade", label: "Grade" },
          { key: "teacher", label: "Teacher", options: (teachers || []).map((t) => ({ value: t._id, label: t.user?.name })) },
        ]}
        columns={[
          { label: "Class", render: (r) => r.name }, { label: "Grade", render: (r) => r.grade },
          { label: "Teacher", render: (r) => r.teacher?.user?.name || "–" }, { label: "Students", render: (r) => r.studentCount },
        ]}
        toForm={(r) => ({ name: r.name, grade: r.grade || "", teacher: r.teacher?._id || "" })}
      />
    </>
  );
}
