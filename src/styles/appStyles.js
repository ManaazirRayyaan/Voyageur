const styles = String.raw`
:root {
  --brand-navy: #0f172a;
  --brand-slate: #334155;
  --brand-mist: #e2e8f0;
  --brand-ice: #f8fafc;
  --brand-blue: #2563eb;
  --brand-teal: #0f766e;
  --brand-cyan: #06b6d4;
  --brand-sand: #f5e7cf;
  --brand-sunset: #ff7a59;
  --brand-gold: #f59e0b;
  --brand-success: #10b981;
  --shadow-soft: 0 20px 60px rgba(15, 23, 42, 0.08);
  --shadow-card: 0 16px 40px rgba(15, 23, 42, 0.08);
  --shadow-hover: 0 24px 60px rgba(37, 99, 235, 0.14);
  --radius-xl: 1.5rem;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: "Plus Jakarta Sans", sans-serif;
  color: var(--brand-navy);
  background:
    radial-gradient(circle at top left, rgba(6, 182, 212, 0.08), transparent 30%),
    radial-gradient(circle at top right, rgba(255, 122, 89, 0.12), transparent 28%),
    linear-gradient(180deg, #f8fbff 0%, #ffffff 38%, #f8fafc 100%);
}

.font-display {
  font-family: "Playfair Display", serif;
}

.glass-nav {
  backdrop-filter: blur(18px);
  background: rgba(15, 23, 42, 0.56);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.liquid-glass-nav {
  backdrop-filter: blur(22px) saturate(180%);
  -webkit-backdrop-filter: blur(22px) saturate(180%);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(239, 246, 255, 0.48)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(148, 163, 184, 0.08));
  border-bottom: 1px solid rgba(255, 255, 255, 0.42);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 18px 50px rgba(15, 23, 42, 0.12);
}

.page-shell {
  position: relative;
  overflow: hidden;
}

.page-shell::before,
.page-shell::after {
  content: "";
  position: absolute;
  inset: auto;
  border-radius: 999px;
  filter: blur(60px);
  z-index: 0;
  pointer-events: none;
}

.page-shell::before {
  width: 18rem;
  height: 18rem;
  top: 6rem;
  right: -4rem;
  background: rgba(6, 182, 212, 0.14);
}

.page-shell::after {
  width: 14rem;
  height: 14rem;
  bottom: 10rem;
  left: -3rem;
  background: rgba(255, 122, 89, 0.14);
}

.section-surface {
  position: relative;
  z-index: 1;
}

.section-card,
.travel-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: var(--shadow-card);
  border-radius: var(--radius-xl);
}

.travel-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.travel-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-hover);
  border-color: rgba(37, 99, 235, 0.26);
}

.hero-overlay {
  background:
    linear-gradient(130deg, rgba(15, 23, 42, 0.78), rgba(15, 118, 110, 0.48)),
    linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.42));
}

.search-panel {
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
}

.search-panel .field {
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.search-panel .field:hover,
.search-panel .field:focus-within {
  border-color: rgba(37, 99, 235, 0.35);
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.12);
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, var(--brand-blue), var(--brand-cyan));
  color: white;
  box-shadow: 0 16px 34px rgba(37, 99, 235, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 46px rgba(37, 99, 235, 0.34);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.88);
  color: var(--brand-navy);
  border: 1px solid rgba(148, 163, 184, 0.22);
}

.badge-gradient {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(6, 182, 212, 0.12));
  color: var(--brand-blue);
  border: 1px solid rgba(37, 99, 235, 0.12);
}

.category-pill,
.chip-filter {
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(255, 255, 255, 0.82);
  transition: all 0.2s ease;
}

.category-pill:hover,
.chip-filter:hover,
.is-selected {
  border-color: rgba(37, 99, 235, 0.4);
  box-shadow: 0 12px 26px rgba(37, 99, 235, 0.12);
  background: rgba(239, 246, 255, 0.95);
}

.media-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rating-stars {
  color: var(--brand-gold);
}

.carousel-track {
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.carousel-track::-webkit-scrollbar {
  display: none;
}

.carousel-slide {
  scroll-snap-align: start;
}

.filter-range {
  accent-color: var(--brand-blue);
}

.step-card {
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  transition: all 0.2s ease;
}

.step-card:hover {
  border-color: rgba(37, 99, 235, 0.28);
}

.step-card.selected {
  border-color: rgba(37, 99, 235, 0.5);
  box-shadow: 0 20px 40px rgba(37, 99, 235, 0.12);
  background: linear-gradient(180deg, rgba(239, 246, 255, 1) 0%, rgba(255, 255, 255, 1) 100%);
}

.progress-rail {
  background: rgba(226, 232, 240, 0.9);
}

.progress-fill {
  background: linear-gradient(90deg, var(--brand-blue), var(--brand-cyan));
  transition: width 0.3s ease;
}

.sticky-booking {
  top: 6rem;
}

.accordion-item[open] {
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.06);
}

.accordion-item summary::-webkit-details-marker {
  display: none;
}

.modal-backdrop {
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(8px);
}

.hidden-modal {
  opacity: 0;
  pointer-events: none;
}

.visible-modal {
  opacity: 1;
  pointer-events: auto;
}

.success-ring {
  animation: pulseRing 2s ease-in-out infinite;
}

@keyframes pulseRing {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 24px rgba(16, 185, 129, 0);
  }
}

.chart-bar {
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.9), rgba(6, 182, 212, 0.9));
  border-radius: 999px 999px 0 0;
}

.dashboard-sidebar {
  background: linear-gradient(180deg, #0f172a 0%, #13284d 100%);
}

.dashboard-topbar {
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.auth-panel {
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.18), transparent 34%),
    linear-gradient(145deg, #0f172a, #0f766e 88%);
}

@media (max-width: 767px) {
  .sticky-booking {
    position: static;
  }
}
`;

export function injectGlobalStyles() {
  if (document.getElementById("voyageur-react-styles")) return;
  const tag = document.createElement("style");
  tag.id = "voyageur-react-styles";
  tag.textContent = styles;
  document.head.appendChild(tag);
}
