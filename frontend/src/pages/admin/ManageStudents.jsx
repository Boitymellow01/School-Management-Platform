import { useFetch } from "../../hooks";
import Crud from "../../components/Crud";
import { GRADES } from "../../grades";

export default function ManageStudents() {
  const { data, reload, error } = useFetch("/students");
  const { data: classes } = useFetch("/classes");
  return (
    <>
      {error && <p className="error">{error}</p>}
      <Crud title="Students" endpoint="/students" rows={data} reload={reload}
        fields={[
          { key: "name", label: "Name", required: true }, { key: "email", label: "Email", type: "email", required: true },
          { key: "password", label: "Password", type: "password", required: true },
          { key: "studentNumber", label: "Student no.", required: true }, { key: "grade", label: "Grade", options: GRADES.map((g) => ({ value: g, label: g })) },
          { key: "class", label: "Class", options: (classes || []).map((c) => ({ value: c._id, label: c.name })) },
        ]}
        columns={[
          { label: "No.", render: (r) => r.studentNumber }, { label: "Name", render: (r) => r.user?.name },
          { label: "Email", render: (r) => r.user?.email }, { label: "Grade", render: (r) => r.grade },
          { label: "Class", render: (r) => r.class?.name || "–" },
        ]}
        toForm={(r) => ({ name: r.user?.name, email: r.user?.email, studentNumber: r.studentNumber, grade: r.grade || "", class: r.class?._id || "" })}
      />
    </>
  );
}
