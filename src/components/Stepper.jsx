function Stepper({ steps, activeStep }) {
  return (
    <div>
      <div className="progress-rail h-3 rounded-full">
        <div className="progress-fill h-3 rounded-full" style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-6">
        {steps.map((step, index) => (
          <div key={step} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${index === activeStep ? "bg-sky-100 text-sky-700" : "bg-white text-slate-500"}`}>
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Stepper;
