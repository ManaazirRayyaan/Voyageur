import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function DashboardProfile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    age: "",
    gender: "",
    phone: "",
    current_password: "",
    new_password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
      age: user?.age || "",
      gender: user?.gender || "",
      phone: user?.phone || "",
      current_password: "",
      new_password: "",
    });
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const updated = await updateProfile(form);
      setForm((prev) => ({
        ...prev,
        name: updated.name,
        username: updated.username,
        email: updated.email,
        age: updated.age || "",
        gender: updated.gender || "",
        phone: updated.phone || "",
        current_password: "",
        new_password: "",
      }));
      setMessage("Profile updated successfully.");
    } catch (err) {
      const payload = err.payload || {};
      setError(
        payload.current_password?.[0] ||
        payload.new_password?.[0] ||
        payload.email?.[0] ||
        payload.username?.message ||
        err.message
      );
    }
  };

  return (
    <section className="section-card p-6">
      <h2 className="text-2xl font-semibold">Profile Settings</h2>
      <p className="mt-2 text-sm text-slate-600">Update your account details and change password with backend validation.</p>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Full name" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
        <input value={form.username} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))} placeholder="Username" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
        <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
        <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
        <input type="number" value={form.age} onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))} placeholder="Age" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
        <select value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none">
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <input type="password" value={form.current_password} onChange={(e) => setForm((prev) => ({ ...prev, current_password: e.target.value }))} placeholder="Current password" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
        <input type="password" value={form.new_password} onChange={(e) => setForm((prev) => ({ ...prev, new_password: e.target.value }))} placeholder="New password" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
        {message ? <p className="md:col-span-2 text-sm font-medium text-emerald-600">{message}</p> : null}
        {error ? <p className="md:col-span-2 text-sm font-medium text-rose-600">{error}</p> : null}
        <div className="md:col-span-2">
          <button type="submit" className="btn-primary rounded-full px-6 py-3 text-sm font-semibold">Save Profile</button>
        </div>
      </form>
    </section>
  );
}

export default DashboardProfile;
