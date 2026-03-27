import { Link } from "react-router-dom";

function ForgotPassword() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="auth-panel flex items-center px-6 py-12 text-white lg:px-16">
        <div className="max-w-xl">
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">Account recovery</span>
          <h1 className="font-display mt-6 text-5xl font-semibold">Reset access without losing your travel plans.</h1>
        </div>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="section-card w-full max-w-md p-8">
          <h2 className="text-3xl font-semibold">Forgot password</h2>
          <p className="mt-2 text-sm text-slate-500">This demo flow preserves the UI and routes correctly back into authentication.</p>
          <input type="email" placeholder="Email address" className="mt-8 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
          <button type="button" className="btn-primary mt-4 w-full rounded-2xl px-5 py-3 text-sm font-semibold">Send reset link</button>
          <p className="mt-6 text-center text-sm text-slate-500"><Link to="/login" className="font-semibold text-sky-700">Back to login</Link></p>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;
