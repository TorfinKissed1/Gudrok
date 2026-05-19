const HERO_SLIDE_DURATION = 3000;
const HERO_COMPACT_PAGINATION_COUNT = 4;
const MODAL_TRANSITION_DURATION = 300;
const PRODUCT_SLIDE_ANIMATION_DURATION = 500;
const PRODUCT_GALLERY_SEPARATOR = "|";
const QUALITY_SLIDE_ANIMATION_DURATION = 500;
const QUALITY_SLIDE_SPACING = {
  desktop: 41,
  tablet: 24,
  mobile: 8,
};
const WHY_CHOICE_SLIDE_DURATION = 150;
const WHY_CHOICE_DESKTOP_QUERY = "(min-width: 769px) and (hover: hover) and (pointer: fine)";
const PRODUCT_OFFER_TARGETS = {
  price: "[data-product-price-value]",
  stock: "[data-product-stock-text]",
  stockBar: "[data-product-stock-bar]",
  delivery: "[data-product-delivery-value]",
  pickup: "[data-product-pickup-value]",
  storage: "[data-product-storage-text]",
};
const SALE_DEFAULT_QUANTITY = 1;
const SALE_FRACTION_DIGITS = 1;
const SALE_PROGRESS_UNIT = "%";
const PHONE_MAX_LENGTH = 18;
const PHONE_PATTERN = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
const NAME_DIGIT_PATTERN = /\d/;
const NAME_DIGITS_PATTERN = /\d/g;
const GUDROK_MAP_COORDS = [53.221724, 44.948235];
const GUDROK_MAP_ZOOM = 12;
const GUDROK_MAP_ADDRESS = "г. Пенза, ул. Лозицкой, 4/1";
const MAP_SCROLL_ZOOM_DELAY = 50;
const MAP_DESKTOP_QUERY = "(hover: hover) and (pointer: fine)";
const MAP_PLACEMARK_DESKTOP = {
  offset: [-40, -88],
  shape: [
    [-40, -88],
    [40, 0],
  ],
};
const MAP_PLACEMARK_MOBILE = {
  offset: [-28, -62],
  shape: [
    [-28, -62],
    [28, 0],
  ],
};
const MAP_MOBILE_QUERY = "(max-width: 768px)";

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
  const desktopModalQuery = window.matchMedia("(min-width: 769px)");
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeDialog = null;
  let lastFocusedElement = null;
  let closeTimerId = 0;

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

    window.clearTimeout(closeTimerId);
    closeHeaderMenu();

    if (modal.hidden) {
      lastFocusedElement = document.activeElement;
    }

    dialogs.forEach((dialog) => {
      dialog.hidden = dialog !== nextDialog;
    });

    activeDialog = nextDialog;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    modal.classList.toggle("modal--compact", nextDialog.hasAttribute("data-modal-compact"));
    document.body.classList.add("is-modal-open");
    resetFormState(nextDialog);
    modal.getBoundingClientRect();

    window.requestAnimationFrame(() => {
      modal.classList.add("modal--open");
      const focusableElements = getFocusableElements(nextDialog);
      focusableElements[0]?.focus();
    });
  };

  const closeModal = () => {
    if (modal.hidden || !modal.classList.contains("modal--open")) {
      return;
    }

    modal.classList.remove("modal--open");
    modal.setAttribute("aria-hidden", "true");

    closeTimerId = window.setTimeout(
      () => {
        modal.hidden = true;
        dialogs.forEach((dialog) => {
          dialog.hidden = true;
        });
        modal.classList.remove("modal--compact");
        document.body.classList.remove("is-modal-open");
        activeDialog = null;

        if (lastFocusedElement instanceof HTMLElement) {
          lastFocusedElement.focus();
        }
      },
      reduceMotionQuery.matches ? 0 : MODAL_TRANSITION_DURATION,
    );
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

  modal.addEventListener("click", (event) => {
    const isInsideDialog =
      event.target instanceof Element && event.target.closest("[data-modal-dialog]");
    const shouldCloseOnOutsideClick =
      desktopModalQuery.matches || activeDialog?.hasAttribute("data-modal-click-outside-close");

    if (!isInsideDialog && shouldCloseOnOutsideClick) {
      closeModal();
    }
  });

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!validateForm(form)) {
        return;
      }

      showDialog(form.dataset.successDialog);
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

