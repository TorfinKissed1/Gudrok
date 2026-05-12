const HERO_SLIDE_DURATION = 3000;

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

  const syncPaginationMode = () => {
    paginationButtons.forEach((button) => {
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
    paginationButtons.forEach((button, index) => {
      const isComplete = index < activeIndex;
      const isActive = index === activeIndex;
      const bulletProgress = isComplete ? 1 : isActive ? progress : 0;

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

initHeader();
initHeroSlider();
