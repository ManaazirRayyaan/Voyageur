import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../utils/api";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      const payload = err.payload || {};
      const usernameError = Array.isArray(payload.username) ? payload.username[0] : payload.username;
      const suggestionList = usernameError?.suggestions || payload.suggestions || [];
      setSuggestions(suggestionList);
      setError(
        usernameError?.message ||
          payload.email?.[0] ||
          payload.password?.[0] ||
          err.message ||
          "Registration failed."
      );
    }
  };

  const handleUsernameBlur = async () => {
    if (!form.username) return;
    try {
      const data = await apiRequest(`/api/username-suggestions/?username=${encodeURIComponent(form.username)}`);
      setSuggestions(data.available ? [] : data.suggestions);
    } catch {
      setSuggestions([]);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="auth-panel flex items-center px-6 py-12 text-white lg:px-16">
        <div className="max-w-xl">
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">Create account</span>
          <h1 className="font-display mt-6 text-5xl font-semibold">Start planning with a real user account and dashboard.</h1>
        </div>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="section-card w-full max-w-md p-8">
          <h2 className="text-3xl font-semibold">Create account</h2>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input type="text" placeholder="Full name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
            <input type="text" placeholder="Username" value={form.username} onBlur={handleUsernameBlur} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
            <input type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
            {suggestions.length ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Username suggestions</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button key={suggestion} type="button" onClick={() => setForm((prev) => ({ ...prev, username: suggestion }))} className="rounded-full border border-slate-200 px-3 py-1.5">
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
            <button type="submit" className="btn-primary w-full rounded-2xl px-5 py-3 text-sm font-semibold">Register</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-sky-700">Sign in</Link></p>
        </div>
      </section>
    </main>
  );
}

export default Register;
