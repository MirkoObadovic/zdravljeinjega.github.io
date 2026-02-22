// ===== Helpers =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ===== Year =====
$("#year").textContent = new Date().getFullYear();

// ===== Mobile nav =====
const burger = $("#burger");
const mobileNav = $("#mobileNav");

burger.addEventListener("click", () => {
  const expanded = burger.getAttribute("aria-expanded") === "true";
  burger.setAttribute("aria-expanded", String(!expanded));
  mobileNav.hidden = expanded;
});

$$(".mobileNav__link").forEach(link => {
  link.addEventListener("click", () => {
    burger.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
  });
});

// ===== Active tab highlighting on scroll =====
const navLinks = $$(".nav__link");
const sections = ["pocetna", "prijava", "o-nama"].map(id => document.getElementById(id));

const setActive = (id) => {
  navLinks.forEach(a => a.classList.toggle("is-active", a.dataset.nav === id));
};

const observer = new IntersectionObserver((entries) => {
  const visible = entries
    .filter(e => e.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible?.target?.id) setActive(visible.target.id);
}, { threshold: [0.25, 0.4, 0.6] });

sections.forEach(s => observer.observe(s));

// ===== Slider =====
// Tematske Unsplash slike (kućna njega starijih / podrška / medicinska briga)
// Savjet: kasnije možeš staviti lokalne slike (npr. ./img/slide1.jpg)
const slides = [
  { src: "https://images.unsplash.com/photo-1580281657527-47f249e8f7a9?auto=format&fit=crop&w=1600&q=80", alt: "Njega u kući" },
  { src: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=1600&q=80", alt: "Društvo i podrška" },
  { src: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1600&q=80", alt: "Medicinska njega kod kuće" },
  { src: "https://images.unsplash.com/photo-1597764690523-15bea4c581c9?auto=format&fit=crop&w=1600&q=80", alt: "Šetnja i pratnja" },
  { src: "https://images.unsplash.com/photo-1603398938378-e54f6b6b28b8?auto=format&fit=crop&w=1600&q=80", alt: "Povjerenje i sigurnost" },
];



let current = 0;
const sliderImage = $("#sliderImage");
sliderImage.addEventListener("error", () => {
  sliderImage.src = "https://picsum.photos/1600/900";
});

const dotsWrap = $("#dots");

function renderDots() {
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

function showSlide(index) {
  const { src, alt } = slides[index];

  sliderImage.style.opacity = "0";
  setTimeout(() => {
    sliderImage.alt = alt;
    sliderImage.src = src;

    // mali fallback: ako se slika sporo učita
    sliderImage.onload = () => (sliderImage.style.opacity = "1");
    sliderImage.onerror = () => {
      sliderImage.style.opacity = "1";
      sliderImage.alt = "Njega starijih osoba";
    };

    $$(".dotBtn", dotsWrap).forEach((d, i) =>
      d.classList.toggle("is-active", i === index)
    );
  }, 160);
}

function goTo(index) {
  current = (index + slides.length) % slides.length;
  showSlide(current);
}

$("#prevSlide").addEventListener("click", () => goTo(current - 1));
$("#nextSlide").addEventListener("click", () => goTo(current + 1));

// init (bitno: prvo dots, pa slajd)
renderDots();
showSlide(current);

// autoplay
let autoplay = setInterval(() => goTo(current + 1), 5000);

// pause on hover
$(".slider").addEventListener("mouseenter", () => clearInterval(autoplay));
$(".slider").addEventListener("mouseleave", () => {
  clearInterval(autoplay);
  autoplay = setInterval(() => goTo(current + 1), 5000);
});


// ===== Form (demo validation + local "success") =====
const form = $("#requestForm");
const alertBox = $("#formAlert");

function showAlert(msg, type = "error") {
  alertBox.hidden = false;
  alertBox.classList.remove("is-error", "is-success");
  alertBox.classList.add(type === "success" ? "is-success" : "is-error");
  alertBox.textContent = msg;
}

function hideAlert() {
  alertBox.hidden = true;
  alertBox.textContent = "";
  alertBox.classList.remove("is-error", "is-success");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener("reset", () => {
  hideAlert();
});

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
  const saglasnost = $("#saglasnost").checked;

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

  emailjs.send("TVOJ_SERVICE_ID", "TVOJ_TEMPLATE_ID", {
  ime,
  prezime,
  trajanje,
  datum,
  telefon,
  email
})
.then(() => {
  showAlert("Prijava je uspješno poslata ✅", "success");
  form.reset();
})
.catch(() => {
  showAlert("Greška pri slanju emaila.", "error");
});

  form.reset();
});