const getProductGalleryImages = (button, key) =>
  getRequiredDatasetValue(button, key)
    .split(PRODUCT_GALLERY_SEPARATOR)
    .map((image) => image.trim())
    .filter(Boolean);

const getProductGalleryData = (button) => ({
  desktop: getProductGalleryImages(button, "productGallery"),
  mobile: getProductGalleryImages(button, "productGalleryMobile"),
});

const getCssUrlValue = (url) => `url("${url.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}")`;

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

const updateProductGallery = (card, button) => {
  const slides = Array.from(card.querySelectorAll("[data-product-slide]"));

  if (!slides.length) {
    return;
  }

  const galleryData = getProductGalleryData(button);
  const hasMatchingGalleryLength =
    galleryData.desktop.length === slides.length &&
    galleryData.mobile.length === slides.length;

  if (!hasMatchingGalleryLength) {
    throw new Error("Product gallery image count must match product slides count.");
  }

  slides.forEach((slide, index) => {
    slide.style.setProperty("--product-slide-image", getCssUrlValue(galleryData.desktop[index]));
    slide.style.setProperty(
      "--product-slide-image-mobile",
      getCssUrlValue(galleryData.mobile[index])
    );
  });
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
  updateProductGallery(card, activeOption);

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
    updateProductGallery(card, button);
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

const initCustomOrderSlider = (card) => {
  const sliderElement = card.querySelector("[data-custom-order-slider]");

  if (!sliderElement || typeof KeenSlider === "undefined") {
    return;
  }

  const slides = Array.from(sliderElement.querySelectorAll(".keen-slider__slide"));

  if (!slides.length) {
    return;
  }

  const previousButton = card.querySelector("[data-custom-order-prev]");
  const nextButton = card.querySelector("[data-custom-order-next]");
  const pagination = card.querySelector("[data-custom-order-pagination]");
  const badge = card.querySelector("[data-custom-order-badge]");
  const badgeLabel = card.querySelector("[data-custom-order-badge-label]");
  const badgeDivider = card.querySelector("[data-custom-order-badge-divider]");
  const badgeValue = card.querySelector("[data-custom-order-badge-value]");
  const counter = card.querySelector("[data-custom-order-counter]");
  const currentElement = card.querySelector("[data-custom-order-current]");
  const totalElement = card.querySelector("[data-custom-order-total]");
  const hasMultipleSlides = slides.length > 1;
  const detailSlideIndexes = slides.reduce((indexes, slide, index) => {
    if (slide.dataset.customOrderLabel || slide.dataset.customOrderValue) {
      indexes.push(index);
    }

    return indexes;
  }, []);
  const totalDetailSlides = String(detailSlideIndexes.length);

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

    button.className = "custom-order-card__pagination-button";
    button.type = "button";
    button.dataset.customOrderBullet = String(index);
    button.setAttribute("aria-label", `Показать фото ${index + 1}`);

    pagination?.append(button);

    return button;
  });

  const setActiveSlide = (activeIndex) => {
    const activeSlide = slides[activeIndex];
    const label = activeSlide?.dataset.customOrderLabel || "";
    const value = activeSlide?.dataset.customOrderValue || "";
    const hasLabel = Boolean(label || value);
    const detailSlideNumber = detailSlideIndexes.indexOf(activeIndex) + 1;

    card.classList.toggle("is-detail-slide", hasLabel);

    if (badge) {
      badge.hidden = !hasLabel;
    }

    if (counter) {
      counter.hidden = !hasLabel;
    }

    if (badgeLabel) {
      badgeLabel.textContent = label;
      badgeLabel.hidden = !label;
    }

    if (badgeDivider) {
      badgeDivider.hidden = !label || !value;
    }

    if (badgeValue) {
      badgeValue.textContent = value;
      badgeValue.hidden = !value;
    }

    if (currentElement) {
      currentElement.textContent = String(detailSlideNumber);
    }

    if (totalElement) {
      totalElement.textContent = `/${totalDetailSlides}`;
    }

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
      const slideIndex = Number(button.dataset.customOrderBullet);

      if (Number.isNaN(slideIndex) || slideIndex === slider.track.details.rel) {
        return;
      }

      slider.moveToIdx(getNearestSlideIndex(slider, slideIndex), true, {
        duration: PRODUCT_SLIDE_ANIMATION_DURATION,
      });
    });
  });
};

