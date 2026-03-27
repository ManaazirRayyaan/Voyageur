import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.payload?.detail || err.message || "Login failed.");
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="auth-panel flex items-center px-6 py-12 text-white lg:px-16">
        <div className="max-w-xl">
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">Premium travel access</span>
          <h1 className="font-display mt-6 text-5xl font-semibold">Log in to manage bookings and upcoming journeys.</h1>
        </div>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="section-card w-full max-w-md p-8">
          <h2 className="text-3xl font-semibold">Welcome back</h2>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input type="text" placeholder="Username or Email" value={form.identifier} onChange={(e) => setForm((prev) => ({ ...prev, identifier: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
            <button type="submit" className="btn-primary w-full rounded-2xl px-5 py-3 text-sm font-semibold">Login</button>
          </form>
          <div className="mt-6 text-sm text-slate-500">
            <Link to="/forgot-password" className="font-semibold text-sky-700">Forgot password?</Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">No account yet? <Link to="/register" className="font-semibold text-sky-700">Create one</Link></p>
        </div>
      </section>
    </main>
  );
}

export default Login;
