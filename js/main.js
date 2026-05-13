const HERO_SLIDE_DURATION = 3000;
const HERO_COMPACT_PAGINATION_COUNT = 4;
const PRODUCT_SLIDE_ANIMATION_DURATION = 500;
const PRODUCT_OFFER_TARGETS = {
  price: "[data-product-price-value]",
  stock: "[data-product-stock-text]",
  stockBar: "[data-product-stock-bar]",
  delivery: "[data-product-delivery-value]",
  pickup: "[data-product-pickup-value]",
  storage: "[data-product-storage-text]",
};
const PHONE_MAX_LENGTH = 18;
const PHONE_PATTERN = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
const NAME_DIGIT_PATTERN = /\d/;
const NAME_DIGITS_PATTERN = /\d/g;

const formatPhone = (value) => {
  let digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits[0] === "8") {
    digits = `7${digits.slice(1)}`;
  } else if (digits[0] === "9") {
    digits = `7${digits}`;
  } else if (digits[0] !== "7") {
    digits = `7${digits}`;
  }

  digits = digits.slice(0, 11);

  const code = digits.slice(1, 4);
  const first = digits.slice(4, 7);
  const second = digits.slice(7, 9);
  const third = digits.slice(9, 11);

  let formatted = "+7";

  if (code) {
    formatted += ` (${code}`;
  }

  if (code.length === 3) {
    formatted += ") ";
  }

  if (first) {
    formatted += first;
  }

  if (second) {
    formatted += `-${second}`;
  }

  if (third) {
    formatted += `-${third}`;
  }

  return formatted.slice(0, PHONE_MAX_LENGTH);
};

const initPhoneMask = (phoneInput) => {
  phoneInput.maxLength = PHONE_MAX_LENGTH;

  phoneInput.addEventListener("input", () => {
    phoneInput.value = formatPhone(phoneInput.value);

    if (PHONE_PATTERN.test(phoneInput.value)) {
      phoneInput.removeAttribute("aria-invalid");
    }
  });

  phoneInput.addEventListener("keydown", (event) => {
    if (event.key !== "Backspace" && event.key !== "Delete") {
      return;
    }

    const digits = phoneInput.value.replace(/\D/g, "");

    if (digits.length <= 1) {
      event.preventDefault();
      phoneInput.value = "";
      return;
    }

    const cursorPosition = phoneInput.selectionStart ?? phoneInput.value.length;
    const hasSelection = phoneInput.selectionStart !== phoneInput.selectionEnd;

    if (hasSelection) {
      return;
    }

    const targetIndex = event.key === "Backspace" ? cursorPosition - 1 : cursorPosition;
    const targetChar = phoneInput.value[targetIndex];

    if (targetChar && /\D/.test(targetChar)) {
      event.preventDefault();

      const chars = phoneInput.value.split("");
      const direction = event.key === "Backspace" ? -1 : 1;
      let digitIndex = targetIndex;

      while (digitIndex >= 0 && digitIndex < chars.length && /\D/.test(chars[digitIndex])) {
        digitIndex += direction;
      }

      if (digitIndex >= 0 && digitIndex < chars.length) {
        chars.splice(digitIndex, 1);
        phoneInput.value = formatPhone(chars.join(""));
      }
    }
  });
};

const sanitizeNameValue = (value) => value.replace(NAME_DIGITS_PATTERN, "");

const isNameValid = (value) => value.trim().length > 0 && !NAME_DIGIT_PATTERN.test(value);

const initNameField = (nameInput) => {
  nameInput.addEventListener("beforeinput", (event) => {
    if (!event.data || !NAME_DIGIT_PATTERN.test(event.data)) {
      return;
    }

    event.preventDefault();

    const cleanedValue = sanitizeNameValue(event.data);

    if (!cleanedValue) {
      return;
    }

    const selectionStart = nameInput.selectionStart ?? nameInput.value.length;
    const selectionEnd = nameInput.selectionEnd ?? selectionStart;
    nameInput.setRangeText(cleanedValue, selectionStart, selectionEnd, "end");
    nameInput.dispatchEvent(new Event("input", { bubbles: true }));
  });

  nameInput.addEventListener("input", () => {
    const cleanedValue = sanitizeNameValue(nameInput.value);

    if (nameInput.value !== cleanedValue) {
      nameInput.value = cleanedValue;
    }
  });
};

