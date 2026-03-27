/*
  Shared UI interactions for the Travel Planner frontend.
  Handles navigation, carousels, filters, modals, review ratings, and custom trip step logic.
*/

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initNavbarState();
  initCarousel();
  initPackageFilters();
  initAccordions();
  initTripBuilder();
  initModals();
  initRatingInputs();
});

function initMobileMenu() {
  const toggle = document.querySelector("[data-mobile-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");

  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });
}

function initNavbarState() {
  const nav = document.querySelector("[data-navbar]");
  if (!nav) return;

  const isHome = document.body.dataset.page === "home";
  const applyState = () => {
    if (isHome && window.scrollY < 24) {
      nav.classList.remove("glass-nav");
      nav.classList.add("bg-transparent");
    } else {
      nav.classList.add("glass-nav");
      nav.classList.remove("bg-transparent");
    }
  };

  applyState();
  window.addEventListener("scroll", applyState);
}

function initCarousel() {
  const track = document.querySelector("[data-carousel-track]");
  const prev = document.querySelector("[data-carousel-prev]");
  const next = document.querySelector("[data-carousel-next]");

  if (!track || !prev || !next) return;

  const step = () => track.querySelector(".carousel-slide")?.getBoundingClientRect().width || 320;

  prev.addEventListener("click", () => {
    track.scrollBy({ left: -step(), behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    track.scrollBy({ left: step(), behavior: "smooth" });
  });
}

function initPackageFilters() {
  const list = document.querySelector("[data-package-list]");
  if (!list) return;

  const cards = Array.from(list.querySelectorAll("[data-package-card]"));
  const priceRange = document.querySelector("[data-filter-price]");
  const priceLabel = document.querySelector("[data-price-label]");
  const duration = document.querySelector("[data-filter-duration]");
  const rating = document.querySelector("[data-filter-rating]");
  const categoryInputs = Array.from(document.querySelectorAll("[data-filter-category]"));

  const applyFilters = () => {
    const maxPrice = Number(priceRange?.value || 5000);
    const durationValue = duration?.value || "all";
    const minRating = Number(rating?.value || 0);
    const categories = categoryInputs.filter((input) => input.checked).map((input) => input.value);

    if (priceLabel) priceLabel.textContent = `$${maxPrice}`;

    cards.forEach((card) => {
      const price = Number(card.dataset.price);
      const days = Number(card.dataset.days);
      const stars = Number(card.dataset.rating);
      const category = card.dataset.category;

      const matchesPrice = price <= maxPrice;
      const matchesDuration =
        durationValue === "all" ||
        (durationValue === "short" && days <= 4) ||
        (durationValue === "medium" && days >= 5 && days <= 8) ||
        (durationValue === "long" && days >= 9);
      const matchesRating = stars >= minRating;
      const matchesCategory = categories.length === 0 || categories.includes(category);

      card.classList.toggle("hidden", !(matchesPrice && matchesDuration && matchesRating && matchesCategory));
    });
  };

  [priceRange, duration, rating, ...categoryInputs].forEach((input) => {
    input?.addEventListener("input", applyFilters);
    input?.addEventListener("change", applyFilters);
  });

  applyFilters();
}

function initAccordions() {
  document.querySelectorAll(".accordion-item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      document.querySelectorAll(".accordion-item").forEach((peer) => {
        if (peer !== item && peer.closest("[data-accordion-group]") === item.closest("[data-accordion-group]")) {
          peer.open = false;
        }
      });
    });
  });
}