const parseSaleNumber = (card, key, fallback = 0) => {
  const value = Number(card.dataset[key]);

  return Number.isFinite(value) ? value : fallback;
};

const parseSaleProgress = (card) => {
  const value = Number.parseFloat(card.dataset.saleStockProgress || "");

  return Number.isFinite(value) ? value : 0;
};

const formatSaleNumber = (value) => {
  const roundedValue = Math.round((value + Number.EPSILON) * 10) / 10;
  const hasFraction = !Number.isInteger(roundedValue);

  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: hasFraction ? SALE_FRACTION_DIGITS : 0,
    maximumFractionDigits: SALE_FRACTION_DIGITS,
  }).format(roundedValue);
};

const getPalletWord = (value) => {
  if (!Number.isInteger(value)) {
    return "поддонов";
  }

  const absoluteValue = Math.abs(value);
  const lastTwoDigits = absoluteValue % 100;
  const lastDigit = absoluteValue % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "поддонов";
  }

  if (lastDigit === 1) {
    return "поддон";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "поддона";
  }

  return "поддонов";
};

const getSaleMaxQuantity = (card) => {
  const configuredMaxQuantity = parseSaleNumber(card, "saleMaxQuantity");

  if (configuredMaxQuantity > 0) {
    return Math.floor(configuredMaxQuantity);
  }

  const stockPallets = parseSaleNumber(card, "saleStockPallets");
  const stepPallets = parseSaleNumber(card, "saleStepPallets", SALE_DEFAULT_QUANTITY);

  return Math.max(SALE_DEFAULT_QUANTITY, Math.floor(stockPallets / stepPallets));
};

const getSaleQuantity = (card) => {
  const quantity = Number(card.dataset.saleQuantity);

  return Number.isFinite(quantity) ? quantity : 0;
};

const setSaleQuantity = (card, quantity) => {
  const maxQuantity = getSaleMaxQuantity(card);
  const nextQuantity = Math.min(Math.max(quantity, 0), maxQuantity);

  card.dataset.saleQuantity = String(nextQuantity);
};

const updateSaleCard = (card) => {
  const quantity = getSaleQuantity(card);
  const activeQuantity = quantity > 0 ? quantity : 0;
  const displayQuantity = activeQuantity || SALE_DEFAULT_QUANTITY;
  const stockArea = parseSaleNumber(card, "saleStockArea");
  const stockPallets = parseSaleNumber(card, "saleStockPallets");
  const stepArea = parseSaleNumber(card, "saleStepArea");
  const stepPallets = parseSaleNumber(card, "saleStepPallets", SALE_DEFAULT_QUANTITY);
  const initialProgress = parseSaleProgress(card);
  const remainingArea = Math.max(0, stockArea - stepArea * activeQuantity);
  const remainingPallets = Math.max(0, stockPallets - stepPallets * activeQuantity);
  const stockProgress =
    stockArea > 0 ? initialProgress * (remainingArea / stockArea) : initialProgress;
  const stockAreaElement = card.querySelector("[data-sale-stock-area-text]");
  const stockPalletsElement = card.querySelector("[data-sale-stock-pallets-text]");
  const quantityAreaElement = card.querySelector("[data-sale-quantity-area]");
  const quantityPalletsElement = card.querySelector("[data-sale-quantity-pallets]");
  const stockBar = card.querySelector("[data-sale-stock-bar]");
  const minusButton = card.querySelector("[data-sale-quantity-minus]");
  const plusButton = card.querySelector("[data-sale-quantity-plus]");
  const orderButton = card.querySelector("[data-sale-order]");
  const maxQuantity = getSaleMaxQuantity(card);

  card.classList.toggle("is-added", activeQuantity > 0);
  stockAreaElement.textContent = formatSaleNumber(remainingArea);
  stockPalletsElement.textContent = formatSaleNumber(remainingPallets);
  quantityAreaElement.textContent = formatSaleNumber(stepArea * displayQuantity);
  quantityPalletsElement.textContent = `${formatSaleNumber(stepPallets * displayQuantity)} ${getPalletWord(
    stepPallets * displayQuantity
  )}`;
  stockBar.style.setProperty(
    "--sale-stock-progress",
    `${Math.max(0, stockProgress)}${SALE_PROGRESS_UNIT}`
  );
  minusButton.disabled = activeQuantity <= 0;
  plusButton.disabled = displayQuantity >= maxQuantity;
  if (orderButton) {
    orderButton.disabled = activeQuantity <= 0;
  }
};