const initModals = () => {
  const modal = document.querySelector("[data-modal]");

  if (!modal) {
    return;
  }

  const dialogs = Array.from(modal.querySelectorAll("[data-modal-dialog]"));
  const openButtons = Array.from(document.querySelectorAll("[data-modal-open]"));
  const closeButtons = Array.from(modal.querySelectorAll("[data-modal-close]"));
  const forms = Array.from(modal.querySelectorAll("[data-modal-form]"));
  const phoneInputs = Array.from(modal.querySelectorAll("[data-phone-field]"));
  const nameInputs = Array.from(modal.querySelectorAll("[data-name-field]"));
  const headerMenu = document.querySelector("[data-menu]");
  const menuOpenButton = document.querySelector("[data-menu-open]");
  let activeDialog = null;
  let lastFocusedElement = null;

  const closeHeaderMenu = () => {
    document.body.classList.remove("is-menu-open");
    headerMenu?.classList.remove("header__mobile-menu--open");
    headerMenu?.setAttribute("aria-hidden", "true");
    menuOpenButton?.setAttribute("aria-expanded", "false");
  };

  const getFocusableElements = (container) =>
    Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hidden && element.offsetParent !== null);

  const resetFormState = (container) => {
    container.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
      field.removeAttribute("aria-invalid");
    });

    container.querySelectorAll(".modal-checkbox--error").forEach((checkbox) => {
      checkbox.classList.remove("modal-checkbox--error");
    });
  };

  const showDialog = (dialogName) => {
    const nextDialog = dialogs.find((dialog) => dialog.dataset.modalDialog === dialogName);

    if (!nextDialog) {
      return;
    }

    closeHeaderMenu();
    lastFocusedElement = document.activeElement;
    dialogs.forEach((dialog) => {
      dialog.hidden = dialog !== nextDialog;
    });

    activeDialog = nextDialog;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-modal-open");
    resetFormState(nextDialog);

    window.requestAnimationFrame(() => {
      const focusableElements = getFocusableElements(nextDialog);
      focusableElements[0]?.focus();
    });
  };

  const closeModal = () => {
    if (modal.hidden) {
      return;
    }

    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    dialogs.forEach((dialog) => {
      dialog.hidden = true;
    });
    document.body.classList.remove("is-modal-open");
    activeDialog = null;

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  const validateForm = (form) => {
    let isValid = true;

    form.querySelectorAll("[data-required-field]").forEach((field) => {
      const isPhoneField = field.matches("[data-phone-field]");
      const isNameField = field.matches("[data-name-field]");
      const fieldValue = field.value.trim();
      const isFieldValid = isPhoneField
        ? PHONE_PATTERN.test(fieldValue)
        : isNameField
          ? isNameValid(fieldValue)
          : fieldValue.length > 0;

      field.setAttribute("aria-invalid", isFieldValid ? "false" : "true");

      if (!isFieldValid) {
        isValid = false;
      }
    });

    form.querySelectorAll("[data-required-checkbox]").forEach((checkbox) => {
      const checkboxLabel = checkbox.closest(".modal-checkbox");
      checkboxLabel?.classList.toggle("modal-checkbox--error", !checkbox.checked);

      if (!checkbox.checked) {
        isValid = false;
      }
    });

    return isValid;
  };

  phoneInputs.forEach(initPhoneMask);
  nameInputs.forEach(initNameField);

  openButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      showDialog(button.dataset.modalOpen);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!validateForm(form)) {
        return;
      }

      showDialog("success");
    });

    form.querySelectorAll("[data-required-field]").forEach((field) => {
      field.addEventListener("input", () => {
        const isPhoneField = field.matches("[data-phone-field]");
        const isNameField = field.matches("[data-name-field]");
        const isFieldValid = isPhoneField
          ? PHONE_PATTERN.test(field.value.trim())
          : isNameField
            ? isNameValid(field.value)
            : field.value.trim().length > 0;

        if (isFieldValid) {
          field.removeAttribute("aria-invalid");
        }
      });
    });

    form.querySelectorAll("[data-required-checkbox]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        checkbox.closest(".modal-checkbox")?.classList.remove("modal-checkbox--error");
      });
    });
  });

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) {
      return;
    }

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key !== "Tab" || !activeDialog) {
      return;
    }

    const focusableElements = getFocusableElements(activeDialog);

    if (!focusableElements.length) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });
};

