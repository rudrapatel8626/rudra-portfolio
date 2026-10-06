/* ==========================================================
   Rudra D Patel - Portfolio (Redesign)
   script.js
   ========================================================== */

(function () {
  "use strict";

  const config = {
    contactEmail: "rdp5125@gmail.com",
  };

  const DOM = {
    themeToggle: document.getElementById("theme-toggle"),
    navLinks: Array.from(document.querySelectorAll(".nav-link")),
    pager: document.getElementById("pager"),
    pages: Array.from(document.querySelectorAll(".page")),
    prevBtn: document.getElementById("prev-btn"),
    nextBtn: document.getElementById("next-btn"),
    dotsContainer: document.getElementById("dots"),
    contactForm: document.getElementById("contact-form"),
    contactStatus: document.getElementById("contact-status"),
  };

  let currentIndex = 0;
  let startX = 0;
  let isDragging = false;

  function init() {
    initTheme();
    buildDots();
    updateActiveCarousel();
    initInteractions();
    initForm();
  }

  /* ---------- 1. THEME TOGGLE ---------- */
  function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    
    if (DOM.themeToggle) {
      DOM.themeToggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
      });
    }
  }

  /* ---------- 2. 3D CAROUSEL LOGIC ---------- */
  function updateActiveCarousel() {
    DOM.pages.forEach((page, idx) => {
      // Clear previous states
      page.classList.remove("is-active", "is-prev", "is-next", "is-hidden-left", "is-hidden-right");

      // Apply 3D Coverflow states
      if (idx === currentIndex) {
        page.classList.add("is-active");
      } else if (idx === currentIndex - 1) {
        page.classList.add("is-prev");
      } else if (idx === currentIndex + 1) {
        page.classList.add("is-next");
      } else if (idx < currentIndex - 1) {
        page.classList.add("is-hidden-left");
      } else {
        page.classList.add("is-hidden-right");
      }
    });

    // Update Navbar Links
    const activeId = DOM.pages[currentIndex].id;
    DOM.navLinks.forEach(link => {
      link.classList.toggle("is-active", link.getAttribute("data-page") === activeId);
    });

    // Update Dots & Buttons
    if (DOM.dotsContainer) {
      Array.from(DOM.dotsContainer.children).forEach((dot, idx) => {
        dot.setAttribute("aria-selected", idx === currentIndex);
      });
    }
    if (DOM.prevBtn) DOM.prevBtn.disabled = currentIndex === 0;
    if (DOM.nextBtn) DOM.nextBtn.disabled = currentIndex === DOM.pages.length - 1;
  }

  function goToPage(index) {
    if (index < 0 || index >= DOM.pages.length) return;
    currentIndex = index;
    updateActiveCarousel();
    // Scroll active card back to top on entry
    DOM.pages[currentIndex].scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- 3. INTERACTIONS (Click & Swipe) ---------- */
  function initInteractions() {
    // Navbar & Link Clicks
    document.querySelectorAll('[data-page]').forEach(el => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const idx = DOM.pages.findIndex(p => p.id === el.getAttribute("data-page"));
        if (idx > -1) goToPage(idx);
      });
    });

    // Click Side Cards to bring them to front
    DOM.pages.forEach((page) => {
      page.addEventListener("click", () => {
        if (page.classList.contains("is-prev")) goToPage(currentIndex - 1);
        if (page.classList.contains("is-next")) goToPage(currentIndex + 1);
      });
    });

    // Arrow Buttons
    if (DOM.prevBtn) DOM.prevBtn.addEventListener("click", () => goToPage(currentIndex - 1));
    if (DOM.nextBtn) DOM.nextBtn.addEventListener("click", () => goToPage(currentIndex + 1));

    // Keyboard Navigation
    window.addEventListener("keydown", (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
      if (e.key === "ArrowLeft") goToPage(currentIndex - 1);
      if (e.key === "ArrowRight") goToPage(currentIndex + 1);
    });

    // Swipe / Mouse Drag Tracking
    DOM.pager.addEventListener("mousedown", dragStart);
    DOM.pager.addEventListener("touchstart", dragStart, { passive: true });
    window.addEventListener("mouseup", dragEnd);
    window.addEventListener("touchend", dragEnd);
  }

  function buildDots() {
    if (!DOM.dotsContainer) return;
    DOM.dotsContainer.innerHTML = "";
    DOM.pages.forEach((page, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-label", `Go to page ${idx + 1}`);
      btn.addEventListener("click", () => goToPage(idx));
      DOM.dotsContainer.appendChild(btn);
    });
  }

  function dragStart(e) {
    if (e.target.closest("a, button, input, textarea")) return;
    isDragging = true;
    startX = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
  }

  function dragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    const endX = e.type.includes("mouse") ? e.pageX : e.changedTouches[0].clientX;
    const diff = startX - endX;

    // Swipe Threshold: 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToPage(currentIndex + 1); // Swiped Left -> Next
      else goToPage(currentIndex - 1);          // Swiped Right -> Prev
    }
  }

  /* ---------- 4. CONTACT FORM VALIDATION ---------- */
  function initForm() {
    if (!DOM.contactForm) return;

    DOM.contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleContactSubmit(DOM.contactForm);
    });
  }

  function handleContactSubmit(form) {
    const nameInput = form.querySelector("#contact-name");
    const emailInput = form.querySelector("#contact-email");
    const msgInput = form.querySelector("#contact-message");

    const nameError = form.querySelector("#contact-name-error");
    const emailError = form.querySelector("#contact-email-error");
    const msgError = form.querySelector("#contact-message-error");

    let isValid = true;

    [nameError, emailError, msgError].forEach((err) => (err.textContent = ""));
    [nameInput, emailInput, msgInput].forEach((input) =>
      input.removeAttribute("aria-invalid")
    );

    if (!nameInput.value.trim()) {
      showFieldError(nameInput, nameError, "Please enter your name.");
      isValid = false;
    }

    const emailValue = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue) {
      showFieldError(emailInput, emailError, "Please enter your email.");
      isValid = false;
    } else if (!emailPattern.test(emailValue)) {
      showFieldError(emailInput, emailError, "Please enter a valid email address.");
      isValid = false;
    }

    if (!msgInput.value.trim()) {
      showFieldError(msgInput, msgError, "Please enter a message.");
      isValid = false;
    }

    if (!isValid) return;

    const subject = encodeURIComponent(`Portfolio Contact from ${nameInput.value.trim()}`);
    const body = encodeURIComponent(
      `Name: ${nameInput.value.trim()}\nEmail: ${emailValue}\n\nMessage:\n${msgInput.value.trim()}`
    );

    const mailtoUrl = `mailto:${config.contactEmail}?subject=${subject}&body=${body}`;

    if (DOM.contactStatus) {
      DOM.contactStatus.className = "form-status is-success";
      DOM.contactStatus.textContent = "Opening your email application...";
    }

    window.location.href = mailtoUrl;
    form.reset();
  }

  function showFieldError(input, errorEl, message) {
    input.setAttribute("aria-invalid", "true");
    if (errorEl) errorEl.textContent = message;
  }

  document.addEventListener("DOMContentLoaded", init);
})();