const initSaleCard = (card) => {
  const addButton = card.querySelector("[data-sale-add]");
  const minusButton = card.querySelector("[data-sale-quantity-minus]");
  const plusButton = card.querySelector("[data-sale-quantity-plus]");

  if (!addButton || !minusButton || !plusButton) {
    return;
  }

  updateSaleCard(card);

  addButton.addEventListener("click", () => {
    setSaleQuantity(card, SALE_DEFAULT_QUANTITY);
    updateSaleCard(card);
  });

  minusButton.addEventListener("click", () => {
    setSaleQuantity(card, getSaleQuantity(card) - SALE_DEFAULT_QUANTITY);
    updateSaleCard(card);
  });

  plusButton.addEventListener("click", () => {
    setSaleQuantity(card, getSaleQuantity(card) + SALE_DEFAULT_QUANTITY);
    updateSaleCard(card);
  });
};

const initProducts = () => {
  const productCards = Array.from(document.querySelectorAll("[data-product-card]"));

  productCards.forEach((card) => {
    initProductOptions(card);
    initProductSlider(card);
  });
};

const initCustomOrder = () => {
  const cards = Array.from(document.querySelectorAll(".custom-order-card"));

  cards.forEach(initCustomOrderSlider);
};

const initWhyChoiceSlider = (slider) => {
  const slides = Array.from(slider.querySelectorAll("[data-why-choice-slide]"));

  if (!slides.length) {
    return;
  }

  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopInteractionQuery = window.matchMedia(WHY_CHOICE_DESKTOP_QUERY);
  let intervalId;
  let isPlaying = false;

  if (activeIndex < 0) {
    activeIndex = 0;
  }

  const setActiveSlide = (nextIndex) => {
    activeIndex = nextIndex % slides.length;

    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === activeIndex);
    });

    slider.dataset.choiceTone = slides[activeIndex].dataset.choiceTone || "light";
  };

  const stopSlider = () => {
    if (!intervalId) {
      isPlaying = false;
      slider.classList.remove("is-playing");
      slider.setAttribute("aria-pressed", "false");
      return;
    }

    window.clearInterval(intervalId);
    intervalId = undefined;
    isPlaying = false;
    slider.classList.remove("is-playing");
    slider.setAttribute("aria-pressed", "false");
  };

  const startSlider = () => {
    stopSlider();

    if (slides.length < 2 || reduceMotionQuery.matches) {
      return;
    }

    isPlaying = true;
    slider.classList.add("is-playing");
    slider.setAttribute("aria-pressed", "true");

    intervalId = window.setInterval(() => {
      setActiveSlide(activeIndex + 1);
    }, WHY_CHOICE_SLIDE_DURATION);
  };

  const toggleSlider = () => {
    if (isPlaying) {
      stopSlider();
      return;
    }

    startSlider();
  };

  slider.setAttribute("role", "button");
  slider.setAttribute("tabindex", "0");
  slider.setAttribute("aria-pressed", "false");
  slider.setAttribute("aria-label", "Показать выбор форм и цветов");

  slider.addEventListener("mouseenter", () => {
    if (desktopInteractionQuery.matches) {
      startSlider();
    }
  });

  slider.addEventListener("mouseleave", () => {
    if (desktopInteractionQuery.matches) {
      stopSlider();
    }
  });

  slider.addEventListener("focusin", () => {
    if (desktopInteractionQuery.matches) {
      startSlider();
    }
  });

  slider.addEventListener("focusout", () => {
    if (desktopInteractionQuery.matches) {
      stopSlider();
    }
  });

  slider.addEventListener("click", () => {
    if (!desktopInteractionQuery.matches) {
      toggleSlider();
    }
  });

  slider.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    toggleSlider();
  });

  setActiveSlide(activeIndex);

  reduceMotionQuery.addEventListener("change", () => {
    if (reduceMotionQuery.matches) {
      stopSlider();
    }
  });

  desktopInteractionQuery.addEventListener("change", stopSlider);
};

