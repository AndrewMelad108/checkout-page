const STORAGE_KEY = "checkout-page-lang";

const translations = {
  en: {
    brand: "AURA",
    shipping: "Fast shipping",
    pageTitle: "Checkout Page",
    langLabel: "EN",
    switchAriaLabel: "Switch to Arabic",
    nextLang: "ar",
  },
  ar: {
    brand: "أورا",
    shipping: "شحن سريع",
    pageTitle: "صفحة الدفع",
    langLabel: "AR",
    switchAriaLabel: "التبديل إلى الإنجليزية",
    nextLang: "en",
  },
};

function isRtlLanguage(lang) {
  return lang === "ar";
}

function getInitialLanguage() {
  const savedLanguage = localStorage.getItem(STORAGE_KEY);
  if (savedLanguage && translations[savedLanguage]) {
    return savedLanguage;
  }

  const browserLanguage = navigator.language?.toLowerCase() || "en";
  if (browserLanguage.startsWith("ar")) {
    return "ar";
  }

  return "en";
}

function applyLanguage(language) {
  const safeLanguage = translations[language] ? language : "en";
  const currentTranslation = translations[safeLanguage];
  const htmlElement = document.documentElement;

  htmlElement.lang = safeLanguage;
  htmlElement.dir = isRtlLanguage(safeLanguage) ? "rtl" : "ltr";
  document.title = currentTranslation.pageTitle;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (!key || !currentTranslation[key]) {
      return;
    }

    element.textContent = currentTranslation[key];
  });

  const toggle = document.getElementById("lang-toggle");
  const toggleLabel = document.getElementById("lang-toggle-label");

  if (toggle) {
    toggle.setAttribute("aria-label", currentTranslation.switchAriaLabel);
    toggle.setAttribute("data-next-lang", currentTranslation.nextLang);
  }

  if (toggleLabel) {
    toggleLabel.textContent = currentTranslation.langLabel;
  }

  localStorage.setItem(STORAGE_KEY, safeLanguage);
}

function setupLanguageSwitch() {
  const toggle = document.getElementById("lang-toggle");
  if (!toggle) {
    return;
  }

  const switchLanguage = () => {
    const nextLanguage = toggle.getAttribute("data-next-lang") || "ar";
    applyLanguage(nextLanguage);
  };

  toggle.addEventListener("click", switchLanguage);
  toggle.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    switchLanguage();
  });
}

applyLanguage(getInitialLanguage());
setupLanguageSwitch();
