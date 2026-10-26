import { useFetch } from "../../hooks";
import Crud from "../../components/Crud";

export default function ManageTeachers() {
  const { data, reload, error } = useFetch("/teachers");
  return (
    <>
      {error && <p className="error">{error}</p>}
      <Crud title="Teachers" endpoint="/teachers" rows={data} reload={reload}
        fields={[
          { key: "name", label: "Name", required: true }, { key: "email", label: "Email", type: "email", required: true },
          { key: "password", label: "Password", type: "password", required: true },
          { key: "subject", label: "Subject" }, { key: "phone", label: "Phone" },
          { key: "grades", label: "Grades taught", type: "grades" },
        ]}
        columns={[
          { label: "Name", render: (r) => r.user?.name }, { label: "Email", render: (r) => r.user?.email },
          { label: "Subject", render: (r) => r.subject }, { label: "Phone", render: (r) => r.phone }, { label: "Grades", render: (r) => (r.grades || []).map((g) => g.replace("Grade ", "")).join(", ") || "–" },
        ]}
        toForm={(r) => ({ name: r.user?.name, email: r.user?.email, subject: r.subject || "", phone: r.phone || "", grades: (r.grades || []).join(", ") })}
      />
    </>
  );
}