const initHeader = () => {
  const header = document.querySelector("[data-header]");
  const menu = document.querySelector("[data-menu]");
  const openButton = document.querySelector("[data-menu-open]");
  const closeButton = document.querySelector("[data-menu-close]");

  if (!header || !menu || !openButton || !closeButton) {
    return;
  }

  const menuLinks = Array.from(menu.querySelectorAll("a"));
  const desktopQuery = window.matchMedia("(min-width: 1241px)");
  let lastScrollY = window.scrollY;
  let isScrollTicking = false;

  const closeMenu = () => {
    document.body.classList.remove("is-menu-open");
    menu.classList.remove("header__mobile-menu--open");
    menu.setAttribute("aria-hidden", "true");
    openButton.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    document.body.classList.add("is-menu-open");
    menu.classList.add("header__mobile-menu--open");
    menu.setAttribute("aria-hidden", "false");
    openButton.setAttribute("aria-expanded", "true");
  };

  const syncHeaderScrollState = () => {
    const currentScrollY = Math.max(window.scrollY, 0);

    if (currentScrollY === 0) {
      header.classList.remove("header--glass");
    } else if (currentScrollY > lastScrollY) {
      header.classList.add("header--glass");
    } else if (currentScrollY < lastScrollY) {
      header.classList.remove("header--glass");
    }

    lastScrollY = currentScrollY;
    isScrollTicking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (isScrollTicking) {
        return;
      }

      window.requestAnimationFrame(syncHeaderScrollState);
      isScrollTicking = true;
    },
    { passive: true },
  );

  openButton.addEventListener("click", openMenu);
  closeButton.addEventListener("click", closeMenu);

  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  desktopQuery.addEventListener("change", (event) => {
    if (event.matches) {
      closeMenu();
    }
  });
};

const initHeroSlider = () => {
  const sliderElement = document.querySelector("[data-hero-slider]");

  if (!sliderElement || typeof KeenSlider === "undefined") {
    return;
  }

  const previousButton = document.querySelector("[data-hero-prev]");
  const nextButton = document.querySelector("[data-hero-next]");
  const paginationButtons = Array.from(document.querySelectorAll("[data-hero-bullet]"));
  const compactPaginationQuery = window.matchMedia("(max-width: 768px)");
  let animationFrameId = 0;
  let progressStartedAt = 0;

  const getVisiblePaginationCount = () => {
    if (compactPaginationQuery.matches) {
      return Math.min(HERO_COMPACT_PAGINATION_COUNT, paginationButtons.length);
    }

    return paginationButtons.length;
  };

  const syncPaginationMode = () => {
    const visiblePaginationCount = getVisiblePaginationCount();

    paginationButtons.forEach((button) => {
      const buttonIndex = Number(button.dataset.heroBullet);
      const isHiddenCompactButton =
        compactPaginationQuery.matches && buttonIndex >= visiblePaginationCount;

      button.hidden = isHiddenCompactButton;

      if (compactPaginationQuery.matches) {
        button.setAttribute("aria-hidden", "true");
        button.tabIndex = -1;
        return;
      }

      button.removeAttribute("aria-hidden");
      button.tabIndex = 0;
    });
  };

  const setBulletProgress = (activeIndex, progress) => {
    const visiblePaginationCount = getVisiblePaginationCount();
    const currentIndex = activeIndex % visiblePaginationCount;

    paginationButtons.forEach((button, index) => {
      const isVisible = index < visiblePaginationCount;
      const isComplete = isVisible && index < currentIndex;
      const isActive = isVisible && index === currentIndex;
      const bulletProgress = isComplete ? 1 : isActive ? progress : 0;

      button.hidden = !isVisible && compactPaginationQuery.matches;
      button.classList.toggle("is-complete", isComplete);
      button.classList.toggle("is-active", isActive);
      button.style.setProperty("--hero-progress", `${bulletProgress * 100}%`);
      button.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const stopProgress = () => {
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }
  };

  const getWrappedSlideIndex = (slider, distance) => {
    const details = slider.track.details;
    const slidesCount = details.slides.length;

    return (details.rel + distance + slidesCount) % slidesCount;
  };

  const prepareSlideChange = (targetIndex) => {
    stopProgress();
    setBulletProgress(targetIndex, 0);
  };

  const getNearestSlideIndex = (slider, targetIndex) => {
    const details = slider.track.details;
    const slidesCount = details.slides.length;
    const forwardDistance = (targetIndex - details.rel + slidesCount) % slidesCount;
    const backwardDistance = forwardDistance - slidesCount;
    const distance =
      Math.abs(backwardDistance) < Math.abs(forwardDistance)
        ? backwardDistance
        : forwardDistance;

    return details.abs + distance;
  };

  const startProgress = (slider) => {
    stopProgress();
    progressStartedAt = window.performance.now();

    const activeIndex = slider.track.details.rel;
    setBulletProgress(activeIndex, 0);

    const tick = (currentTime) => {
      const elapsed = currentTime - progressStartedAt;
      const progress = Math.min(elapsed / HERO_SLIDE_DURATION, 1);

      setBulletProgress(activeIndex, progress);

      if (progress >= 1) {
        prepareSlideChange(getWrappedSlideIndex(slider, 1));
        slider.next();
        return;
      }

      animationFrameId = window.requestAnimationFrame(tick);
    };

    animationFrameId = window.requestAnimationFrame(tick);
  };

  const slider = new KeenSlider(sliderElement, {
    loop: true,
    defaultAnimation: {
      duration: 500,
    },
    created(currentSlider) {
      startProgress(currentSlider);
    },
    slideChanged(currentSlider) {
      startProgress(currentSlider);
    },
  });

  previousButton?.addEventListener("click", () => {
    prepareSlideChange(getWrappedSlideIndex(slider, -1));
    slider.prev();
  });

  nextButton?.addEventListener("click", () => {
    prepareSlideChange(getWrappedSlideIndex(slider, 1));
    slider.next();
  });

  paginationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (compactPaginationQuery.matches) {
        return;
      }

      const slideIndex = Number(button.dataset.heroBullet);

      if (Number.isNaN(slideIndex)) {
        return;
      }

      if (slideIndex === slider.track.details.rel) {
        return;
      }

      prepareSlideChange(slideIndex);
      slider.moveToIdx(getNearestSlideIndex(slider, slideIndex), true, { duration: 500 });
    });
  });

  syncPaginationMode();
  compactPaginationQuery.addEventListener("change", syncPaginationMode);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopProgress();
      return;
    }

    startProgress(slider);
  });
};

