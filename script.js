(() => {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const previousButton = document.querySelector(".previous");
  const nextButton = document.querySelector(".next");
  const currentLabel = document.querySelector(".current-slide");
  const totalLabel = document.querySelector(".total-slides");
  const progressBar = document.querySelector(".progress-track");
  const progressFill = document.querySelector(".progress-fill");
  const progressTitle = document.querySelector(".progress-title");
  const liveStatus = document.querySelector(".live-status");
  let activeIndex = 0;
  let isTransitioning = false;

  function updateControls() {
    const number = activeIndex + 1;
    const title = slides[activeIndex].dataset.progressTitle;
    currentLabel.textContent = String(number).padStart(2, "0");
    totalLabel.textContent = String(slides.length).padStart(2, "0");
    progressTitle.textContent = title;
    progressFill.style.width = `${(number / slides.length) * 100}%`;
    progressBar.setAttribute("aria-valuenow", String(number));
    progressBar.setAttribute("aria-valuemax", String(slides.length));
    previousButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;
  }

  function goToSlide(targetIndex, direction = 1) {
    if (isTransitioning || targetIndex < 0 || targetIndex >= slides.length || targetIndex === activeIndex) return;
    isTransitioning = true;
    const outgoing = slides[activeIndex];
    const incoming = slides[targetIndex];
    const title = incoming.dataset.progressTitle;

    outgoing.style.setProperty("--exit-direction", direction > 0 ? "1" : "-1");
    outgoing.classList.remove("is-active");
    outgoing.classList.add("is-leaving");
    outgoing.setAttribute("aria-hidden", "true");
    incoming.classList.remove("is-leaving");
    incoming.style.setProperty("--entry-direction", direction > 0 ? "1" : "-1");
    incoming.classList.add("is-active");
    incoming.setAttribute("aria-hidden", "false");
    activeIndex = targetIndex;
    updateControls();
    liveStatus.textContent = `Slide ${activeIndex + 1} of ${slides.length}: ${title.toLowerCase()}`;

    window.setTimeout(() => {
      outgoing.classList.remove("is-leaving");
      isTransitioning = false;
    }, 250);
  }

  previousButton.addEventListener("click", () => goToSlide(activeIndex - 1, -1));
  nextButton.addEventListener("click", () => goToSlide(activeIndex + 1, 1));

  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const isTextEntry = event.target instanceof Element
      && event.target.closest("input, textarea, select, [contenteditable='true'], [role='textbox']");
    if (isTextEntry) return;
    if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      if (!document.fullscreenEnabled) {
        liveStatus.textContent = "Fullscreen is not available in this browser.";
        return;
      }

      const fullscreenChange = document.fullscreenElement
        ? document.exitFullscreen()
        : document.documentElement.requestFullscreen();
      fullscreenChange.catch((error) => {
        liveStatus.textContent = `Fullscreen could not be changed: ${error.message}`;
      });
    } else if (event.key === "ArrowRight" || event.key === "PageDown") {
      event.preventDefault();
      goToSlide(activeIndex + 1, 1);
    } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      goToSlide(activeIndex - 1, -1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goToSlide(0, -1);
    } else if (event.key === "End") {
      event.preventDefault();
      goToSlide(slides.length - 1, 1);
    }
  });

  let touchStartX = null;
  document.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0]?.clientX ?? null;
  }, { passive: true });
  document.addEventListener("touchend", (event) => {
    const touchEndX = event.changedTouches[0]?.clientX;
    if (touchStartX === null || touchEndX === undefined) {
      touchStartX = null;
      return;
    }
    const delta = touchEndX - touchStartX;
    if (Math.abs(delta) > 65) goToSlide(activeIndex + (delta < 0 ? 1 : -1), delta < 0 ? 1 : -1);
    touchStartX = null;
  }, { passive: true });

  updateControls();
})();