const initWhy = () => {
  const choiceSliders = Array.from(document.querySelectorAll("[data-why-choice-slider]"));

  choiceSliders.forEach(initWhyChoiceSlider);
};

const initQualityPanel = (panel) => {
  const sliderElement = panel.querySelector("[data-quality-slider]");

  if (!sliderElement || typeof KeenSlider === "undefined") {
    return undefined;
  }

  const slides = Array.from(sliderElement.querySelectorAll(".keen-slider__slide"));
  const previousButton = panel.querySelector("[data-quality-prev]");
  const nextButton = panel.querySelector("[data-quality-next]");
  const hasMultipleSlides = slides.length > 1;
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (previousButton) {
    previousButton.hidden = !hasMultipleSlides;
  }

  if (nextButton) {
    nextButton.hidden = !hasMultipleSlides;
  }

  if (!hasMultipleSlides) {
    return undefined;
  }

  const slider = new KeenSlider(sliderElement, {
    loop: true,
    defaultAnimation: {
      duration: reduceMotionQuery.matches ? 0 : QUALITY_SLIDE_ANIMATION_DURATION,
    },
    slides: {
      perView: "auto",
      spacing: QUALITY_SLIDE_SPACING.desktop,
      origin: "auto",
    },
    breakpoints: {
      "(max-width: 1240px)": {
        slides: {
          perView: "auto",
          spacing: QUALITY_SLIDE_SPACING.tablet,
          origin: "auto",
        },
      },
      "(max-width: 768px)": {
        slides: {
          perView: "auto",
          spacing: QUALITY_SLIDE_SPACING.mobile,
          origin: "auto",
        },
      },
    },
  });

  previousButton?.addEventListener("click", () => {
    slider.prev();
  });

  nextButton?.addEventListener("click", () => {
    slider.next();
  });

  reduceMotionQuery.addEventListener("change", () => {
    slider.update({
      defaultAnimation: {
        duration: reduceMotionQuery.matches ? 0 : QUALITY_SLIDE_ANIMATION_DURATION,
      },
    });
  });

  return slider;
};

const initQuality = () => {
  const sections = Array.from(document.querySelectorAll("[data-quality]"));

  sections.forEach((section) => {
    const tabs = Array.from(section.querySelectorAll("[data-quality-tab]"));
    const panels = Array.from(section.querySelectorAll("[data-quality-panel]"));
    const sliders = new Map();

    const setActiveTab = (activeName) => {
      tabs.forEach((tab) => {
        const isActive = tab.dataset.qualityTab === activeName;

        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
        tab.tabIndex = isActive ? 0 : -1;
      });

      panels.forEach((panel) => {
        const isActive = panel.dataset.qualityPanel === activeName;

        panel.classList.toggle("is-active", isActive);
        panel.hidden = !isActive;

        if (!isActive) {
          return;
        }

        if (!sliders.has(activeName)) {
          sliders.set(activeName, initQualityPanel(panel));
          return;
        }

        sliders.get(activeName)?.update();
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        setActiveTab(tab.dataset.qualityTab);
      });

      tab.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
          return;
        }

        event.preventDefault();

        const direction = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (index + direction + tabs.length) % tabs.length;
        const nextTab = tabs[nextIndex];

        nextTab.focus();
        setActiveTab(nextTab.dataset.qualityTab);
      });
    });

    const activeTab = tabs.find((tab) => tab.classList.contains("is-active")) || tabs[0];

    if (activeTab) {
      setActiveTab(activeTab.dataset.qualityTab);
    }
  });
};