const getRequiredElement = (root, selector, context) => {
  const element = root.querySelector(selector);

  if (!element) {
    throw new Error(`${context} is missing ${selector}.`);
  }

  return element;
};

const getRequiredDatasetValue = (element, key) => {
  const value = element.dataset[key];

  if (!value) {
    const attributeName = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

    throw new Error(`Product option is missing data-${attributeName}.`);
  }

  return value;
};

const getProductOfferData = (button) => ({
  price: getRequiredDatasetValue(button, "productPrice"),
  stock: getRequiredDatasetValue(button, "productStock"),
  stockProgress: getRequiredDatasetValue(button, "productStockProgress"),
  delivery: getRequiredDatasetValue(button, "productDelivery"),
  pickup: getRequiredDatasetValue(button, "productPickup"),
  storage: getRequiredDatasetValue(button, "productStorage"),
});

const setActiveProductOption = (optionButtons, activeButton) => {
  optionButtons.forEach((optionButton) => {
    const isActive = optionButton === activeButton;

    optionButton.classList.toggle("is-active", isActive);
    optionButton.setAttribute("aria-pressed", String(isActive));
  });
};

const getProductOfferElements = (card) => ({
  price: getRequiredElement(
    card,
    PRODUCT_OFFER_TARGETS.price,
    "Product offer"
  ),
  stock: getRequiredElement(
    card,
    PRODUCT_OFFER_TARGETS.stock,
    "Product offer"
  ),
  stockBar: getRequiredElement(
    card,
    PRODUCT_OFFER_TARGETS.stockBar,
    "Product offer"
  ),
  delivery: getRequiredElement(
    card,
    PRODUCT_OFFER_TARGETS.delivery,
    "Product offer"
  ),
  pickup: getRequiredElement(
    card,
    PRODUCT_OFFER_TARGETS.pickup,
    "Product offer"
  ),
  storage: getRequiredElement(
    card,
    PRODUCT_OFFER_TARGETS.storage,
    "Product offer"
  ),
});

