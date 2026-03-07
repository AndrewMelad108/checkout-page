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

function decodeArbitraryValue(rawValue) {
  const escapedUnderscoreToken = "__TW_ESCAPED_UNDERSCORE__";

  return rawValue
    .replace(/\\_/g, escapedUnderscoreToken)
    .replace(/_/g, " ")
    .replace(new RegExp(escapedUnderscoreToken, "g"), "_");
}

function applyArbitraryClassToElement(element, className) {
  const spacingMatch = className.match(/^(-)?(m|mx|my|mt|mr|mb|ml)-\[(.+)\]$/);
  if (spacingMatch) {
    const isNegative = Boolean(spacingMatch[1]);
    const spacingType = spacingMatch[2];
    const spacingRawValue = decodeArbitraryValue(spacingMatch[3]);
    const spacingValue =
      isNegative && !spacingRawValue.startsWith("-")
        ? `-${spacingRawValue}`
        : spacingRawValue;

    if (spacingType === "m") {
      element.style.margin = spacingValue;
    } else if (spacingType === "mx") {
      element.style.marginInline = spacingValue;
    } else if (spacingType === "my") {
      element.style.marginBlock = spacingValue;
    } else if (spacingType === "mt") {
      element.style.marginTop = spacingValue;
    } else if (spacingType === "mr") {
      element.style.marginRight = spacingValue;
    } else if (spacingType === "mb") {
      element.style.marginBottom = spacingValue;
    } else if (spacingType === "ml") {
      element.style.marginLeft = spacingValue;
    }

    return;
  }

  const gapMatch = className.match(/^(gap|gap-x|gap-y)-\[(.+)\]$/);
  if (gapMatch) {
    const gapType = gapMatch[1];
    const gapValue = decodeArbitraryValue(gapMatch[2]);

    if (gapType === "gap") {
      element.style.gap = gapValue;
    } else if (gapType === "gap-x") {
      element.style.columnGap = gapValue;
    } else if (gapType === "gap-y") {
      element.style.rowGap = gapValue;
    }

    return;
  }

  const textSizeMatch = className.match(/^text-\[(.+)\]$/);
  if (textSizeMatch) {
    element.style.fontSize = decodeArbitraryValue(textSizeMatch[1]);
  }
}

function applyArbitraryUtilitiesToElement(element) {
  if (!(element instanceof Element) || !element.classList) {
    return;
  }

  for (const className of element.classList) {
    applyArbitraryClassToElement(element, className);
  }
}

function applyArbitraryUtilities(rootNode = document) {
  if (rootNode instanceof Element) {
    applyArbitraryUtilitiesToElement(rootNode);
    rootNode.querySelectorAll("[class]").forEach(applyArbitraryUtilitiesToElement);
    return;
  }

  document.querySelectorAll("[class]").forEach(applyArbitraryUtilitiesToElement);
}

function setupArbitraryObserver() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.target instanceof Element) {
        applyArbitraryUtilitiesToElement(mutation.target);
        continue;
      }

      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            applyArbitraryUtilities(node);
          }
        });
      }
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class"],
  });
}

function clampQuantity(value, min = 1) {
  if (Number.isNaN(value)) {
    return min;
  }

  return Math.max(min, value);
}

function updateQuantity(control, delta) {
  const valueElement = control.querySelector("[data-qty-value]");
  if (!valueElement) {
    return;
  }

  const currentValue = Number.parseInt(valueElement.textContent || "1", 10);
  const nextValue = clampQuantity(currentValue + delta);
  valueElement.textContent = String(nextValue);
}

function handleQuantityAction(actionElement) {
  const control = actionElement.closest("[data-qty]");
  if (!control) {
    return;
  }

  const action = actionElement.getAttribute("data-qty-action");
  if (action === "increase") {
    updateQuantity(control, 1);
    return;
  }

  if (action === "decrease") {
    updateQuantity(control, -1);
  }
}

function setupQuantityControls() {
  document.addEventListener("click", (event) => {
    const actionElement = event.target.closest("[data-qty-action]");
    if (!actionElement) {
      return;
    }

    handleQuantityAction(actionElement);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const actionElement = event.target.closest("[data-qty-action]");
    if (!actionElement) {
      return;
    }

    event.preventDefault();
    handleQuantityAction(actionElement);
  });
}

function setSelectedOption(item) {
  const group = item.closest("[data-select-group]");
  if (!group) {
    return;
  }

  const items = group.querySelectorAll("[data-select-item]");
  items.forEach((element) => {
    element.classList.remove("is-selected");
    element.setAttribute("aria-pressed", "false");
  });

  item.classList.add("is-selected");
  item.setAttribute("aria-pressed", "true");
}

function setupOptionSelection() {
  document.querySelectorAll("[data-select-group]").forEach((group) => {
    const items = Array.from(group.querySelectorAll("[data-select-item]"));
    if (!items.length) {
      return;
    }

    const selected = items.find((item) => item.classList.contains("is-selected"));
    setSelectedOption(selected || items[0]);
  });

  document.addEventListener("click", (event) => {
    const option = event.target.closest("[data-select-item]");
    if (!option) {
      return;
    }

    setSelectedOption(option);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const option = event.target.closest("[data-select-item]");
    if (!option) {
      return;
    }

    event.preventDefault();
    setSelectedOption(option);
  });
}

applyLanguage(getInitialLanguage());
setupLanguageSwitch();
applyArbitraryUtilities();
setupArbitraryObserver();
setupQuantityControls();
setupOptionSelection();