const initFaq = () => {
  const sections = Array.from(document.querySelectorAll("[data-faq]"));
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const transitionHandlers = new WeakMap();
  const animationFrames = new WeakMap();

  const resetFaqAnswerTransition = (answer) => {
    const transitionHandler = transitionHandlers.get(answer);
    const animationFrame = animationFrames.get(answer);

    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrames.delete(answer);
    }

    if (!transitionHandler) {
      return;
    }

    answer.removeEventListener("transitionend", transitionHandler);
    transitionHandlers.delete(answer);
  };

  const getFaqAnswerHeight = (answer) => {
    const content = answer.firstElementChild;

    if (!content) {
      return answer.scrollHeight;
    }

    return content.getBoundingClientRect().height;
  };

  const queueFaqAnimationFrame = (answer, callback) => {
    const firstFrame = window.requestAnimationFrame(() => {
      const secondFrame = window.requestAnimationFrame(() => {
        animationFrames.delete(answer);
        callback();
      });

      animationFrames.set(answer, secondFrame);
    });

    animationFrames.set(answer, firstFrame);
  };

  const animateFaqAnswer = (answer, shouldOpen) => {
    resetFaqAnswerTransition(answer);

    if (reduceMotionQuery.matches) {
      answer.hidden = !shouldOpen;
      answer.style.height = "";
      answer.style.opacity = "";
      return;
    }

    if (shouldOpen) {
      const startHeight = answer.hidden ? 0 : answer.getBoundingClientRect().height;

      answer.hidden = false;
      answer.style.height = `${startHeight}px`;
      answer.style.opacity = startHeight > 0 ? "1" : "0";

      const onTransitionEnd = (event) => {
        if (event.target !== answer || event.propertyName !== "height") {
          return;
        }

        answer.style.height = "auto";
        resetFaqAnswerTransition(answer);
      };

      transitionHandlers.set(answer, onTransitionEnd);
      answer.addEventListener("transitionend", onTransitionEnd);
      queueFaqAnimationFrame(answer, () => {
        answer.style.height = `${getFaqAnswerHeight(answer)}px`;
        answer.style.opacity = "1";
      });
      return;
    }

    if (answer.hidden) {
      return;
    }

    answer.style.height = `${answer.getBoundingClientRect().height}px`;
    answer.style.opacity = "1";

    const onTransitionEnd = (event) => {
      if (event.target !== answer || event.propertyName !== "height") {
        return;
      }

      answer.hidden = true;
      answer.style.height = "";
      answer.style.opacity = "";
      resetFaqAnswerTransition(answer);
    };

    transitionHandlers.set(answer, onTransitionEnd);
    answer.addEventListener("transitionend", onTransitionEnd);
    queueFaqAnimationFrame(answer, () => {
      answer.style.height = "0px";
      answer.style.opacity = "0";
    });
  };

  sections.forEach((section) => {
    const items = Array.from(section.querySelectorAll(".faq__item"));

    const setItemOpen = (targetItem, shouldOpen) => {
      items.forEach((item) => {
        const toggle = item.querySelector("[data-faq-toggle]");
        const answerId = toggle?.getAttribute("aria-controls");
        const answer = answerId ? document.getElementById(answerId) : null;
        const isOpen = item === targetItem && shouldOpen;

        item.classList.toggle("is-open", isOpen);
        toggle?.setAttribute("aria-expanded", isOpen ? "true" : "false");

        if (answer) {
          animateFaqAnswer(answer, isOpen);
        }
      });
    };

    items.forEach((item) => {
      const toggle = item.querySelector("[data-faq-toggle]");

      if (!toggle) {
        return;
      }

      toggle.addEventListener("click", () => {
        setItemOpen(item, toggle.getAttribute("aria-expanded") !== "true");
      });
    });
  });
};

