// ===== Helpers =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ===== Year =====
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Mobile nav =====
const burger = $("#burger");
const mobileNav = $("#mobileNav");

if (burger && mobileNav) {
  burger.addEventListener("click", () => {
    const expanded = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!expanded));
    mobileNav.hidden = expanded;
  });

  $$(".mobileNav__link").forEach((link) => {
    link.addEventListener("click", () => {
      burger.setAttribute("aria-expanded", "false");
      mobileNav.hidden = true;
    });
  });
}

// ===== Active tab highlighting on scroll =====
const navLinks = $$(".nav__link");
const sections = ["pocetna", "prijava", "o-nama"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const setActive = (id) => {
  navLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.nav === id));
};

if (sections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) setActive(visible.target.id);
    },
    { threshold: [0.25, 0.4, 0.6] }
  );

  sections.forEach((s) => observer.observe(s));
}

// ===== Slider (LOCAL) =====
const slides = [
  { src: "images/slider/1.jpg", alt: "Njega starijih osoba" },
  { src: "images/slider/2.jpg", alt: "Pomoć u kući i podrška" },
  { src: "images/slider/3.jpg", alt: "Društvo i asistencija" },
  { src: "images/slider/4.jpg", alt: "Medicinska briga i njega" },
  { src: "images/slider/5.jpg", alt: "Medicinska briga i njega1" },
];

let current = 0;
const sliderImage = $("#sliderImage");
const dotsWrap = $("#dots");
const prevBtn = $("#prevSlide");
const nextBtn = $("#nextSlide");
const sliderRoot = $(".slider");

function preloadOne(url) {
  const im = new Image();
  im.src = url; // trigeruje download i keširanje u pozadini
}

function renderDots() {
  if (!dotsWrap) return;
  dotsWrap.innerHTML = "";

  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "dotBtn" + (i === current ? " is-active" : "");
    b.type = "button";
    b.setAttribute("aria-label", `Idi na slajd ${i + 1}`);
    b.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(b);
  });
}

function setActiveDot(index) {
  if (!dotsWrap) return;
  $$(".dotBtn", dotsWrap).forEach((d, i) => d.classList.toggle("is-active", i === index));
}

function showSlide(index) {
  if (!sliderImage) return;

  const slide = slides[index];
  if (!slide) return;

  sliderImage.style.opacity = "0";

  // ako želiš efekat fade, ostavi timeout; ako ne želiš, stavi 0
  setTimeout(() => {
    sliderImage.alt = slide.alt || "Njega starijih osoba";
    sliderImage.src = slide.src;

    sliderImage.onload = () => {
      sliderImage.style.opacity = "1";
    };

    sliderImage.onerror = () => {
      // fallback ako lokalna slika ne postoji / putanja nije dobra
      sliderImage.style.opacity = "1";
      sliderImage.alt = "Njega starijih osoba";
      sliderImage.src = "images/slider/fallback.jpg";
    };

    setActiveDot(index);

    // Preload samo sledeću + prethodnu (ne sve)
    const next = slides[(index + 1) % slides.length]?.src;
    const prev = slides[(index - 1 + slides.length) % slides.length]?.src;
    if (next) preloadOne(next);
    if (prev) preloadOne(prev);
  }, 160);
}

function goTo(index) {
  current = (index + slides.length) % slides.length;
  showSlide(current);
}

if (prevBtn) prevBtn.addEventListener("click", () => goTo(current - 1));
if (nextBtn) nextBtn.addEventListener("click", () => goTo(current + 1));

// init
renderDots();
showSlide(current);

// autoplay
let autoplay = null;
function startAutoplay() {
  stopAutoplay();
  autoplay = setInterval(() => goTo(current + 1), 5000);
}
function stopAutoplay() {
  if (autoplay) clearInterval(autoplay);
  autoplay = null;
}
startAutoplay();

// pause on hover
if (sliderRoot) {
  sliderRoot.addEventListener("mouseenter", stopAutoplay);
  sliderRoot.addEventListener("mouseleave", startAutoplay);
}

// ===== Form (EmailJS) =====
const form = $("#requestForm");
const alertBox = $("#formAlert");

function showAlert(msg, type = "error") {
  if (!alertBox) return;
  alertBox.hidden = false;
  alertBox.classList.remove("is-error", "is-success");
  alertBox.classList.add(type === "success" ? "is-success" : "is-error");
  alertBox.textContent = msg;
}

function hideAlert() {
  if (!alertBox) return;
  alertBox.hidden = true;
  alertBox.textContent = "";
  alertBox.classList.remove("is-error", "is-success");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (form) {
  form.addEventListener("reset", () => hideAlert());

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    hideAlert();

    const data = new FormData(form);
    const ime = (data.get("ime") || "").toString().trim();
    const prezime = (data.get("prezime") || "").toString().trim();
    const trajanje = (data.get("trajanje") || "").toString().trim();
    const datum = (data.get("datum") || "").toString().trim();
    const telefon = (data.get("telefon") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const saglasnost = $("#saglasnost")?.checked;

    const missing = [];
    if (!ime) missing.push("ime");
    if (!prezime) missing.push("prezime");
    if (!trajanje) missing.push("trajanje");
    if (!datum) missing.push("datum");
    if (!telefon) missing.push("telefon");
    if (!email) missing.push("email");
    if (!saglasnost) missing.push("saglasnost");

    if (missing.length) {
      showAlert("Molim popuni sva obavezna polja i označi saglasnost.", "error");
      return;
    }
    if (!isValidEmail(email)) {
      showAlert("Unesi ispravnu email adresu.", "error");
      return;
    }

    // EmailJS mora biti inicijalizovan u HTML-u (emailjs.init)
    emailjs
      .send("TVOJ_SERVICE_ID", "TVOJ_TEMPLATE_ID", {
        ime,
        prezime,
        trajanje,
        datum,
        telefon,
        email,
      })
      .then(() => {
        showAlert("Prijava je uspješno poslata.", "success");
        form.reset();
      })
      .catch(() => {
        showAlert("Greška pri slanju emaila.", "error");
      });
  });
}
