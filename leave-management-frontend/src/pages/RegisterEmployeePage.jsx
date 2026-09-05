import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as employeeApi from "../api/employeeApi";
import * as departmentApi from "../api/departmentApi";
import {
  Banner,
  Field,
  PrimaryButton,
  SelectInput,
  TextInput,
} from "../components/ui";

const INITIAL_FORM = {
  name: "",
  company: "",
  employeeCode: "",
  aadharNo: "",
  panNo: "",
  email: "",
  password: "",
  roleName: "employee",
  departmentName: "",
  reportingTo: "",
};
export default function RegisterEmployeePage() {
  const { token } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [departments, setDepartments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  useEffect(() => {
    departmentApi
      .getDepartments(token)
      .then(setDepartments)
      .catch(() => {});
  }, [token]);
  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setSubmitting(true);
    try {
      const result = await employeeApi.registerEmployee(token, {
        ...form,
        reportingTo: form.reportingTo ? Number(form.reportingTo) : undefined,
      });
      setSuccess(result);
      setForm(INITIAL_FORM);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="max-w-xl">
      <h2 className="font-serif text-[22px] text-[#1E2761]">
        Register employee
      </h2>
      <p className="mt-1 text-sm text-[#5B6485]">
        Creates the login and starting leave balances.
      </p>
      {success && (
        <div className="mt-4">
          <Banner tone="success">
            Registered {success.name} ({success.role}) —{" "}
            {success.leaveBalancesCreated} leave balance(s) created.
          </Banner>
        </div>
      )}
      {error && (
        <div className="mt-4">
          <Banner tone="error">{error}</Banner>
        </div>
      )}
      <form
        onSubmit={submit}
        className="mt-5 rounded-2xl bg-white border border-[#E3E7F5] shadow-sm p-6 space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full name">
            <TextInput
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </Field>
          <Field label="Company">
            <TextInput
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email">
            <TextInput
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </Field>
          <Field label="Temporary password">
            <TextInput
              type="password"
              required
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Employee code">
            <TextInput
              value={form.employeeCode}
              onChange={(e) => update("employeeCode", e.target.value)}
            />
          </Field>
          <Field label="Reports to (Emp ID)">
            <TextInput
              type="number"
              value={form.reportingTo}
              onChange={(e) => update("reportingTo", e.target.value)}
              placeholder="e.g. 2"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Aadhaar number">
            <TextInput
              value={form.aadharNo}
              onChange={(e) => update("aadharNo", e.target.value)}
              placeholder="12 digits"
              maxLength={12}
            />
          </Field>
          <Field label="PAN">
            <TextInput
              value={form.panNo}
              onChange={(e) => update("panNo", e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
              maxLength={10}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Role">
            <SelectInput
              value={form.roleName}
              onChange={(e) => update("roleName", e.target.value)}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="owner">Owner</option>
            </SelectInput>
          </Field>
          <Field label="Department">
            {departments.length ? (
              <SelectInput
                value={form.departmentName}
                onChange={(e) => update("departmentName", e.target.value)}
              >
                <option value="">Select…</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </SelectInput>
            ) : (
              <TextInput
                value={form.departmentName}
                onChange={(e) => update("departmentName", e.target.value)}
                placeholder="Department name"
              />
            )}
          </Field>
        </div>
        <PrimaryButton type="submit" loading={submitting} className="w-full">
          <UserPlus className="h-3.5 w-3.5" />
          Register employee
        </PrimaryButton>
      </form>
    </div>
  );
}