function initTripBuilder() {
  const builder = document.querySelector("[data-trip-builder]");
  if (!builder) return;

  const steps = Array.from(builder.querySelectorAll("[data-step]"));
  const nextBtn = builder.querySelector("[data-step-next]");
  const prevBtn = builder.querySelector("[data-step-prev]");
  const progress = builder.querySelector("[data-progress-fill]");
  const summaries = Array.from(builder.querySelectorAll("[data-trip-summary]"));
  const totals = Array.from(builder.querySelectorAll("[data-total-price]"));
  let activeStep = 0;

  const state = {
    destination: "Bali Escape",
    dates: "12 Oct - 18 Oct",
    transport: "Business Flight",
    hotel: "Ocean Crest Suite",
    activities: ["Coral Diving", "Sunset Cruise"],
  };

  const pricing = {
    destination: 1490,
    dates: 220,
    transport: 640,
    hotel: 540,
    activities: 310,
  };

  const calcTotal = () => Object.values(pricing).reduce((sum, value) => sum + value, 0);

  const renderSummary = () => {
    if (summaries.length === 0 || totals.length === 0) return;
    const summaryMarkup = `
      <div class="space-y-3 text-sm text-slate-600">
        <div class="flex items-center justify-between"><span>Destination</span><strong class="text-slate-900">${state.destination}</strong></div>
        <div class="flex items-center justify-between"><span>Travel Dates</span><strong class="text-slate-900">${state.dates}</strong></div>
        <div class="flex items-center justify-between"><span>Transport</span><strong class="text-slate-900">${state.transport}</strong></div>
        <div class="flex items-center justify-between"><span>Hotel</span><strong class="text-slate-900">${state.hotel}</strong></div>
        <div class="flex items-center justify-between"><span>Activities</span><strong class="text-slate-900 text-right">${state.activities.join(", ")}</strong></div>
      </div>
    `;
    summaries.forEach((summary) => {
      summary.innerHTML = summaryMarkup;
    });
    totals.forEach((total) => {
      total.textContent = `$${calcTotal()}`;
    });
  };

  const updateStepView = () => {
    steps.forEach((step, index) => {
      step.classList.toggle("hidden", index !== activeStep);
    });
    if (progress) {
      const width = ((activeStep + 1) / steps.length) * 100;
      progress.style.width = `${width}%`;
    }
    if (prevBtn) prevBtn.disabled = activeStep === 0;
    if (nextBtn) nextBtn.textContent = activeStep === steps.length - 1 ? "Confirm Trip" : "Continue";
  };

  builder.querySelectorAll("[data-select-card]").forEach((card) => {
    card.addEventListener("click", () => {
      const group = card.dataset.group;
      const value = card.dataset.value;
      const price = Number(card.dataset.price || 0);

      if (group === "activities") {
        const current = new Set(state.activities);
        if (current.has(value)) {
          current.delete(value);
          card.classList.remove("selected");
        } else {
          current.add(value);
          card.classList.add("selected");
        }
        state.activities = Array.from(current);
        pricing.activities = Math.max(120, state.activities.length * 155);
      } else {
        builder.querySelectorAll(`[data-select-card][data-group="${group}"]`).forEach((peer) => {
          peer.classList.remove("selected");
        });
        card.classList.add("selected");
        state[group] = value;
        pricing[group] = price;
      }

      renderSummary();
    });
  });

  nextBtn?.addEventListener("click", () => {
    if (activeStep < steps.length - 1) {
      activeStep += 1;
      updateStepView();
    } else {
      window.location.href = "booking-confirmation.html";
    }
  });

  prevBtn?.addEventListener("click", () => {
    if (activeStep === 0) return;
    activeStep -= 1;
    updateStepView();
  });

  renderSummary();
  updateStepView();
}

function initModals() {
  const openButtons = document.querySelectorAll("[data-modal-open]");
  const closeButtons = document.querySelectorAll("[data-modal-close]");

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.modalOpen;
      const modal = document.querySelector(`[data-modal="${id}"]`);
      modal?.classList.remove("hidden-modal");
      modal?.classList.add("visible-modal");
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest("[data-modal]");
      modal?.classList.add("hidden-modal");
      modal?.classList.remove("visible-modal");
    });
  });
}

function initRatingInputs() {
  document.querySelectorAll("[data-rating-stars]").forEach((group) => {
    const output = group.querySelector("[data-rating-output]");
    group.querySelectorAll("button").forEach((star) => {
      star.addEventListener("click", () => {
        const value = Number(star.dataset.value);
        group.querySelectorAll("button").forEach((peer) => {
          peer.classList.toggle("text-amber-400", Number(peer.dataset.value) <= value);
          peer.classList.toggle("text-slate-300", Number(peer.dataset.value) > value);
        });
        if (output) output.value = String(value);
      });
    });
  });
}