const initSale = () => {
  const saleCards = Array.from(document.querySelectorAll("[data-sale-card]"));

  saleCards.forEach(initSaleCard);
};

const getMapPlacemarkMetrics = (isMobile) =>
  isMobile ? MAP_PLACEMARK_MOBILE : MAP_PLACEMARK_DESKTOP;

const initMapScrollZoomGuard = (map, mapElement) => {
  const desktopQuery = window.matchMedia(MAP_DESKTOP_QUERY);
  let hoverTimerId = 0;
  let isScrollZoomEnabled = true;

  const disableScrollZoom = () => {
    window.clearTimeout(hoverTimerId);
    hoverTimerId = 0;
    map.behaviors.disable("scrollZoom");
    isScrollZoomEnabled = false;
  };

  const scheduleScrollZoom = () => {
    disableScrollZoom();

    if (!desktopQuery.matches) {
      return;
    }

    hoverTimerId = window.setTimeout(() => {
      map.behaviors.enable("scrollZoom");
      isScrollZoomEnabled = true;
      hoverTimerId = 0;
    }, MAP_SCROLL_ZOOM_DELAY);
  };

  const syncScrollZoomMode = () => {
    if (desktopQuery.matches) {
      disableScrollZoom();
      return;
    }

    window.clearTimeout(hoverTimerId);
    hoverTimerId = 0;
    map.behaviors.enable("scrollZoom");
    isScrollZoomEnabled = true;
  };

  syncScrollZoomMode();
  mapElement.addEventListener("pointerenter", scheduleScrollZoom);
  mapElement.addEventListener("pointermove", scheduleScrollZoom);
  mapElement.addEventListener("pointerleave", disableScrollZoom);
  mapElement.addEventListener("wheel", () => {
    if (desktopQuery.matches && !isScrollZoomEnabled) {
      scheduleScrollZoom();
    }
  });
  desktopQuery.addEventListener("change", syncScrollZoomMode);
};

const initYandexMap = () => {
  const mapElement = document.querySelector("[data-yandex-map]");

  if (!mapElement) {
    return;
  }

  const createMap = () => {
    const mobileQuery = window.matchMedia(MAP_MOBILE_QUERY);
    const placemarkLayout = ymaps.templateLayoutFactory.createClass(
      '<img class="map__placemark" src="img/map/marker.svg" width="80" height="88" alt="" aria-hidden="true">',
    );
    const placemark = new ymaps.Placemark(
      GUDROK_MAP_COORDS,
      {
        hintContent: GUDROK_MAP_ADDRESS,
      },
      {
        iconLayout: placemarkLayout,
      },
    );
    const map = new ymaps.Map(
      mapElement,
      {
        center: GUDROK_MAP_COORDS,
        controls: [],
        zoom: GUDROK_MAP_ZOOM,
      },
      {
        suppressMapOpenBlock: true,
        yandexMapDisablePoiInteractivity: true,
      },
    );

    const syncPlacemarkMetrics = () => {
      const metrics = getMapPlacemarkMetrics(mobileQuery.matches);

      placemark.options.set({
        iconOffset: metrics.offset,
        iconShape: {
          type: "Rectangle",
          coordinates: metrics.shape,
        },
      });
    };

    syncPlacemarkMetrics();
    map.geoObjects.add(placemark);
    initMapScrollZoomGuard(map, mapElement);
    mobileQuery.addEventListener("change", syncPlacemarkMetrics);
  };

  const waitForApi = (attempt = 0) => {
    if (typeof ymaps !== "undefined" && typeof ymaps.ready === "function") {
      ymaps.ready(createMap);
      return;
    }

    if (attempt < 60) {
      window.setTimeout(() => waitForApi(attempt + 1), 100);
    }
  };

  waitForApi();
};

initModals();
initHeader();
initHeroSlider();
initProducts();
initCustomOrder();
initWhy();
initQuality();
initFaq();
initSale();
initYandexMap();