const updateProductOffer = (card, button) => {
  const offerData = getProductOfferData(button);
  const offerElements = getProductOfferElements(card);

  offerElements.price.textContent = offerData.price;
  offerElements.stock.textContent = offerData.stock;
  offerElements.stockBar.style.setProperty(
    "--product-stock-progress",
    offerData.stockProgress
  );
  offerElements.delivery.textContent = offerData.delivery;
  offerElements.pickup.textContent = offerData.pickup;
  offerElements.storage.textContent = offerData.storage;
};

const initProductOptions = (card) => {
  const optionButtons = Array.from(card.querySelectorAll("[data-product-option]"));

  if (!optionButtons.length) {
    return;
  }

  const activeOption = optionButtons.find((button) => button.classList.contains("is-active"));

  if (!activeOption) {
    throw new Error("Product card requires one active product option.");
  }

  setActiveProductOption(optionButtons, activeOption);
  updateProductOffer(card, activeOption);

  card.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const button = event.target.closest("[data-product-option]");

    if (!button || !card.contains(button)) {
      return;
    }

    const currentOptionButtons = Array.from(card.querySelectorAll("[data-product-option]"));

    setActiveProductOption(currentOptionButtons, button);
    updateProductOffer(card, button);
  });
};

const initProductSlider = (card) => {
  const sliderElement = card.querySelector("[data-product-slider]");

  if (!sliderElement || typeof KeenSlider === "undefined") {
    return;
  }

  const slides = Array.from(sliderElement.querySelectorAll(".keen-slider__slide"));

  if (!slides.length) {
    return;
  }

  const previousButton = card.querySelector("[data-product-prev]");
  const nextButton = card.querySelector("[data-product-next]");
  const pagination = card.querySelector("[data-product-pagination]");
  const hasMultipleSlides = slides.length > 1;

  if (previousButton) {
    previousButton.hidden = !hasMultipleSlides;
  }

  if (nextButton) {
    nextButton.hidden = !hasMultipleSlides;
  }

  if (pagination) {
    pagination.hidden = !hasMultipleSlides;
    pagination.replaceChildren();
  }

  if (!hasMultipleSlides) {
    return;
  }

  const paginationButtons = slides.map((slide, index) => {
    const button = document.createElement("button");

    button.className = "product-card__pagination-button";
    button.type = "button";
    button.dataset.productBullet = String(index);
    button.setAttribute("aria-label", `Показать фото ${index + 1}`);

    pagination?.append(button);

    return button;
  });

  const setActiveSlide = (activeIndex) => {
    paginationButtons.forEach((button, index) => {
      const isActive = index === activeIndex;

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const getNearestSlideIndex = (slider, targetIndex) => {
    const details = slider.track.details;
    const slidesCount = details.slides.length;
    const forwardDistance = (targetIndex - details.rel + slidesCount) % slidesCount;
    const backwardDistance = forwardDistance - slidesCount;
    const distance =
      Math.abs(backwardDistance) < Math.abs(forwardDistance)
        ? backwardDistance
        : forwardDistance;

    return details.abs + distance;
  };

  const slider = new KeenSlider(sliderElement, {
    loop: true,
    defaultAnimation: {
      duration: PRODUCT_SLIDE_ANIMATION_DURATION,
    },
    created(currentSlider) {
      setActiveSlide(currentSlider.track.details.rel);
    },
    slideChanged(currentSlider) {
      setActiveSlide(currentSlider.track.details.rel);
    },
  });

  previousButton?.addEventListener("click", () => {
    slider.prev();
  });

  nextButton?.addEventListener("click", () => {
    slider.next();
  });

  paginationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const slideIndex = Number(button.dataset.productBullet);

      if (Number.isNaN(slideIndex) || slideIndex === slider.track.details.rel) {
        return;
      }

      slider.moveToIdx(getNearestSlideIndex(slider, slideIndex), true, {
        duration: PRODUCT_SLIDE_ANIMATION_DURATION,
      });
    });
  });
};

const initProducts = () => {
  const productCards = Array.from(document.querySelectorAll("[data-product-card]"));

  productCards.forEach((card) => {
    initProductOptions(card);
    initProductSlider(card);
  });
};

initModals();
initHeader();
initHeroSlider();
initProducts();
