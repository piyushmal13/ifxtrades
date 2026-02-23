/*
  IFXTrades UI Overlay v1
  Optional enhancement module:
  - feature-flag gate
  - motion toggles
  - button press microinteraction
  - hero reveal animation
  - modal a11y helper (focus trap + Escape close)
  - toast helper API
  - form and table accessibility wiring
*/

(function ifxOverlayBootstrap() {
  "use strict";

  var FLAG_NAME = "feature/ui_overlay_v1";
  var QUERY_KEY = "feature_ui_overlay_v1";
  var FLAG_STORAGE_KEY = "ifx.flag.feature/ui_overlay_v1";
  var SETTINGS_STORAGE_KEY = "ifx.ui_overlay.settings";
  var OVERLAY_READY_EVENT = "ifx-overlay:ready";

  var root = document.documentElement;

  function toBoolean(value) {
    if (typeof value === "boolean") return value;
    if (value == null) return null;
    var normalized = String(value).trim().toLowerCase();
    if (["1", "true", "on", "yes", "enabled"].indexOf(normalized) >= 0) return true;
    if (["0", "false", "off", "no", "disabled"].indexOf(normalized) >= 0) return false;
    return null;
  }

  function readQueryFlag() {
    var params = new URLSearchParams(window.location.search);
    if (!params.has(QUERY_KEY)) return null;
    return toBoolean(params.get(QUERY_KEY));
  }

  function readGlobalFlag() {
    var globalFlags = window.__IFX_FEATURE_FLAGS__;
    if (!globalFlags || typeof globalFlags !== "object") return null;
    return toBoolean(globalFlags[FLAG_NAME]);
  }

  function readDatasetFlag() {
    var htmlFlag = root.getAttribute("data-feature-ui-overlay-v1");
    var bodyFlag = document.body && document.body.getAttribute("data-feature-ui-overlay-v1");
    var candidate = htmlFlag != null ? htmlFlag : bodyFlag;
    return toBoolean(candidate);
  }

  function readStorageFlag() {
    try {
      var stored = window.localStorage.getItem(FLAG_STORAGE_KEY);
      return toBoolean(stored);
    } catch (error) {
      return null;
    }
  }

  function isOverlayEnabled() {
    var fromQuery = readQueryFlag();
    if (fromQuery != null) return fromQuery;

    var fromGlobal = readGlobalFlag();
    if (fromGlobal != null) return fromGlobal;

    var fromDataset = readDatasetFlag();
    if (fromDataset != null) return fromDataset;

    var fromStorage = readStorageFlag();
    if (fromStorage != null) return fromStorage;

    return false;
  }

  function parseJson(rawValue, fallback) {
    try {
      if (!rawValue) return fallback;
      return JSON.parse(rawValue);
    } catch (error) {
      return fallback;
    }
  }

  function readSettings() {
    var defaults = {
      theme: "dark",
      motion: "auto",
      enableHeroReveal: true,
      enableModalA11y: true,
      enableToasts: true
    };

    var runtime = window.__IFX_UI_OVERLAY_SETTINGS__;
    var stored = parseJson(window.localStorage && window.localStorage.getItem(SETTINGS_STORAGE_KEY), {});
    var merged = Object.assign({}, defaults, stored || {}, runtime || {});

    if (["auto", "on", "off"].indexOf(merged.motion) < 0) {
      merged.motion = "auto";
    }
    if (["dark", "light", "auto"].indexOf(merged.theme) < 0) {
      merged.theme = "dark";
    }

    return merged;
  }

  function applyTheme(settings) {
    var selectedTheme = settings.theme;
    if (selectedTheme === "auto") {
      selectedTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    root.setAttribute("data-theme", selectedTheme);
    if (document.body) document.body.setAttribute("data-theme", selectedTheme);
  }

  function applyMotion(settings) {
    var forceOff = settings.motion === "off";
    root.classList.toggle("ifx-motion-off", forceOff);
    if (document.body) document.body.classList.toggle("ifx-motion-off", forceOff);
  }

  function applyRootClass(settings) {
    root.classList.add("ifx-ui-overlay");
    root.setAttribute("data-ifx-overlay", "v1");
    if (document.body) document.body.classList.add("ifx-ui-overlay");

    applyTheme(settings);
    applyMotion(settings);
  }

  function scheduleNonCritical(work) {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(work, { timeout: 500 });
      return;
    }
    window.setTimeout(work, 16);
  }

  function closestInteractive(target) {
    if (!target || !target.closest) return null;
    return target.closest(
      "[data-ifx-button], .ifx-btn, .btn-primary, .btn-secondary, button, [role='button']"
    );
  }

  function initButtonMicrointeractions() {
    document.addEventListener("pointerdown", function onPointerDown(event) {
      var candidate = closestInteractive(event.target);
      if (!candidate || candidate.hasAttribute("disabled") || candidate.getAttribute("aria-disabled") === "true") {
        return;
      }
      candidate.classList.add("ifx-is-pressed");
    });

    var releasePress = function releasePressState(event) {
      var candidate = closestInteractive(event.target);
      if (!candidate) return;
      candidate.classList.remove("ifx-is-pressed");
    };

    document.addEventListener("pointerup", releasePress);
    document.addEventListener("pointercancel", releasePress);
    document.addEventListener("pointerleave", releasePress);
  }

  function initHeroReveal() {
    var revealRoots = Array.prototype.slice.call(document.querySelectorAll("[data-ifx-hero-reveal]"));
    if (!revealRoots.length) return;

    revealRoots.forEach(function setDelays(container) {
      var children = Array.prototype.slice.call(container.children);
      children.forEach(function applyDelay(node, index) {
        node.style.transitionDelay = index * 50 + "ms";
      });
    });

    if (!("IntersectionObserver" in window)) {
      revealRoots.forEach(function showNow(container) {
        container.classList.add("ifx-revealed");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function onIntersect(entries) {
        entries.forEach(function processEntry(entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("ifx-revealed");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18 }
    );

    revealRoots.forEach(function observe(container) {
      observer.observe(container);
    });
  }

  function getFocusableElements(container) {
    return Array.prototype.slice
      .call(
        container.querySelectorAll(
          "a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])"
        )
      )
      .filter(function onlyVisible(el) {
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
      });
  }

  function initModalA11y() {
    var activeModal = null;
    var lastFocused = null;
    var backdrop = document.querySelector("[data-ifx-modal-backdrop]");

    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.setAttribute("data-ifx-modal-backdrop", "");
      backdrop.setAttribute("aria-hidden", "true");
      document.body.appendChild(backdrop);
    }

    function closeModal(modal) {
      if (!modal) return;
      modal.classList.remove("ifx-open");
      modal.setAttribute("aria-hidden", "true");
      modal.setAttribute("hidden", "");
      backdrop.classList.remove("ifx-open");
      activeModal = null;

      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    function openModal(modal) {
      if (!modal) return;
      if (activeModal && activeModal !== modal) closeModal(activeModal);

      lastFocused = document.activeElement;
      modal.removeAttribute("hidden");
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.setAttribute("aria-hidden", "false");
      modal.classList.add("ifx-open");
      modal.setAttribute("data-testid", "ifx-overlay-modal");
      backdrop.classList.add("ifx-open");
      activeModal = modal;

      var focusables = getFocusableElements(modal);
      if (focusables.length) {
        focusables[0].focus();
      } else {
        modal.setAttribute("tabindex", "-1");
        modal.focus();
      }
    }

    function handleOpenClick(target) {
      var trigger = target.closest("[data-ifx-modal-open]");
      if (!trigger) return false;
      var id = trigger.getAttribute("data-ifx-modal-open");
      if (!id) return false;
      var modal = document.querySelector("[data-ifx-modal='" + id + "']");
      if (!modal) return false;
      openModal(modal);
      return true;
    }

    function handleCloseClick(target) {
      var trigger = target.closest("[data-ifx-modal-close]");
      if (!trigger) return false;
      var modal = trigger.closest("[data-ifx-modal]");
      closeModal(modal || activeModal);
      return true;
    }

    document.addEventListener("click", function onDocumentClick(event) {
      if (handleOpenClick(event.target)) return;
      if (handleCloseClick(event.target)) return;
      if (activeModal && event.target === backdrop) {
        closeModal(activeModal);
      }
    });

    document.addEventListener("keydown", function onKeydown(event) {
      if (!activeModal) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal(activeModal);
        return;
      }
      if (event.key !== "Tab") return;

      var focusables = getFocusableElements(activeModal);
      if (!focusables.length) return;

      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      var active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-ifx-modal]")).forEach(function prepModal(modal) {
      modal.setAttribute("hidden", "");
      modal.setAttribute("aria-hidden", "true");
    });
  }

  function initToasts() {
    var region = document.querySelector("[data-ifx-toast-region]");
    if (!region) {
      region = document.createElement("div");
      region.setAttribute("data-ifx-toast-region", "");
      region.setAttribute("aria-live", "polite");
      region.setAttribute("aria-atomic", "false");
      document.body.appendChild(region);
    }

    function showToast(message, options) {
      var config = Object.assign({ type: "info", duration: 3600 }, options || {});
      var toast = document.createElement("div");
      toast.className = "ifx-toast";
      if (config.type === "success") toast.classList.add("ifx-toast--success");
      if (config.type === "warning") toast.classList.add("ifx-toast--warning");
      if (config.type === "error") toast.classList.add("ifx-toast--error");
      toast.setAttribute("role", "status");
      toast.setAttribute("data-testid", "ifx-overlay-toast");
      toast.textContent = String(message || "");
      region.appendChild(toast);

      requestAnimationFrame(function enter() {
        toast.classList.add("ifx-open");
      });

      window.setTimeout(function exit() {
        toast.classList.remove("ifx-open");
        window.setTimeout(function removeNode() {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 240);
      }, config.duration);
    }

    window.IFXOverlay = window.IFXOverlay || {};
    window.IFXOverlay.toast = showToast;
  }

  function initFormA11y() {
    var helperLinks = Array.prototype.slice.call(document.querySelectorAll("[data-ifx-help-for]"));
    helperLinks.forEach(function wireDescription(helpEl) {
      var controlId = helpEl.getAttribute("data-ifx-help-for");
      if (!controlId) return;
      var control = document.getElementById(controlId);
      if (!control) return;

      if (!helpEl.id) {
        helpEl.id = "ifx-help-" + controlId;
      }
      var existing = control.getAttribute("aria-describedby");
      control.setAttribute("aria-describedby", [existing, helpEl.id].filter(Boolean).join(" ").trim());
      helpEl.classList.add("ifx-help-text");
    });

    var controls = Array.prototype.slice.call(
      document.querySelectorAll("input, select, textarea")
    );
    controls.forEach(function wireValidation(control) {
      var syncState = function syncState() {
        if (typeof control.checkValidity !== "function") return;
        control.setAttribute("aria-invalid", String(!control.checkValidity()));
      };
      control.addEventListener("blur", syncState);
      control.addEventListener("input", syncState);
    });
  }

  function initTableSortHints() {
    var sortableHeaders = Array.prototype.slice.call(document.querySelectorAll("th[data-ifx-sortable], [data-ifx-sortable]"));
    sortableHeaders.forEach(function normalizeSortable(header) {
      if (!header.getAttribute("tabindex")) header.setAttribute("tabindex", "0");
      if (!header.getAttribute("role")) header.setAttribute("role", "button");
      if (!header.getAttribute("aria-label")) {
        var label = (header.textContent || "column").trim();
        header.setAttribute("aria-label", "Sort by " + label);
      }
      if (!header.getAttribute("aria-sort")) {
        header.setAttribute("aria-sort", "none");
      }
    });
  }

  function fireReadyEvent(settings) {
    var event = new CustomEvent(OVERLAY_READY_EVENT, {
      detail: {
        version: "1.0.0",
        flag: FLAG_NAME,
        settings: settings
      }
    });
    window.dispatchEvent(event);
  }

  function bootstrap() {
    if (!isOverlayEnabled()) return;

    var settings = readSettings();
    applyRootClass(settings);
    initButtonMicrointeractions();

    scheduleNonCritical(function nonCriticalInit() {
      if (settings.enableHeroReveal) initHeroReveal();
      if (settings.enableModalA11y) initModalA11y();
      initFormA11y();
      initTableSortHints();
      if (settings.enableToasts) initToasts();
    });

    fireReadyEvent(settings);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
  } else {
    bootstrap();
  }
})();

